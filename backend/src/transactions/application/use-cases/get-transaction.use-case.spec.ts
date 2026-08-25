import { GetTransactionUseCase } from './get-transaction.use-case';
import { Transaction } from '../../domain/transaction';
import type { TransactionRepositoryPort } from '../ports/transaction-repository.port';

describe('GetTransactionUseCase', () => {
  function buildRepository(transaction: Transaction | null) {
    return { findById: jest.fn().mockResolvedValue(transaction) } as unknown as TransactionRepositoryPort;
  }

  it('returns the transaction when it exists', async () => {
    const transaction = Transaction.create({
      id: 't1',
      reference: 'CHK-1',
      productId: 'p1',
      customerId: 'c1',
      deliveryId: 'd1',
      quantity: 1,
      productAmountInCents: 1000,
      baseFeeInCents: 100,
      deliveryFeeInCents: 200,
      currency: 'COP',
    });
    const useCase = new GetTransactionUseCase(buildRepository(transaction));

    const result = await useCase.execute('t1');

    expect(result.isOk()).toBe(true);
    expect(result.getValue()).toBe(transaction);
  });

  it('returns NOT_FOUND when the transaction does not exist', async () => {
    const useCase = new GetTransactionUseCase(buildRepository(null));
    const result = await useCase.execute('missing');
    expect(result.isErr()).toBe(true);
    expect(result.getError().code).toBe('NOT_FOUND');
  });
});
