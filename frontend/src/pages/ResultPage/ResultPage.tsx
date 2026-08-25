import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resetCheckout } from '../../features/checkout/checkoutSlice';
import { fetchProducts } from '../../features/products/productsSlice';
import { formatCentsAsCurrency } from '../../utils/money';
import './ResultPage.css';

const STATUS_COPY: Record<string, { title: string; tone: 'success' | 'error' | 'pending' }> = {
  APPROVED: { title: 'Payment approved', tone: 'success' },
  DECLINED: { title: 'Payment declined', tone: 'error' },
  ERROR: { title: 'Something went wrong', tone: 'error' },
  VOIDED: { title: 'Payment voided', tone: 'error' },
  PENDING: { title: 'Payment pending', tone: 'pending' },
};

export default function ResultPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { result, productName, reference } = useAppSelector((state) => state.checkout);

  if (!result) {
    return null;
  }

  const copy = STATUS_COPY[result.status] ?? { title: result.status, tone: 'pending' as const };

  function handleBackToStore() {
    dispatch(resetCheckout());
    dispatch(fetchProducts());
    navigate('/');
  }

  return (
    <main className={`result-page result-page--${copy.tone}`}>
      <div className="result-page__card">
        <h1>{copy.title}</h1>
        {productName && <p className="result-page__product">{productName}</p>}
        <p className="result-page__amount">{formatCentsAsCurrency(result.amountInCents, result.currency)}</p>
        <dl className="result-page__details">
          <div>
            <dt>Reference</dt>
            <dd>{reference}</dd>
          </div>
          {result.cardBrand && (
            <div>
              <dt>Card</dt>
              <dd>
                {result.cardBrand} •••• {result.cardLastFour}
              </dd>
            </div>
          )}
          <div>
            <dt>Remaining stock</dt>
            <dd>{result.remainingStock}</dd>
          </div>
        </dl>

        <button type="button" className="result-page__back-button" onClick={handleBackToStore}>
          Back to store
        </button>
      </div>
    </main>
  );
}
