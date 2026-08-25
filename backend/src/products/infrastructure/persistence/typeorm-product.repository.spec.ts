import { EntityManager, Repository } from 'typeorm';
import { TypeOrmProductRepository } from './typeorm-product.repository';
import { ProductOrmEntity } from './product.orm-entity';
import { Product } from '../../domain/product';

const row: ProductOrmEntity = {
  id: 'p1',
  name: 'Headphones',
  description: 'desc',
  priceInCents: 1000,
  stock: 5,
  imageUrl: 'img',
};

describe('TypeOrmProductRepository', () => {
  it('findAll maps every row to a domain Product', async () => {
    const repository = { find: jest.fn().mockResolvedValue([row]) } as unknown as Repository<ProductOrmEntity>;
    const adapter = new TypeOrmProductRepository(repository);

    const products = await adapter.findAll();

    expect(products).toHaveLength(1);
    expect(products[0]).toBeInstanceOf(Product);
    expect(products[0].id).toBe('p1');
  });

  it('findById returns null when no row matches', async () => {
    const repository = { findOne: jest.fn().mockResolvedValue(null) } as unknown as Repository<ProductOrmEntity>;
    const adapter = new TypeOrmProductRepository(repository);

    expect(await adapter.findById('missing')).toBeNull();
  });

  it('findByIdForUpdate locks the row via the given EntityManager', async () => {
    const findOne = jest.fn().mockResolvedValue(row);
    const manager = { findOne } as unknown as EntityManager;
    const adapter = new TypeOrmProductRepository({} as Repository<ProductOrmEntity>);

    const product = await adapter.findByIdForUpdate('p1', manager);

    expect(findOne).toHaveBeenCalledWith(ProductOrmEntity, {
      where: { id: 'p1' },
      lock: { mode: 'pessimistic_write' },
    });
    expect(product?.id).toBe('p1');
  });

  it('save updates the stock column using the default repository when no manager is given', async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    const repository = { update } as unknown as Repository<ProductOrmEntity>;
    const adapter = new TypeOrmProductRepository(repository);
    const product = Product.fromPersistence({ ...row, stock: 2 });

    await adapter.save(product);

    expect(update).toHaveBeenCalledWith({ id: 'p1' }, { stock: 2 });
  });

  it('save updates the stock column through the given EntityManager when provided', async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    const getRepository = jest.fn().mockReturnValue({ update });
    const manager = { getRepository } as unknown as EntityManager;
    const adapter = new TypeOrmProductRepository({} as Repository<ProductOrmEntity>);
    const product = Product.fromPersistence({ ...row, stock: 1 });

    await adapter.save(product, manager);

    expect(getRepository).toHaveBeenCalledWith(ProductOrmEntity);
    expect(update).toHaveBeenCalledWith({ id: 'p1' }, { stock: 1 });
  });
});
