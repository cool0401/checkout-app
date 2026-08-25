import type { ReactElement } from 'react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import productsReducer from '../features/products/productsSlice';
import checkoutReducer from '../features/checkout/checkoutSlice';
import configReducer from '../features/config/configSlice';

const rootReducer = combineReducers({
  products: productsReducer,
  checkout: checkoutReducer,
  config: configReducer,
});

type TestPreloadedState = Partial<ReturnType<typeof rootReducer>>;

export function buildTestStore(preloadedState?: TestPreloadedState) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, route = '/' }: { preloadedState?: TestPreloadedState; route?: string } = {},
) {
  const store = buildTestStore(preloadedState);
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>,
    ),
  };
}
