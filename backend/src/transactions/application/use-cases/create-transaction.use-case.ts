import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/configuration';
import { DomainError, InsufficientStockError, NotFoundDomainError, ValidationError } from '../../../shared/domain/domain-error';
import { chain, Result } from '../../../shared/domain/result';
import { generateReference } from '../../../shared/domain/reference';
import { Customer } from '../../../customers/domain/customer';
import { CUSTOMER_REPOSITORY } from '../../../customers/application/ports/customer-repository.port';
import type { CustomerRepositoryPort } from '../../../customers/application/ports/customer-repository.port';
import { Delivery } from '../../../deliveries/domain/delivery';
import { DELIVERY_REPOSITORY } from '../../../deliveries/application/ports/delivery-repository.port';
import type { DeliveryRepositoryPort } from '../../../deliveries/application/ports/delivery-repository.port';
import { Product } from '../../../products/domain/product';
import { PRODUCT_REPOSITORY } from '../../../products/application/ports/product-repository.port';
import type { ProductRepositoryPort } from '../../../products/application/ports/product-repository.port';
import { Transaction } from '../../domain/transaction';
import { TRANSACTION_REPOSITORY } from '../ports/transaction-repository.port';
import type { TransactionRepositoryPort } from '../ports/transaction-repository.port';
import { CreateTransactionInput, CreateTransactionOutput } from '../dto/create-transaction.input';

interface Pipeline {
  input: CreateTransactionInput;
  product?: Product;
  customer?: Customer;
  delivery?: Delivery;
  transaction?: Transaction;
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepositoryPort,
    @Inject(DELIVERY_REPOSITORY) private readonly deliveries: DeliveryRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY) private readonly transactions: TransactionRepositoryPort,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async execute(input: CreateTransactionInput): Promise<Result<CreateTransactionOutput, DomainError>> {
    let result: Result<Pipeline, DomainError> = this.validate(input);
    result = await chain(result, (ctx) => this.loadProduct(ctx));
    result = await chain(result, (ctx) => this.checkStock(ctx));
    result = await chain(result, (ctx) => this.persistCustomer(ctx));
    result = await chain(result, (ctx) => this.persistDelivery(ctx));
    result = await chain(result, (ctx) => this.persistTransaction(ctx));

    return result.map((ctx) => this.toOutput(ctx.transaction as Transaction));
  }

  private validate(input: CreateTransactionInput): Result<Pipeline, DomainError> {
    if (!input.productId) {
      return Result.err(new ValidationError('productId is required'));
    }
    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      return Result.err(new ValidationError('quantity must be a positive integer'));
    }
    if (!input.customer?.email || !input.customer?.fullName) {
      return Result.err(new ValidationError('customer fullName and email are required'));
    }
    if (!input.delivery?.addressLine1 || !input.delivery?.city) {
      return Result.err(new ValidationError('delivery address and city are required'));
    }
    return Result.ok({ input });
  }

  private async loadProduct(ctx: Pipeline): Promise<Result<Pipeline, DomainError>> {
    const product = await this.products.findById(ctx.input.productId);
    if (!product) {
      return Result.err(new NotFoundDomainError(`Product ${ctx.input.productId} was not found`));
    }
    return Result.ok({ ...ctx, product });
  }

  private async checkStock(ctx: Pipeline): Promise<Result<Pipeline, DomainError>> {
    const product = ctx.product as Product;
    if (!product.hasStockFor(ctx.input.quantity)) {
      return Result.err(new InsufficientStockError(`Only ${product.stock} unit(s) of ${product.name} left in stock`));
    }
    return Result.ok(ctx);
  }

  private async persistCustomer(ctx: Pipeline): Promise<Result<Pipeline, DomainError>> {
    const customer = Customer.create({ id: randomUUID(), ...ctx.input.customer });
    const saved = await this.customers.create(customer);
    return Result.ok({ ...ctx, customer: saved });
  }

  private async persistDelivery(ctx: Pipeline): Promise<Result<Pipeline, DomainError>> {
    const customer = ctx.customer as Customer;
    const delivery = Delivery.create({ id: randomUUID(), customerId: customer.id, ...ctx.input.delivery });
    const saved = await this.deliveries.create(delivery);
    return Result.ok({ ...ctx, delivery: saved });
  }

  private async persistTransaction(ctx: Pipeline): Promise<Result<Pipeline, DomainError>> {
    const product = ctx.product as Product;
    const customer = ctx.customer as Customer;
    const delivery = ctx.delivery as Delivery;
    const fees = this.configService.get('fees', { infer: true });

    const transaction = Transaction.create({
      id: randomUUID(),
      reference: generateReference(),
      productId: product.id,
      customerId: customer.id,
      deliveryId: delivery.id,
      quantity: ctx.input.quantity,
      productAmountInCents: product.priceInCents * ctx.input.quantity,
      baseFeeInCents: fees.baseFeeInCents,
      deliveryFeeInCents: fees.deliveryFeeInCents,
      currency: fees.currency,
    });
    const saved = await this.transactions.create(transaction);
    return Result.ok({ ...ctx, transaction: saved });
  }

  private toOutput(transaction: Transaction): CreateTransactionOutput {
    const snapshot = transaction.toSnapshot();
    return {
      transactionId: snapshot.id,
      reference: snapshot.reference,
      productAmountInCents: snapshot.productAmountInCents,
      baseFeeInCents: snapshot.baseFeeInCents,
      deliveryFeeInCents: snapshot.deliveryFeeInCents,
      totalAmountInCents: transaction.amountInCents,
      currency: snapshot.currency,
    };
  }
}
