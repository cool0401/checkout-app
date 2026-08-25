import { GetProductsUseCase } from './get-products.use-case';
import { Product } from '../../domain/product';
import type { ProductRepositoryPort } from '../ports/product-repository.port';

describe('GetProductsUseCase', () => {
  it('returns all products from the repository', async () => {
    const product = Product.fromPersistence({
      id: 'p1',
      name: 'Headphones',
      description: 'desc',
      priceInCents: 1000,
      stock: 5,
      imageUrl: 'img',
    });
    const repository: jest.Mocked<Pick<ProductRepositoryPort, 'findAll'>> = {
      findAll: jest.fn().mockResolvedValue([product]),
    };

    const useCase = new GetProductsUseCase(repository as unknown as ProductRepositoryPort);
    const result = await useCase.execute();

    expect(result.isOk()).toBe(true);
    expect(result.getValue()).toEqual([product]);
  });
});
