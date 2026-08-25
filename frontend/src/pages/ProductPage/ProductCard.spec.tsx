import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import ProductCard from './ProductCard';
import type { ProductDto } from '../../api/checkoutApi';

const product: ProductDto = {
  id: 'p1',
  name: 'Headphones',
  description: 'Great sound',
  priceInCents: 25000000,
  stock: 3,
  imageUrl: 'https://example.com/img.png',
};

describe('ProductCard', () => {
  it('shows product info and starts checkout with the selected quantity on click', () => {
    const { store } = renderWithProviders(<ProductCard product={product} />);

    expect(screen.getByText('Headphones')).toBeInTheDocument();
    expect(screen.getByText('3 units available')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /pay with credit card/i }));

    const state = store.getState().checkout;
    expect(state.step).toBe('details');
    expect(state.productId).toBe('p1');
    expect(state.quantity).toBe(2);
  });

  it('disables the buy button and hides the quantity selector when out of stock', () => {
    renderWithProviders(<ProductCard product={{ ...product, stock: 0 }} />);

    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pay with credit card/i })).toBeDisabled();
  });

  it('shows the singular unit label when only one is left', () => {
    renderWithProviders(<ProductCard product={{ ...product, stock: 1 }} />);
    expect(screen.getByText('1 unit available')).toBeInTheDocument();
  });
});
