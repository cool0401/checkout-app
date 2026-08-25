import axios from 'axios';

jest.mock('axios');

const mockInstance = { get: jest.fn(), post: jest.fn() };
(axios.create as jest.Mock) = jest.fn().mockReturnValue(mockInstance);

import * as checkoutApi from './checkoutApi';

describe('checkoutApi', () => {
  beforeEach(() => {
    mockInstance.get.mockReset();
    mockInstance.post.mockReset();
  });

  it('fetchFees GETs /config/fees', async () => {
    mockInstance.get.mockResolvedValue({ data: { baseFeeInCents: 1, deliveryFeeInCents: 2, currency: 'COP' } });
    const fees = await checkoutApi.fetchFees();
    expect(mockInstance.get).toHaveBeenCalledWith('/config/fees');
    expect(fees.currency).toBe('COP');
  });

  it('fetchProducts GETs /products', async () => {
    mockInstance.get.mockResolvedValue({ data: [{ id: 'p1' }] });
    const products = await checkoutApi.fetchProducts();
    expect(mockInstance.get).toHaveBeenCalledWith('/products');
    expect(products).toEqual([{ id: 'p1' }]);
  });

  it('fetchProduct GETs /products/:id', async () => {
    mockInstance.get.mockResolvedValue({ data: { id: 'p1' } });
    const product = await checkoutApi.fetchProduct('p1');
    expect(mockInstance.get).toHaveBeenCalledWith('/products/p1');
    expect(product.id).toBe('p1');
  });

  it('createTransaction POSTs to /transactions', async () => {
    const input = {
      productId: 'p1',
      quantity: 1,
      customer: { fullName: 'Jane', email: 'jane@example.com', phone: '300', legalIdType: 'CC', legalIdNumber: '1' },
      delivery: { addressLine1: 'St', city: 'Bogota', region: 'Cundinamarca', country: 'CO', postalCode: '1', phone: '300' },
    };
    mockInstance.post.mockResolvedValue({ data: { transactionId: 't1' } });

    const result = await checkoutApi.createTransaction(input);

    expect(mockInstance.post).toHaveBeenCalledWith('/transactions', input);
    expect(result.transactionId).toBe('t1');
  });

  it('confirmPayment POSTs to /transactions/:id/confirm', async () => {
    const input = { cardToken: 'tok', installments: 1, acceptanceToken: 'a', acceptPersonalAuth: 'b' };
    mockInstance.post.mockResolvedValue({ data: { status: 'APPROVED' } });

    const result = await checkoutApi.confirmPayment('t1', input);

    expect(mockInstance.post).toHaveBeenCalledWith('/transactions/t1/confirm', input);
    expect(result.status).toBe('APPROVED');
  });

  it('getTransaction GETs /transactions/:id', async () => {
    mockInstance.get.mockResolvedValue({ data: { id: 't1' } });
    const transaction = await checkoutApi.getTransaction('t1');
    expect(mockInstance.get).toHaveBeenCalledWith('/transactions/t1');
    expect(transaction.id).toBe('t1');
  });
});
