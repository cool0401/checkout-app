import { CreateTransactionUseCase } from './create-transaction.use-case';
import { Product } from '../../../products/domain/product';
import { Customer } from '../../../customers/domain/customer';
import { Delivery } from '../../../deliveries/domain/delivery';
import { Transaction } from '../../domain/transaction';
import type { ProductRepositoryPort } from '../../../products/application/ports/product-repository.port';
import type { CustomerRepositoryPort } from '../../../customers/application/ports/customer-repository.port';
import type { DeliveryRepositoryPort } from '../../../deliveries/application/ports/delivery-repository.port';
import type { TransactionRepositoryPort } from '../ports/transaction-repository.port';
import { CreateTransactionInput } from '../dto/create-transaction.input';

function buildInput(overrides: Partial<CreateTransactionInput> = {}): CreateTransactionInput {
  return {
    productId: 'p1',
    quantity: 2,
    customer: {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '3001234567',
      legalIdType: 'CC',
      legalIdNumber: '123',
    },
    delivery: {
      addressLine1: '123 Main St',
      city: 'Bogota',
      region: 'Cundinamarca',
      country: 'CO',
      postalCode: '110111',
      phone: '3001234567',
    },
    ...overrides,
  };
}

describe('CreateTransactionUseCase', () => {
  const product = Product.fromPersistence({
    id: 'p1',
    name: 'Headphones',
    description: 'desc',
    priceInCents: 10000,
    stock: 5,
    imageUrl: 'img',
  });

  function buildUseCase(productOverride: Product | null = product) {
    const products = { findById: jest.fn().mockResolvedValue(productOverride) } as unknown as ProductRepositoryPort;
    const customers = {
      create: jest.fn(async (customer: Customer) => customer),
    } as unknown as CustomerRepositoryPort;
    const deliveries = {
      create: jest.fn(async (delivery: Delivery) => delivery),
    } as unknown as DeliveryRepositoryPort;
    const transactions = {
      create: jest.fn(async (transaction: Transaction) => transaction),
    } as unknown as TransactionRepositoryPort;
    const configService = {
      get: jest.fn().mockReturnValue({ baseFeeInCents: 500, deliveryFeeInCents: 800, currency: 'COP' }),
    };

    const useCase = new CreateTransactionUseCase(
      products,
      customers,
      deliveries,
      transactions,
      configService as never,
    );

    return { useCase, products, customers, deliveries, transactions };
  }

  it('creates a pending transaction with the fee breakdown', async () => {
    const { useCase } = buildUseCase();

    const result = await useCase.execute(buildInput());

    expect(result.isOk()).toBe(true);
    const output = result.getValue();
    expect(output.productAmountInCents).toBe(20000);
    expect(output.baseFeeInCents).toBe(500);
    expect(output.deliveryFeeInCents).toBe(800);
    expect(output.totalAmountInCents).toBe(21300);
    expect(output.currency).toBe('COP');
    expect(output.reference).toMatch(/^CHK-/);
  });

  it('rejects a missing productId', async () => {
    const { useCase } = buildUseCase();
    const result = await useCase.execute(buildInput({ productId: '' }));
    expect(result.isErr()).toBe(true);
    expect(result.getError().code).toBe('VALIDATION_ERROR');
  });

  it('rejects a non-positive quantity', async () => {
    const { useCase } = buildUseCase();
    const result = await useCase.execute(buildInput({ quantity: 0 }));
    expect(result.isErr()).toBe(true);
    expect(result.getError().code).toBe('VALIDATION_ERROR');
  });

  it('rejects when the customer is missing required fields', async () => {
    const { useCase } = buildUseCase();
    const result = await useCase.execute(
      buildInput({ customer: { fullName: '', email: '', phone: '', legalIdType: '', legalIdNumber: '' } }),
    );
    expect(result.isErr()).toBe(true);
    expect(result.getError().code).toBe('VALIDATION_ERROR');
  });

  it('rejects when the delivery is missing required fields', async () => {
    const { useCase } = buildUseCase();
    const result = await useCase.execute(
      buildInput({ delivery: { addressLine1: '', city: '', region: '', country: '', postalCode: '', phone: '' } }),
    );
    expect(result.isErr()).toBe(true);
    expect(result.getError().code).toBe('VALIDATION_ERROR');
  });

  it('returns NOT_FOUND when the product does not exist', async () => {
    const { useCase } = buildUseCase(null);
    const result = await useCase.execute(buildInput());
    expect(result.isErr()).toBe(true);
    expect(result.getError().code).toBe('NOT_FOUND');
  });

  it('returns INSUFFICIENT_STOCK when the requested quantity exceeds stock', async () => {
    const { useCase } = buildUseCase();
    const result = await useCase.execute(buildInput({ quantity: 99 }));
    expect(result.isErr()).toBe(true);
    expect(result.getError().code).toBe('INSUFFICIENT_STOCK');
  });
});
