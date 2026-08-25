import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import PaymentModal from './PaymentModal';

const customer = { fullName: 'Jane', email: 'jane@example.com', phone: '300', legalIdType: 'CC', legalIdNumber: '1' };
const delivery = { addressLine1: 'St', city: 'Bogota', region: 'Cundinamarca', country: 'CO', postalCode: '1', phone: '300' };

function checkoutState(overrides: Record<string, unknown> = {}) {
  return {
    checkout: {
      step: 'details' as const,
      productId: 'p1',
      productName: 'Headphones',
      productPriceInCents: 1000,
      quantity: 1,
      customer: null,
      delivery: null,
      transactionId: null,
      reference: null,
      result: null,
      error: null,
      ...overrides,
    },
  };
}

describe('PaymentModal', () => {
  it('shows the details form on the details step and closes on demand', () => {
    const { store } = renderWithProviders(<PaymentModal />, { preloadedState: checkoutState() });

    expect(screen.getByText('Payment & delivery details')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(store.getState().checkout.step).toBe('idle');
  });

  it('disables the close button while a payment is processing', () => {
    renderWithProviders(<PaymentModal />, { preloadedState: checkoutState({ step: 'processing', customer, delivery }) });
    expect(screen.getByRole('button', { name: /close/i })).toBeDisabled();
  });

  it('sends the checkout back to details when the summary step is reached without card data (e.g. after a refresh)', async () => {
    const { store } = renderWithProviders(<PaymentModal />, { preloadedState: checkoutState({ step: 'summary', customer, delivery }) });

    await waitFor(() => expect(store.getState().checkout.step).toBe('details'));
    expect(screen.getByText('Payment & delivery details')).toBeInTheDocument();
  });
});
