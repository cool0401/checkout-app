import { isTerminalStatus, TransactionStatus } from './transaction-status';

describe('isTerminalStatus', () => {
  it('is false for PENDING', () => {
    expect(isTerminalStatus(TransactionStatus.PENDING)).toBe(false);
  });

  it.each([TransactionStatus.APPROVED, TransactionStatus.DECLINED, TransactionStatus.VOIDED, TransactionStatus.ERROR])(
    'is true for %s',
    (status) => {
      expect(isTerminalStatus(status)).toBe(true);
    },
  );
});
