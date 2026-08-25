import {
  InsufficientStockError,
  InvalidTransactionStateError,
  NotFoundDomainError,
  PaymentGatewayError,
  ValidationError,
} from './domain-error';

describe('DomainError subtypes', () => {
  it.each([
    [ValidationError, 'VALIDATION_ERROR'],
    [NotFoundDomainError, 'NOT_FOUND'],
    [InsufficientStockError, 'INSUFFICIENT_STOCK'],
    [InvalidTransactionStateError, 'INVALID_TRANSACTION_STATE'],
    [PaymentGatewayError, 'PAYMENT_GATEWAY_ERROR'],
  ])('%p carries code %s and the given message', (ErrorClass, code) => {
    const error = new ErrorClass('something went wrong');
    expect(error.code).toBe(code);
    expect(error.message).toBe('something went wrong');
  });
});
