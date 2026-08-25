import { EntityManager, Repository } from 'typeorm';
import { TypeOrmDeliveryRepository } from './typeorm-delivery.repository';
import { DeliveryOrmEntity } from './delivery.orm-entity';
import { Delivery } from '../../domain/delivery';

const row: DeliveryOrmEntity = {
  id: 'd1',
  customerId: 'c1',
  addressLine1: 'Main St',
  city: 'Bogota',
  region: 'Cundinamarca',
  country: 'CO',
  postalCode: '110111',
  phone: '300',
  createdAt: new Date(),
};

describe('TypeOrmDeliveryRepository', () => {
  it('findById maps the row into a domain Delivery', async () => {
    const repository = { findOne: jest.fn().mockResolvedValue(row) } as unknown as Repository<DeliveryOrmEntity>;
    const adapter = new TypeOrmDeliveryRepository(repository);

    const delivery = await adapter.findById('d1');

    expect(delivery).toBeInstanceOf(Delivery);
    expect(delivery?.id).toBe('d1');
  });

  it('findById returns null when no row matches', async () => {
    const repository = { findOne: jest.fn().mockResolvedValue(null) } as unknown as Repository<DeliveryOrmEntity>;
    const adapter = new TypeOrmDeliveryRepository(repository);

    expect(await adapter.findById('missing')).toBeNull();
  });

  it('create persists via the default repository when no manager is given', async () => {
    const create = jest.fn((entity) => entity);
    const save = jest.fn().mockResolvedValue(row);
    const repository = { create, save } as unknown as Repository<DeliveryOrmEntity>;
    const adapter = new TypeOrmDeliveryRepository(repository);
    const delivery = Delivery.create({ id: 'd1', customerId: 'c1', addressLine1: 'Main St', city: 'Bogota', region: 'Cundinamarca', country: 'CO', postalCode: '110111', phone: '300' });

    const saved = await adapter.create(delivery);

    expect(save).toHaveBeenCalled();
    expect(saved.id).toBe('d1');
  });

  it('create persists through the given EntityManager when provided', async () => {
    const create = jest.fn((entity) => entity);
    const save = jest.fn().mockResolvedValue(row);
    const getRepository = jest.fn().mockReturnValue({ create, save });
    const manager = { getRepository } as unknown as EntityManager;
    const adapter = new TypeOrmDeliveryRepository({} as Repository<DeliveryOrmEntity>);
    const delivery = Delivery.create({ id: 'd1', customerId: 'c1', addressLine1: 'Main St', city: 'Bogota', region: 'Cundinamarca', country: 'CO', postalCode: '110111', phone: '300' });

    await adapter.create(delivery, manager);

    expect(getRepository).toHaveBeenCalledWith(DeliveryOrmEntity);
    expect(save).toHaveBeenCalled();
  });
});
