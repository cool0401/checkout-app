import { EntityManager } from 'typeorm';
import { ConfirmPaymentUseCase } from './confirm-payment.use-case';
import { Product } from '../../../products/domain/product';
import { Customer } from '../../../customers/domain/customer';
import { Transaction } from '../../domain/transaction';
import { TransactionStatus } from '../../domain/transaction-status';
import type { ProductRepositoryPort } from '../../../products/application/ports/product-repository.port';
import type { CustomerRepositoryPort } from '../../../customers/application/ports/customer-repository.port';
import type { TransactionRepositoryPort } from '../ports/transaction-repository.port';
import type { PaymentGatewayPort, PaymentResult } from '../ports/payment-gateway.port';
import { ConfirmPaymentInput } from '../dto/confirm-payment.input';

function buildTransaction(): Transaction {
  return Transaction.create({
    id: 't1',
    reference: 'CHK-1',
    productId: 'p1',
    customerId: 'c1',
    deliveryId: 'd1',
    quantity: 2,
    productAmountInCents: 20000,
    baseFeeInCents: 500,
    deliveryFeeInCents: 800,
    currency: 'COP',
  });
}

function buildProduct(stock = 5): Product {
  return Product.fromPersistence({
    id: 'p1',
    name: 'Headphones',
    description: 'desc',
    priceInCents: 10000,
    stock,
    imageUrl: 'img',
  });
}

const input: ConfirmPaymentInput = {
  transactionId: 't1',
  cardToken: 'tok_test',
  installments: 1,
  acceptanceToken: 'accept_token',
  acceptPersonalAuth: 'auth_token',
};

describe('ConfirmPaymentUseCase', () => {
  function buildUseCase(opts: {
    transaction?: Transaction | null;
    customer?: Customer | null;
    product?: Product | null;
    gateway?: Partial<jest.Mocked<PaymentGatewayPort>>;
  } = {}) {
    const transaction = opts.transaction === undefined ? buildTransaction() : opts.transaction;
    const customer = opts.customer === undefined
      ? Customer.create({ id: 'c1', fullName: 'Jane', email: 'jane@example.com', phone: '300', legalIdType: 'CC', legalIdNumber: '1' })
      : opts.customer;
    const product = opts.product === undefined ? buildProduct() : opts.product;

    const transactions = {
      findById: jest.fn().mockResolvedValue(transaction),
      save: jest.fn().mockResolvedValue(undefined),
      runInTransaction: jest.fn(async (work: (m: EntityManager) => Promise<void>) => work({} as EntityManager)),
    } as unknown as TransactionRepositoryPort;

    const products = {
      findByIdForUpdate: jest.fn().mockResolvedValue(product),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProductRepositoryPort;

    const customers = {
      findById: jest.fn().mockResolvedValue(customer),
    } as unknown as CustomerRepositoryPort;

    const gateway = {
      createPayment: jest.fn(),
      waitForSettlement: jest.fn(),
      ...opts.gateway,
    } as unknown as PaymentGatewayPort;

    const useCase = new ConfirmPaymentUseCase(transactions, products, customers, gateway);
    return { useCase, transactions, products, customers, gateway };
  }

  it('returns NOT_FOUND when the transaction does not exist', async () => {
    const { useCase } = buildUseCase({ transaction: null });
    const result = await useCase.execute(input);
    expect(result.isErr()).toBe(true);
    expect(result.getError().code).toBe('NOT_FOUND');
  });

  it('returns INVALID_TRANSACTION_STATE when the transaction was already settled', async () => {
    const transaction = buildTransaction();
    transaction.settle(TransactionStatus.DECLINED);
    const { useCase } = buildUseCase({ transaction });

    const result = await useCase.execute(input);

    expect(result.isErr()).toBe(true);
    expect(result.getError().code).toBe('INVALID_TRANSACTION_STATE');
  });

  it('returns NOT_FOUND when the customer cannot be loaded', async () => {
    const { useCase } = buildUseCase({ customer: null });
    const result = await useCase.execute(input);
    expect(result.isErr()).toBe(true);
    expect(result.getError().code).toBe('NOT_FOUND');
  });

  it('wraps a gateway failure as PAYMENT_GATEWAY_ERROR', async () => {
    const { useCase } = buildUseCase({
      gateway: { createPayment: jest.fn().mockRejectedValue(new Error('network down')) },
    });

    const result = await useCase.execute(input);

    expect(result.isErr()).toBe(true);
    expect(result.getError().code).toBe('PAYMENT_GATEWAY_ERROR');
  });

  it('settles as APPROVED and decrements stock when the gateway approves immediately', async () => {
    const approved: PaymentResult = {
      gatewayTransactionId: 'wompi-1',
      status: TransactionStatus.APPROVED,
      cardBrand: 'VISA',
      cardLastFour: '4242',
    };
    const { useCase, products } = buildUseCase({
      gateway: { createPayment: jest.fn().mockResolvedValue(approved) },
    });

    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const output = result.getValue();
    expect(output.status).toBe(TransactionStatus.APPROVED);
    expect(output.cardBrand).toBe('VISA');
    expect(output.remainingStock).toBe(3);
    expect(products.save).toHaveBeenCalled();
  });

  it('polls the gateway when the initial response is PENDING, and settles as DECLINED without touching stock', async () => {
    const pending: PaymentResult = { gatewayTransactionId: 'wompi-2', status: TransactionStatus.PENDING, cardBrand: null, cardLastFour: null };
    const declined: PaymentResult = { gatewayTransactionId: 'wompi-2', status: TransactionStatus.DECLINED, cardBrand: 'MASTERCARD', cardLastFour: '1111' };
    const { useCase, products } = buildUseCase({
      gateway: {
        createPayment: jest.fn().mockResolvedValue(pending),
        waitForSettlement: jest.fn().mockResolvedValue(declined),
      },
    });

    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(result.getValue().status).toBe(TransactionStatus.DECLINED);
    expect(products.save).not.toHaveBeenCalled();
  });
});
