export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  VOIDED = 'VOIDED',
  ERROR = 'ERROR',
}

export function isTerminalStatus(status: TransactionStatus): boolean {
  return status !== TransactionStatus.PENDING;
}
