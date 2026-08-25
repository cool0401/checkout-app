import { Transaction } from './transaction';
import { TransactionStatus } from './transaction-status';

function buildTransaction(): Transaction {
  return Transaction.create({
    id: 't1',
    reference: 'CHK-1',
    productId: 'p1',
    customerId: 'c1',
    deliveryId: 'd1',
    quantity: 2,
    productAmountInCents: 20000,
    baseFeeInCents: 1000,
    deliveryFeeInCents: 2000,
    currency: 'COP',
  });
}

describe('Transaction', () => {
  it('starts life as PENDING with no gateway id or card info', () => {
    const transaction = buildTransaction();
    expect(transaction.status).toBe(TransactionStatus.PENDING);
    expect(transaction.isPending).toBe(true);
    expect(transaction.toSnapshot().wompiTransactionId).toBeNull();
  });

  it('exposes productId and quantity', () => {
    const transaction = buildTransaction();
    expect(transaction.productId).toBe('p1');
    expect(transaction.quantity).toBe(2);
  });

  it('sums product amount and fees into the total amount', () => {
    const transaction = buildTransaction();
    expect(transaction.amountInCents).toBe(20000 + 1000 + 2000);
  });

  it('records the gateway id once submitted', () => {
    const transaction = buildTransaction();
    transaction.submitToGateway('wompi-123');
    expect(transaction.toSnapshot().wompiTransactionId).toBe('wompi-123');
  });

  it('refuses to submit a transaction that is not PENDING', () => {
    const transaction = buildTransaction();
    transaction.settle(TransactionStatus.APPROVED);
    expect(() => transaction.submitToGateway('wompi-123')).toThrow();
  });

  it('settles to a terminal status and stores card info when provided', () => {
    const transaction = buildTransaction();
    transaction.settle(TransactionStatus.APPROVED, { brand: 'VISA', lastFour: '4242' });

    expect(transaction.status).toBe(TransactionStatus.APPROVED);
    expect(transaction.isPending).toBe(false);
    const snapshot = transaction.toSnapshot();
    expect(snapshot.cardBrand).toBe('VISA');
    expect(snapshot.cardLastFour).toBe('4242');
  });

  it('refuses to settle a transaction twice', () => {
    const transaction = buildTransaction();
    transaction.settle(TransactionStatus.DECLINED);
    expect(() => transaction.settle(TransactionStatus.APPROVED)).toThrow();
  });
});
