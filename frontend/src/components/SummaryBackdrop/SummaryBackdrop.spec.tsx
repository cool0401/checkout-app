import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import SummaryBackdrop from './SummaryBackdrop';
import type { CardInput, CheckoutState } from '../../features/checkout/checkoutSlice';
import * as checkoutApi from '../../api/checkoutApi';
import * as wompiApi from '../../api/wompiApi';

jest.mock('../../api/checkoutApi');
jest.mock('../../api/wompiApi');

const mockedCheckoutApi = checkoutApi as jest.Mocked<typeof checkoutApi>;
const mockedWompiApi = wompiApi as jest.Mocked<typeof wompiApi>;

const card: CardInput = {
  number: '4242424242424242',
  cvc: '123',
  expMonth: '12',
  expYear: '2029',
  cardHolder: 'Jane Doe',
  installments: 1,
};

const customer = { fullName: 'Jane', email: 'jane@example.com', phone: '300', legalIdType: 'CC', legalIdNumber: '1' };
const delivery = { addressLine1: 'St', city: 'Bogota', region: 'Cundinamarca', country: 'CO', postalCode: '1', phone: '300' };

function preloadedState(): { checkout: CheckoutState; config: { fees: { baseFeeInCents: number; deliveryFeeInCents: number; currency: string } } } {
  return {
    checkout: {
      step: 'summary',
      productId: 'p1',
      productName: 'Headphones',
      productPriceInCents: 25000000,
      quantity: 2,
      customer,
      delivery,
      transactionId: null,
      reference: null,
      result: null,
      error: null,
    },
    config: { fees: { baseFeeInCents: 500000, deliveryFeeInCents: 800000, currency: 'COP' } },
  };
}

describe('SummaryBackdrop', () => {
  it('renders the fee breakdown and total', () => {
    renderWithProviders(<SummaryBackdrop card={card} />, { preloadedState: preloadedState() });

    expect(screen.getByText(/Headphones × 2/)).toBeInTheDocument();
    expect(screen.getByText('$ 500.000')).toBeInTheDocument();
    expect(screen.getByText('$ 5.000')).toBeInTheDocument();
    expect(screen.getByText('$ 8.000')).toBeInTheDocument();
    expect(screen.getByText('$ 513.000')).toBeInTheDocument();
  });

  it('going back dispatches backToDetails', () => {
    const { store } = renderWithProviders(<SummaryBackdrop card={card} />, { preloadedState: preloadedState() });
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(store.getState().checkout.step).toBe('details');
  });

  it('shows the stored error message when present', () => {
    const state = preloadedState();
    state.checkout.error = 'card declined';
    renderWithProviders(<SummaryBackdrop card={card} />, { preloadedState: state });
    expect(screen.getByRole('alert')).toHaveTextContent('card declined');
  });

  it('paying dispatches payWithCard and reaches the result step on success', async () => {
    mockedCheckoutApi.createTransaction.mockResolvedValue({
      transactionId: 't1',
      reference: 'CHK-1',
      productAmountInCents: 50000000,
      baseFeeInCents: 500000,
      deliveryFeeInCents: 800000,
      totalAmountInCents: 51300000,
      currency: 'COP',
    });
    mockedWompiApi.fetchAcceptanceTokens.mockResolvedValue({ acceptanceToken: 'a', acceptPersonalAuth: 'b' });
    mockedWompiApi.tokenizeCard.mockResolvedValue('tok_test');
    mockedCheckoutApi.confirmPayment.mockResolvedValue({
      transactionId: 't1',
      reference: 'CHK-1',
      status: 'APPROVED',
      amountInCents: 51300000,
      currency: 'COP',
      cardBrand: 'VISA',
      cardLastFour: '4242',
      productId: 'p1',
      remainingStock: 1,
    });

    const { store } = renderWithProviders(<SummaryBackdrop card={card} />, { preloadedState: preloadedState() });

    fireEvent.click(screen.getByRole('button', { name: /pay now/i }));
    expect(store.getState().checkout.step).toBe('processing');

    await waitFor(() => expect(store.getState().checkout.step).toBe('result'));
    expect(store.getState().checkout.result?.status).toBe('APPROVED');
  });
});
