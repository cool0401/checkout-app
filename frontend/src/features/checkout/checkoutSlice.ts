import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as checkoutApi from '../../api/checkoutApi';
import type { ConfirmPaymentResponse, CustomerInput, DeliveryInput } from '../../api/checkoutApi';
import * as wompiApi from '../../api/wompiApi';
import { loadPersistedCheckout } from './persist';

export type CheckoutStep = 'idle' | 'details' | 'summary' | 'processing' | 'result';

export interface CardInput {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
  installments: number;
}

export interface CheckoutState {
  step: CheckoutStep;
  productId: string | null;
  productName: string | null;
  productPriceInCents: number | null;
  quantity: number;
  customer: CustomerInput | null;
  delivery: DeliveryInput | null;
  transactionId: string | null;
  reference: string | null;
  result: ConfirmPaymentResponse | null;
  error: string | null;
}

const initialState: CheckoutState = {
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
};

export const payWithCard = createAsyncThunk<
  ConfirmPaymentResponse,
  CardInput,
  { state: { checkout: CheckoutState } }
>('checkout/payWithCard', async (card, { getState }) => {
  const { checkout } = getState();
  if (!checkout.productId || !checkout.customer || !checkout.delivery) {
    throw new Error('Checkout is missing product, customer or delivery information');
  }

  const created = await checkoutApi.createTransaction({
    productId: checkout.productId,
    quantity: checkout.quantity,
    customer: checkout.customer,
    delivery: checkout.delivery,
  });

  const [acceptanceTokens, cardToken] = await Promise.all([
    wompiApi.fetchAcceptanceTokens(),
    wompiApi.tokenizeCard(card),
  ]);

  return checkoutApi.confirmPayment(created.transactionId, {
    cardToken,
    installments: card.installments,
    acceptanceToken: acceptanceTokens.acceptanceToken,
    acceptPersonalAuth: acceptanceTokens.acceptPersonalAuth,
  });
});

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: loadPersistedCheckout<CheckoutState>() ?? initialState,
  reducers: {
    startCheckout(
      state,
      action: PayloadAction<{ productId: string; productName: string; productPriceInCents: number; quantity: number }>,
    ) {
      Object.assign(state, initialState);
      state.step = 'details';
      state.productId = action.payload.productId;
      state.productName = action.payload.productName;
      state.productPriceInCents = action.payload.productPriceInCents;
      state.quantity = action.payload.quantity;
    },
    submitDetails(state, action: PayloadAction<{ customer: CustomerInput; delivery: DeliveryInput }>) {
      state.customer = action.payload.customer;
      state.delivery = action.payload.delivery;
      state.step = 'summary';
    },
    backToDetails(state) {
      state.step = 'details';
    },
    cancelCheckout() {
      return initialState;
    },
    resetCheckout() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(payWithCard.pending, (state) => {
        state.step = 'processing';
        state.error = null;
      })
      .addCase(payWithCard.fulfilled, (state, action) => {
        state.step = 'result';
        state.result = action.payload;
        state.transactionId = action.payload.transactionId;
        state.reference = action.payload.reference;
      })
      .addCase(payWithCard.rejected, (state, action) => {
        state.step = 'summary';
        state.error = action.error.message ?? 'Payment failed, please try again';
      });
  },
});

export const { startCheckout, submitDetails, backToDetails, cancelCheckout, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
