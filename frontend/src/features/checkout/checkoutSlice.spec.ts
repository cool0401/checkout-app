import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  backToDetails,
  cancelCheckout,
  payWithCard,
  resetCheckout,
  startCheckout,
  submitDetails,
} from './checkoutSlice';
import type { CardInput, CheckoutState } from './checkoutSlice';
import * as checkoutApi from '../../api/checkoutApi';
import * as wompiApi from '../../api/wompiApi';

jest.mock('../../api/checkoutApi');
jest.mock('../../api/wompiApi');

const mockedCheckoutApi = checkoutApi as jest.Mocked<typeof checkoutApi>;
const mockedWompiApi = wompiApi as jest.Mocked<typeof wompiApi>;

function baseState(overrides: Partial<CheckoutState> = {}): CheckoutState {
  return {
    step: 'idle',
    productId: null,
    productName: null,
    productPriceInCents: null,
    quantity: 1,
    customer: null,
    delivery: null,
    transactionId: null,
    reference: null,
    result: null,
    error: null,
    ...overrides,
  };
}

const card: CardInput = {
  number: '4242424242424242',
  cvc: '123',
  expMonth: '12',
  expYear: '2029',
  cardHolder: 'Jane Doe',
  installments: 1,
};

describe('checkoutSlice reducers', () => {
  it('startCheckout resets the flow and stores the selected product/quantity', () => {
    const state = reducer(
      baseState({ error: 'previous error', result: { transactionId: 'old' } as never }),
      startCheckout({ productId: 'p1', productName: 'Headphones', productPriceInCents: 1000, quantity: 2 }),
    );

    expect(state.step).toBe('details');
    expect(state.productId).toBe('p1');
    expect(state.quantity).toBe(2);
    expect(state.error).toBeNull();
    expect(state.result).toBeNull();
  });

  it('submitDetails stores customer/delivery and advances to summary', () => {
    const customer = { fullName: 'Jane', email: 'jane@example.com', phone: '300', legalIdType: 'CC', legalIdNumber: '1' };
    const delivery = { addressLine1: 'St', city: 'Bogota', region: 'Cundinamarca', country: 'CO', postalCode: '1', phone: '300' };

    const state = reducer(baseState({ step: 'details' }), submitDetails({ customer, delivery }));

    expect(state.step).toBe('summary');
    expect(state.customer).toEqual(customer);
    expect(state.delivery).toEqual(delivery);
  });

  it('backToDetails moves the step back to details', () => {
    const state = reducer(baseState({ step: 'summary' }), backToDetails());
    expect(state.step).toBe('details');
  });

  it('cancelCheckout and resetCheckout return to the initial state', () => {
    const dirty = baseState({ step: 'summary', productId: 'p1' });
    expect(reducer(dirty, cancelCheckout())).toEqual(baseState());
    expect(reducer(dirty, resetCheckout())).toEqual(baseState());
  });

  it('payWithCard.pending moves to processing and clears the error', () => {
    const state = reducer(baseState({ step: 'summary', error: 'previous' }), payWithCard.pending('reqId', card));
    expect(state.step).toBe('processing');
    expect(state.error).toBeNull();
  });

  it('payWithCard.fulfilled stores the result and moves to the result step', () => {
    const payload = {
      transactionId: 't1',
      reference: 'CHK-1',
      status: 'APPROVED',
      amountInCents: 1000,
      currency: 'COP',
      cardBrand: 'VISA',
      cardLastFour: '4242',
      productId: 'p1',
      remainingStock: 4,
    };
    const state = reducer(baseState({ step: 'processing' }), payWithCard.fulfilled(payload, 'reqId', card));

    expect(state.step).toBe('result');
    expect(state.result).toEqual(payload);
    expect(state.transactionId).toBe('t1');
    expect(state.reference).toBe('CHK-1');
  });

  it('payWithCard.rejected returns to summary and stores the error message', () => {
    const state = reducer(
      baseState({ step: 'processing' }),
      payWithCard.rejected(new Error('card declined'), 'reqId', card),
    );
    expect(state.step).toBe('summary');
    expect(state.error).toBe('card declined');
  });
});

describe('payWithCard thunk', () => {
  function buildStore(preloaded: CheckoutState) {
    return configureStore({ reducer: { checkout: reducer }, preloadedState: { checkout: preloaded } });
  }

  it('throws when checkout is missing product/customer/delivery', async () => {
    const store = buildStore(baseState());
    const action = await store.dispatch(payWithCard(card));
    expect(action.type).toBe('checkout/payWithCard/rejected');
  });

  it('creates the transaction, tokenizes the card and confirms payment in sequence', async () => {
    const preloaded = baseState({
      step: 'summary',
      productId: 'p1',
      quantity: 1,
      customer: { fullName: 'Jane', email: 'jane@example.com', phone: '300', legalIdType: 'CC', legalIdNumber: '1' },
      delivery: { addressLine1: 'St', city: 'Bogota', region: 'Cundinamarca', country: 'CO', postalCode: '1', phone: '300' },
    });
    const store = buildStore(preloaded);

    mockedCheckoutApi.createTransaction.mockResolvedValue({
      transactionId: 't1',
      reference: 'CHK-1',
      productAmountInCents: 1000,
      baseFeeInCents: 100,
      deliveryFeeInCents: 200,
      totalAmountInCents: 1300,
      currency: 'COP',
    });
    mockedWompiApi.fetchAcceptanceTokens.mockResolvedValue({ acceptanceToken: 'accept', acceptPersonalAuth: 'auth' });
    mockedWompiApi.tokenizeCard.mockResolvedValue('tok_test');
    mockedCheckoutApi.confirmPayment.mockResolvedValue({
      transactionId: 't1',
      reference: 'CHK-1',
      status: 'APPROVED',
      amountInCents: 1300,
      currency: 'COP',
      cardBrand: 'VISA',
      cardLastFour: '4242',
      productId: 'p1',
      remainingStock: 4,
    });

    await store.dispatch(payWithCard(card));

    expect(mockedCheckoutApi.createTransaction).toHaveBeenCalledWith({
      productId: 'p1',
      quantity: 1,
      customer: preloaded.customer,
      delivery: preloaded.delivery,
    });
    expect(mockedWompiApi.tokenizeCard).toHaveBeenCalledWith(card);
    expect(mockedCheckoutApi.confirmPayment).toHaveBeenCalledWith('t1', {
      cardToken: 'tok_test',
      installments: 1,
      acceptanceToken: 'accept',
      acceptPersonalAuth: 'auth',
    });

    const state = store.getState().checkout;
    expect(state.step).toBe('result');
    expect(state.result?.status).toBe('APPROVED');
  });

  it('leaves the checkout on the summary step with an error when the gateway rejects', async () => {
    const preloaded = baseState({
      step: 'summary',
      productId: 'p1',
      customer: { fullName: 'Jane', email: 'jane@example.com', phone: '300', legalIdType: 'CC', legalIdNumber: '1' },
      delivery: { addressLine1: 'St', city: 'Bogota', region: 'Cundinamarca', country: 'CO', postalCode: '1', phone: '300' },
    });
    const store = buildStore(preloaded);

    mockedCheckoutApi.createTransaction.mockResolvedValue({
      transactionId: 't1',
      reference: 'CHK-1',
      productAmountInCents: 1000,
      baseFeeInCents: 100,
      deliveryFeeInCents: 200,
      totalAmountInCents: 1300,
      currency: 'COP',
    });
    mockedWompiApi.fetchAcceptanceTokens.mockResolvedValue({ acceptanceToken: 'accept', acceptPersonalAuth: 'auth' });
    mockedWompiApi.tokenizeCard.mockRejectedValue(new Error('invalid card'));

    await store.dispatch(payWithCard(card));

    const state = store.getState().checkout;
    expect(state.step).toBe('summary');
    expect(state.error).toBe('invalid card');
  });
});
