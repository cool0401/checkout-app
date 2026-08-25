import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Transaction } from '../../domain/transaction';
import { TransactionStatus } from '../../domain/transaction-status';
import { TransactionRepositoryPort } from '../../application/ports/transaction-repository.port';
import { TransactionOrmEntity } from './transaction.orm-entity';

@Injectable()
export class TypeOrmTransactionRepository implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repository: Repository<TransactionOrmEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async create(transaction: Transaction, manager?: EntityManager): Promise<Transaction> {
    const repo = manager ? manager.getRepository(TransactionOrmEntity) : this.repository;
    const saved = await repo.save(repo.create(toRow(transaction)));
    return toDomain(saved);
  }

  async save(transaction: Transaction, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(TransactionOrmEntity) : this.repository;
    const row = toRow(transaction);
    await repo.update({ id: row.id }, row);
  }

  async runInTransaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}

function toRow(transaction: Transaction): Partial<TransactionOrmEntity> {
  const snapshot = transaction.toSnapshot();
  return { ...snapshot };
}

function toDomain(row: TransactionOrmEntity): Transaction {
  return Transaction.fromPersistence({
    id: row.id,
    reference: row.reference,
    wompiTransactionId: row.wompiTransactionId,
    productId: row.productId,
    customerId: row.customerId,
    deliveryId: row.deliveryId,
    quantity: row.quantity,
    productAmountInCents: row.productAmountInCents,
    baseFeeInCents: row.baseFeeInCents,
    deliveryFeeInCents: row.deliveryFeeInCents,
    currency: row.currency,
    status: row.status as TransactionStatus,
    cardBrand: row.cardBrand,
    cardLastFour: row.cardLastFour,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}
