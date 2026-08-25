import { DataSource, EntityManager, Repository } from 'typeorm';
import { TypeOrmTransactionRepository } from './typeorm-transaction.repository';
import { TransactionOrmEntity } from './transaction.orm-entity';
import { Transaction } from '../../domain/transaction';
import { TransactionStatus } from '../../domain/transaction-status';

const row: TransactionOrmEntity = {
  id: 't1',
  reference: 'CHK-1',
  wompiTransactionId: null,
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  quantity: 1,
  productAmountInCents: 1000,
  baseFeeInCents: 100,
  deliveryFeeInCents: 200,
  currency: 'COP',
  status: 'PENDING',
  cardBrand: null,
  cardLastFour: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildTransaction(): Transaction {
  return Transaction.create({
    id: 't1',
    reference: 'CHK-1',
    productId: 'p1',
    customerId: 'c1',
    deliveryId: 'd1',
    quantity: 1,
    productAmountInCents: 1000,
    baseFeeInCents: 100,
    deliveryFeeInCents: 200,
    currency: 'COP',
  });
}

describe('TypeOrmTransactionRepository', () => {
  it('findById maps the row into a domain Transaction', async () => {
    const repository = { findOne: jest.fn().mockResolvedValue(row) } as unknown as Repository<TransactionOrmEntity>;
    const adapter = new TypeOrmTransactionRepository(repository, {} as DataSource);

    const transaction = await adapter.findById('t1');

    expect(transaction).toBeInstanceOf(Transaction);
    expect(transaction?.status).toBe(TransactionStatus.PENDING);
  });

  it('findById returns null when no row matches', async () => {
    const repository = { findOne: jest.fn().mockResolvedValue(null) } as unknown as Repository<TransactionOrmEntity>;
    const adapter = new TypeOrmTransactionRepository(repository, {} as DataSource);

    expect(await adapter.findById('missing')).toBeNull();
  });

  it('create persists via the default repository when no manager is given', async () => {
    const create = jest.fn((entity) => entity);
    const save = jest.fn().mockResolvedValue(row);
    const repository = { create, save } as unknown as Repository<TransactionOrmEntity>;
    const adapter = new TypeOrmTransactionRepository(repository, {} as DataSource);

    const saved = await adapter.create(buildTransaction());

    expect(save).toHaveBeenCalled();
    expect(saved.id).toBe('t1');
  });

  it('save updates the row through the given EntityManager when provided', async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    const getRepository = jest.fn().mockReturnValue({ update });
    const manager = { getRepository } as unknown as EntityManager;
    const adapter = new TypeOrmTransactionRepository({} as Repository<TransactionOrmEntity>, {} as DataSource);

    await adapter.save(buildTransaction(), manager);

    expect(getRepository).toHaveBeenCalledWith(TransactionOrmEntity);
    expect(update).toHaveBeenCalledWith({ id: 't1' }, expect.objectContaining({ id: 't1' }));
  });

  it('runInTransaction delegates to the DataSource', async () => {
    const transaction = jest.fn(async (work: (m: EntityManager) => Promise<string>) => work({} as EntityManager));
    const dataSource = { transaction } as unknown as DataSource;
    const adapter = new TypeOrmTransactionRepository({} as Repository<TransactionOrmEntity>, dataSource);

    const work = jest.fn().mockResolvedValue('done');
    const result = await adapter.runInTransaction(work);

    expect(transaction).toHaveBeenCalledWith(work);
    expect(result).toBe('done');
  });
});
