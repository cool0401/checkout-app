import { GetProductUseCase } from './get-product.use-case';
import { Product } from '../../domain/product';
import type { ProductRepositoryPort } from '../ports/product-repository.port';

describe('GetProductUseCase', () => {
  function buildRepository(product: Product | null) {
    return { findById: jest.fn().mockResolvedValue(product) } as unknown as ProductRepositoryPort;
  }

  it('returns the product when it exists', async () => {
    const product = Product.fromPersistence({
      id: 'p1',
      name: 'Headphones',
      description: 'desc',
      priceInCents: 1000,
      stock: 5,
      imageUrl: 'img',
    });
    const useCase = new GetProductUseCase(buildRepository(product));

    const result = await useCase.execute('p1');

    expect(result.isOk()).toBe(true);
    expect(result.getValue()).toBe(product);
  });

  it('returns a NOT_FOUND error when the product does not exist', async () => {
    const useCase = new GetProductUseCase(buildRepository(null));

    const result = await useCase.execute('missing');

    expect(result.isErr()).toBe(true);
    expect(result.getError().code).toBe('NOT_FOUND');
  });
});
