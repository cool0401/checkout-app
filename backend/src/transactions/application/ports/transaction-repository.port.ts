import { EntityManager } from 'typeorm';
import { Transaction } from '../../domain/transaction';

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface TransactionRepositoryPort {
  findById(id: string): Promise<Transaction | null>;
  create(transaction: Transaction, manager?: EntityManager): Promise<Transaction>;
  save(transaction: Transaction, manager?: EntityManager): Promise<void>;
  /** Runs `work` inside a single DB transaction, passing its EntityManager through. */
  runInTransaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T>;
}
