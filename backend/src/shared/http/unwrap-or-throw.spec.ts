import { BadGatewayException, BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Result } from '../domain/result';
import {
  DomainError,
  InsufficientStockError,
  InvalidTransactionStateError,
  NotFoundDomainError,
  PaymentGatewayError,
  ValidationError,
} from '../domain/domain-error';
import { unwrapOrThrow } from './unwrap-or-throw';

class UnknownError extends DomainError {
  readonly code = 'SOMETHING_ELSE';
}

describe('unwrapOrThrow', () => {
  it('returns the value when the result is Ok', () => {
    const result = Result.ok<number, DomainError>(7);
    expect(unwrapOrThrow(result)).toBe(7);
  });

  it.each([
    [new ValidationError('bad input'), BadRequestException],
    [new NotFoundDomainError('missing'), NotFoundException],
    [new InsufficientStockError('no stock'), ConflictException],
    [new InvalidTransactionStateError('bad state'), ConflictException],
    [new PaymentGatewayError('gateway down'), BadGatewayException],
    [new UnknownError('mystery'), InternalServerErrorException],
  ])('maps %p to the matching HttpException', (error, ExceptionClass) => {
    const result = Result.err<number, DomainError>(error);
    expect(() => unwrapOrThrow(result)).toThrow(ExceptionClass);
  });
});
