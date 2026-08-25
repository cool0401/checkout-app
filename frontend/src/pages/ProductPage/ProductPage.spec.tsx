import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import ProductPage from './ProductPage';
import type { ProductDto } from '../../api/checkoutApi';

const product: ProductDto = {
  id: 'p1',
  name: 'Headphones',
  description: 'Great sound',
  priceInCents: 25000000,
  stock: 3,
  imageUrl: 'https://example.com/img.png',
};

describe('ProductPage', () => {
  it('renders products once loaded', () => {
    renderWithProviders(<ProductPage />, {
      preloadedState: { products: { items: [product], status: 'succeeded', error: null } },
    });

    expect(screen.getByText('Headphones')).toBeInTheDocument();
  });

  it('shows a loading indicator while products are being fetched', () => {
    renderWithProviders(<ProductPage />, { preloadedState: { products: { items: [], status: 'loading', error: null } } });
    expect(screen.getByRole('status')).toHaveTextContent('Loading products');
  });

  it('shows an error message when the product fetch fails', () => {
    renderWithProviders(<ProductPage />, {
      preloadedState: { products: { items: [], status: 'failed', error: 'Network error' } },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Network error');
  });

  it('overlays the payment modal while a checkout is in progress', () => {
    renderWithProviders(<ProductPage />, {
      preloadedState: {
        products: { items: [product], status: 'succeeded', error: null },
        checkout: { step: 'details', productId: 'p1', quantity: 1 } as never,
      },
    });
    expect(screen.getByText('Payment & delivery details')).toBeInTheDocument();
  });

  it('navigates to /result once the checkout step becomes result', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<ProductPage />} />
        <Route path="/result" element={<div>RESULT_PAGE</div>} />
      </Routes>,
      {
        preloadedState: {
          products: { items: [product], status: 'succeeded', error: null },
          checkout: { step: 'result' } as never,
        },
      },
    );

    expect(await screen.findByText('RESULT_PAGE')).toBeInTheDocument();
  });
});
