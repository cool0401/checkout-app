import { startCheckout } from '../features/checkout/checkoutSlice';

describe('store', () => {
  beforeEach(() => {
    jest.resetModules();
    window.localStorage.clear();
  });

  it('wires products, checkout and config reducers, and persists checkout changes', async () => {
    const { store } = await import('./store');

    expect(store.getState()).toEqual(
      expect.objectContaining({
        products: expect.any(Object),
        checkout: expect.any(Object),
        config: expect.any(Object),
      }),
    );

    store.dispatch(startCheckout({ productId: 'p1', productName: 'Headphones', productPriceInCents: 1000, quantity: 1 }));

    const persisted = JSON.parse(window.localStorage.getItem('checkout-state-v1') as string);
    expect(persisted.productId).toBe('p1');
  });
});
