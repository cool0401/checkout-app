import { screen, fireEvent } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import ResultPage from './ResultPage';
import * as checkoutApi from '../../api/checkoutApi';

jest.mock('../../api/checkoutApi');
(checkoutApi.fetchProducts as jest.Mock).mockResolvedValue([]);

const result = {
  transactionId: 't1',
  reference: 'CHK-1',
  status: 'APPROVED',
  amountInCents: 51300000,
  currency: 'COP',
  cardBrand: 'VISA',
  cardLastFour: '4242',
  productId: 'p1',
  remainingStock: 4,
};

describe('ResultPage', () => {
  it('renders nothing when there is no result', () => {
    const { container } = renderWithProviders(<ResultPage />, {
      preloadedState: { checkout: { result: null, productName: null, reference: null } as never },
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the approved status, amount and card info', () => {
    renderWithProviders(<ResultPage />, {
      preloadedState: { checkout: { result, productName: 'Headphones', reference: 'CHK-1' } as never },
    });

    expect(screen.getByText('Payment approved')).toBeInTheDocument();
    expect(screen.getByText('Headphones')).toBeInTheDocument();
    expect(screen.getByText('$ 513.000')).toBeInTheDocument();
    expect(screen.getByText(/VISA/)).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows a declined title for a declined payment', () => {
    renderWithProviders(<ResultPage />, {
      preloadedState: { checkout: { result: { ...result, status: 'DECLINED' }, productName: 'Headphones', reference: 'CHK-1' } as never },
    });
    expect(screen.getByText('Payment declined')).toBeInTheDocument();
  });

  it('falls back to the raw status when it is not one of the known ones', () => {
    renderWithProviders(<ResultPage />, {
      preloadedState: { checkout: { result: { ...result, status: 'WEIRD' }, productName: 'Headphones', reference: 'CHK-1' } as never },
    });
    expect(screen.getByText('WEIRD')).toBeInTheDocument();
  });

  it('resets checkout and navigates back to the store on click', async () => {
    const { store } = renderWithProviders(
      <Routes>
        <Route path="/result" element={<ResultPage />} />
        <Route path="/" element={<div>STORE_PAGE</div>} />
      </Routes>,
      {
        route: '/result',
        preloadedState: { checkout: { result, productName: 'Headphones', reference: 'CHK-1' } as never },
      },
    );

    fireEvent.click(screen.getByRole('button', { name: /back to store/i }));

    expect(await screen.findByText('STORE_PAGE')).toBeInTheDocument();
    expect(store.getState().checkout.step).toBe('idle');
  });
});
