import { Product } from './product';

function buildProduct(stock: number): Product {
  return Product.fromPersistence({
    id: 'p1',
    name: 'Headphones',
    description: 'Great sound',
    priceInCents: 10000,
    stock,
    imageUrl: 'https://example.com/img.png',
  });
}

describe('Product', () => {
  it('exposes its descriptive fields', () => {
    const product = buildProduct(5);
    expect(product.description).toBe('Great sound');
    expect(product.imageUrl).toBe('https://example.com/img.png');
  });

  it('reports whether it has stock for a given quantity', () => {
    const product = buildProduct(3);
    expect(product.hasStockFor(3)).toBe(true);
    expect(product.hasStockFor(4)).toBe(false);
  });

  it('decrements stock when enough units are available', () => {
    const product = buildProduct(3);
    product.decrementStock(2);
    expect(product.stock).toBe(1);
  });

  it('throws when decrementing more than the available stock', () => {
    const product = buildProduct(1);
    expect(() => product.decrementStock(2)).toThrow();
  });

  it('exposes a snapshot with all its properties', () => {
    const product = buildProduct(5);
    expect(product.toSnapshot()).toEqual({
      id: 'p1',
      name: 'Headphones',
      description: 'Great sound',
      priceInCents: 10000,
      stock: 5,
      imageUrl: 'https://example.com/img.png',
    });
  });
});
