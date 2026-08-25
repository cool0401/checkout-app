import { EntityManager, Repository } from 'typeorm';
import { TypeOrmCustomerRepository } from './typeorm-customer.repository';
import { CustomerOrmEntity } from './customer.orm-entity';
import { Customer } from '../../domain/customer';

const row: CustomerOrmEntity = {
  id: 'c1',
  fullName: 'Jane',
  email: 'jane@example.com',
  phone: '300',
  legalIdType: 'CC',
  legalIdNumber: '1',
  createdAt: new Date(),
};

describe('TypeOrmCustomerRepository', () => {
  it('findById maps the row into a domain Customer', async () => {
    const repository = { findOne: jest.fn().mockResolvedValue(row) } as unknown as Repository<CustomerOrmEntity>;
    const adapter = new TypeOrmCustomerRepository(repository);

    const customer = await adapter.findById('c1');

    expect(customer).toBeInstanceOf(Customer);
    expect(customer?.email).toBe('jane@example.com');
  });

  it('findById returns null when no row matches', async () => {
    const repository = { findOne: jest.fn().mockResolvedValue(null) } as unknown as Repository<CustomerOrmEntity>;
    const adapter = new TypeOrmCustomerRepository(repository);

    expect(await adapter.findById('missing')).toBeNull();
  });

  it('create persists via the default repository when no manager is given', async () => {
    const create = jest.fn((entity) => entity);
    const save = jest.fn().mockResolvedValue(row);
    const repository = { create, save } as unknown as Repository<CustomerOrmEntity>;
    const adapter = new TypeOrmCustomerRepository(repository);
    const customer = Customer.create({ id: 'c1', fullName: 'Jane', email: 'jane@example.com', phone: '300', legalIdType: 'CC', legalIdNumber: '1' });

    const saved = await adapter.create(customer);

    expect(save).toHaveBeenCalled();
    expect(saved.email).toBe('jane@example.com');
  });

  it('create persists through the given EntityManager when provided', async () => {
    const create = jest.fn((entity) => entity);
    const save = jest.fn().mockResolvedValue(row);
    const getRepository = jest.fn().mockReturnValue({ create, save });
    const manager = { getRepository } as unknown as EntityManager;
    const adapter = new TypeOrmCustomerRepository({} as Repository<CustomerOrmEntity>);
    const customer = Customer.create({ id: 'c1', fullName: 'Jane', email: 'jane@example.com', phone: '300', legalIdType: 'CC', legalIdNumber: '1' });

    await adapter.create(customer, manager);

    expect(getRepository).toHaveBeenCalledWith(CustomerOrmEntity);
    expect(save).toHaveBeenCalled();
  });
});
