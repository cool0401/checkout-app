import reducer, { fetchProducts } from './productsSlice';
import type { ProductsState } from './productsSlice';
import type { ProductDto } from '../../api/checkoutApi';

const product: ProductDto = {
  id: 'p1',
  name: 'Headphones',
  description: 'desc',
  priceInCents: 1000,
  stock: 5,
  imageUrl: 'img',
};

describe('productsSlice', () => {
  const initialState: ProductsState = { items: [], status: 'idle', error: null };

  it('returns the initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('sets status to loading on pending', () => {
    const state = reducer(initialState, fetchProducts.pending('', undefined));
    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  it('stores the products on fulfilled', () => {
    const state = reducer(initialState, fetchProducts.fulfilled([product], '', undefined));
    expect(state.status).toBe('succeeded');
    expect(state.items).toEqual([product]);
  });

  it('stores the error message on rejected', () => {
    const action = fetchProducts.rejected(new Error('network error'), '', undefined);
    const state = reducer(initialState, action);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('network error');
  });

  it('falls back to a default error message', () => {
    const action = { ...fetchProducts.rejected(new Error(), '', undefined), error: {} };
    const state = reducer(initialState, action);
    expect(state.error).toBe('Failed to load products');
  });
});
