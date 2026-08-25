import { Inject, Injectable } from '@nestjs/common';
import { DomainError, InvalidTransactionStateError, NotFoundDomainError, PaymentGatewayError } from '../../../shared/domain/domain-error';
import { chain, Result } from '../../../shared/domain/result';
import { CUSTOMER_REPOSITORY } from '../../../customers/application/ports/customer-repository.port';
import type { CustomerRepositoryPort } from '../../../customers/application/ports/customer-repository.port';
import { PRODUCT_REPOSITORY } from '../../../products/application/ports/product-repository.port';
import type { ProductRepositoryPort } from '../../../products/application/ports/product-repository.port';
import { TransactionStatus } from '../../domain/transaction-status';
import { Transaction } from '../../domain/transaction';
import { TRANSACTION_REPOSITORY } from '../ports/transaction-repository.port';
import type { TransactionRepositoryPort } from '../ports/transaction-repository.port';
import { PAYMENT_GATEWAY } from '../ports/payment-gateway.port';
import type { PaymentGatewayPort, PaymentResult } from '../ports/payment-gateway.port';
import { ConfirmPaymentInput, ConfirmPaymentOutput } from '../dto/confirm-payment.input';

interface Pipeline {
  input: ConfirmPaymentInput;
  transaction: Transaction;
  customerEmail?: string;
  payment?: PaymentResult;
  remainingStock?: number;
}

@Injectable()
export class ConfirmPaymentUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactions: TransactionRepositoryPort,
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepositoryPort,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGatewayPort,
  ) {}

  async execute(input: ConfirmPaymentInput): Promise<Result<ConfirmPaymentOutput, DomainError>> {
    let result = await this.loadPendingTransaction(input);
    result = await chain(result, (ctx) => this.loadCustomerEmail(ctx));
    result = await chain(result, (ctx) => this.callGateway(ctx));
    result = await chain(result, (ctx) => this.settle(ctx));

    return result.map((ctx) => this.toOutput(ctx));
  }

  private async loadPendingTransaction(input: ConfirmPaymentInput): Promise<Result<Pipeline, DomainError>> {
    const transaction = await this.transactions.findById(input.transactionId);
    if (!transaction) {
      return Result.err(new NotFoundDomainError(`Transaction ${input.transactionId} was not found`));
    }
    if (!transaction.isPending) {
      return Result.err(new InvalidTransactionStateError(`Transaction ${input.transactionId} is already ${transaction.status}`));
    }
    return Result.ok({ input, transaction });
  }

  private async loadCustomerEmail(ctx: Pipeline): Promise<Result<Pipeline, DomainError>> {
    const snapshot = ctx.transaction.toSnapshot();
    const customer = await this.customers.findById(snapshot.customerId);
    if (!customer) {
      return Result.err(new NotFoundDomainError(`Customer ${snapshot.customerId} was not found`));
    }
    return Result.ok({ ...ctx, customerEmail: customer.toSnapshot().email });
  }

  /** Calls Wompi, records the gateway id, then polls until the payment leaves PENDING. */
  private async callGateway(ctx: Pipeline): Promise<Result<Pipeline, DomainError>> {
    try {
      const created = await this.gateway.createPayment({
        reference: ctx.transaction.reference,
        amountInCents: ctx.transaction.amountInCents,
        currency: ctx.transaction.currency,
        customerEmail: ctx.customerEmail as string,
        cardToken: ctx.input.cardToken,
        installments: ctx.input.installments,
        acceptanceToken: ctx.input.acceptanceToken,
        acceptPersonalAuth: ctx.input.acceptPersonalAuth,
      });
      ctx.transaction.submitToGateway(created.gatewayTransactionId);
      await this.transactions.save(ctx.transaction);

      const finalPayment = created.status === TransactionStatus.PENDING
        ? await this.gateway.waitForSettlement(created.gatewayTransactionId)
        : created;

      return Result.ok({ ...ctx, payment: finalPayment });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown payment gateway error';
      return Result.err(new PaymentGatewayError(message));
    }
  }

  /** Settles the transaction and, on approval, decrements stock — all inside one DB transaction. */
  private async settle(ctx: Pipeline): Promise<Result<Pipeline, DomainError>> {
    const payment = ctx.payment as PaymentResult;
    let remainingStock: number | undefined;

    await this.transactions.runInTransaction(async (manager) => {
      const product = await this.products.findByIdForUpdate(ctx.transaction.toSnapshot().productId, manager);
      if (product && payment.status === TransactionStatus.APPROVED) {
        product.decrementStock(ctx.transaction.toSnapshot().quantity);
        await this.products.save(product, manager);
      }
      remainingStock = product?.stock;

      ctx.transaction.settle(payment.status, payment.cardBrand && payment.cardLastFour
        ? { brand: payment.cardBrand, lastFour: payment.cardLastFour }
        : undefined);
      await this.transactions.save(ctx.transaction, manager);
    });

    return Result.ok({ ...ctx, remainingStock });
  }

  private toOutput(ctx: Pipeline): ConfirmPaymentOutput {
    const snapshot = ctx.transaction.toSnapshot();
    return {
      transactionId: snapshot.id,
      reference: snapshot.reference,
      status: snapshot.status,
      amountInCents: ctx.transaction.amountInCents,
      currency: snapshot.currency,
      cardBrand: snapshot.cardBrand,
      cardLastFour: snapshot.cardLastFour,
      productId: snapshot.productId,
      remainingStock: ctx.remainingStock ?? 0,
    };
  }
}
