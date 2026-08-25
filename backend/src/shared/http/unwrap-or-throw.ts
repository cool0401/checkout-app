import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DomainError } from '../domain/domain-error';
import { Result } from '../domain/result';

const STATUS_BY_CODE: Record<string, new (message: string) => HttpException> = {
  VALIDATION_ERROR: BadRequestException,
  NOT_FOUND: NotFoundException,
  INSUFFICIENT_STOCK: ConflictException,
  INVALID_TRANSACTION_STATE: ConflictException,
  PAYMENT_GATEWAY_ERROR: BadGatewayException,
};

/**
 * Adapter-boundary helper: translates a use case's Result into either the
 * success value or the matching HttpException, keeping controllers thin.
 */
export function unwrapOrThrow<T, E extends DomainError>(result: Result<T, E>): T {
  if (result.isOk()) {
    return result.getValue();
  }
  const error = result.getError();
  const ExceptionClass = STATUS_BY_CODE[error.code] ?? InternalServerErrorException;
  throw new ExceptionClass(error.message);
}
