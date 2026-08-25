export abstract class DomainError {
  abstract readonly code: string;
  constructor(public readonly message: string) {}
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
}

export class NotFoundDomainError extends DomainError {
  readonly code = 'NOT_FOUND';
}

export class InsufficientStockError extends DomainError {
  readonly code = 'INSUFFICIENT_STOCK';
}

export class InvalidTransactionStateError extends DomainError {
  readonly code = 'INVALID_TRANSACTION_STATE';
}

export class PaymentGatewayError extends DomainError {
  readonly code = 'PAYMENT_GATEWAY_ERROR';
}
