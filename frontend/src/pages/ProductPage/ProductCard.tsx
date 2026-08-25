import { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { startCheckout } from '../../features/checkout/checkoutSlice';
import { formatCentsAsCurrency } from '../../utils/money';
import type { ProductDto } from '../../api/checkoutApi';
import './ProductCard.css';

export default function ProductCard({ product }: { product: ProductDto }) {
  const dispatch = useAppDispatch();
  const maxQuantity = Math.min(product.stock, 5);
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.stock === 0;

  function handlePayClick() {
    dispatch(
      startCheckout({
        productId: product.id,
        productName: product.name,
        productPriceInCents: product.priceInCents,
        quantity,
      }),
    );
  }

  return (
    <article className="product-card">
      <img className="product-card__image" src={product.imageUrl} alt={product.name} loading="lazy" />
      <div className="product-card__body">
        <h2 className="product-card__name">{product.name}</h2>
        <p className="product-card__description">{product.description}</p>
        <p className="product-card__price">{formatCentsAsCurrency(product.priceInCents)}</p>
        <p className="product-card__stock">
          {outOfStock ? 'Out of stock' : `${product.stock} unit${product.stock === 1 ? '' : 's'} available`}
        </p>

        {!outOfStock && (
          <label className="product-card__quantity">
            Qty
            <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
              {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          className="product-card__buy-button"
          disabled={outOfStock}
          onClick={handlePayClick}
        >
          Pay with credit card
        </button>
      </div>
    </article>
  );
}
