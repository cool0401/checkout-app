import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../shared/domain/result';
import { DomainError, NotFoundDomainError } from '../../../shared/domain/domain-error';
import { Transaction } from '../../domain/transaction';
import { TRANSACTION_REPOSITORY } from '../ports/transaction-repository.port';
import type { TransactionRepositoryPort } from '../ports/transaction-repository.port';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactions: TransactionRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Transaction, DomainError>> {
    const transaction = await this.transactions.findById(id);
    if (!transaction) {
      return Result.err(new NotFoundDomainError(`Transaction ${id} was not found`));
    }
    return Result.ok(transaction);
  }
}
