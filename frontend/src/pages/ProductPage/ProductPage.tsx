import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProducts } from '../../features/products/productsSlice';
import ProductCard from './ProductCard';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import './ProductPage.css';

export default function ProductPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, status, error } = useAppSelector((state) => state.products);
  const step = useAppSelector((state) => state.checkout.step);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (step === 'result') {
      navigate('/result');
    }
  }, [step, navigate]);

  return (
    <main className="product-page">
      <header className="product-page__header">
        <h1>Our Store</h1>
        <p>Pick a product and check out securely with your credit card.</p>
      </header>

      {status === 'loading' && <p role="status">Loading products…</p>}
      {status === 'failed' && (
        <p role="alert" className="product-page__error">
          {error ?? 'Something went wrong loading products.'}
        </p>
      )}

      <div className="product-grid">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {(step === 'details' || step === 'summary' || step === 'processing') && <PaymentModal />}
    </main>
  );
}
