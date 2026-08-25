import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productsSlice';
import checkoutReducer from '../features/checkout/checkoutSlice';
import configReducer from '../features/config/configSlice';
import { savePersistedCheckout } from '../features/checkout/persist';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    checkout: checkoutReducer,
    config: configReducer,
  },
});

store.subscribe(() => {
  savePersistedCheckout(store.getState().checkout);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
