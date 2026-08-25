import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils/renderWithProviders';
import App from './App';
import * as checkoutApi from './api/checkoutApi';

jest.mock('./api/checkoutApi');
const mockedCheckoutApi = checkoutApi as jest.Mocked<typeof checkoutApi>;

beforeEach(() => {
  mockedCheckoutApi.fetchProducts.mockResolvedValue([]);
  mockedCheckoutApi.fetchFees.mockResolvedValue({ baseFeeInCents: 0, deliveryFeeInCents: 0, currency: 'COP' });
});

describe('App routing', () => {
  it('renders the product page at /', async () => {
    renderWithProviders(<App />, { route: '/' });
    expect(await screen.findByText('Our Store')).toBeInTheDocument();
  });

  it('redirects /result to / when there is no result in state', async () => {
    renderWithProviders(<App />, { route: '/result' });
    expect(await screen.findByText('Our Store')).toBeInTheDocument();
  });

  it('renders the result page at /result when a result exists', async () => {
    renderWithProviders(<App />, {
      route: '/result',
      preloadedState: {
        checkout: {
          result: {
            transactionId: 't1',
            reference: 'CHK-1',
            status: 'APPROVED',
            amountInCents: 1000,
            currency: 'COP',
            cardBrand: 'VISA',
            cardLastFour: '4242',
            productId: 'p1',
            remainingStock: 1,
          },
          productName: 'Headphones',
          reference: 'CHK-1',
        } as never,
      },
    });

    expect(await screen.findByText('Payment approved')).toBeInTheDocument();
  });

  it('redirects an unknown route to /', async () => {
    renderWithProviders(<App />, { route: '/does-not-exist' });
    expect(await screen.findByText('Our Store')).toBeInTheDocument();
  });
});
