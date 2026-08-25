import { NotFoundException } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { Product } from '../../domain/product';
import { Result } from '../../../shared/domain/result';
import { NotFoundDomainError } from '../../../shared/domain/domain-error';

describe('ProductsController', () => {
  const product = Product.fromPersistence({
    id: 'p1',
    name: 'Headphones',
    description: 'desc',
    priceInCents: 1000,
    stock: 5,
    imageUrl: 'img',
  });

  it('list returns the mapped products', async () => {
    const getProducts = { execute: jest.fn().mockResolvedValue(Result.ok([product])) } as unknown as GetProductsUseCase;
    const getProduct = {} as GetProductUseCase;
    const controller = new ProductsController(getProducts, getProduct);

    const response = await controller.list();

    expect(response).toEqual([
      { id: 'p1', name: 'Headphones', description: 'desc', priceInCents: 1000, stock: 5, imageUrl: 'img' },
    ]);
  });

  it('getById returns the mapped product', async () => {
    const getProducts = {} as GetProductsUseCase;
    const getProduct = { execute: jest.fn().mockResolvedValue(Result.ok(product)) } as unknown as GetProductUseCase;
    const controller = new ProductsController(getProducts, getProduct);

    const response = await controller.getById('p1');

    expect(response.id).toBe('p1');
  });

  it('getById throws NotFoundException when the use case fails', async () => {
    const getProducts = {} as GetProductsUseCase;
    const getProduct = {
      execute: jest.fn().mockResolvedValue(Result.err(new NotFoundDomainError('missing'))),
    } as unknown as GetProductUseCase;
    const controller = new ProductsController(getProducts, getProduct);

    await expect(controller.getById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
