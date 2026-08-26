import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { backToDetails, payWithCard } from '../../features/checkout/checkoutSlice';
import type { CardInput } from '../../features/checkout/checkoutSlice';
import { formatCentsAsCurrency } from '../../utils/money';
import './SummaryBackdrop.css';

export default function SummaryBackdrop({ card }: { card: CardInput }) {
  const dispatch = useAppDispatch();
  const { productName, productPriceInCents, quantity, step, error } = useAppSelector((state) => state.checkout);
  const fees = useAppSelector((state) => state.config.fees);

  const productAmountInCents = (productPriceInCents ?? 0) * quantity;
  const baseFeeInCents = fees?.baseFeeInCents ?? 0;
  const deliveryFeeInCents = fees?.deliveryFeeInCents ?? 0;
  const totalInCents = productAmountInCents + baseFeeInCents + deliveryFeeInCents;
  const currency = fees?.currency ?? 'COP';
  const isProcessing = step === 'processing';

  return (
    <section className="summary-backdrop">
      <div className="summary-backdrop__handle" aria-hidden="true" />
      <h2>Order summary</h2>

      <dl className="summary-backdrop__rows">
        <div className="summary-backdrop__row">
          <dt>
            {productName} × {quantity}
          </dt>
          <dd>{formatCentsAsCurrency(productAmountInCents, currency)}</dd>
        </div>
        <div className="summary-backdrop__row">
          <dt>Base fee</dt>
          <dd>{formatCentsAsCurrency(baseFeeInCents, currency)}</dd>
        </div>
        <div className="summary-backdrop__row">
          <dt>Delivery fee</dt>
          <dd>{formatCentsAsCurrency(deliveryFeeInCents, currency)}</dd>
        </div>
        <div className="summary-backdrop__row summary-backdrop__row--total">
          <dt>Total</dt>
          <dd>{formatCentsAsCurrency(totalInCents, currency)}</dd>
        </div>
      </dl>

      {error && (
        <p role="alert" className="summary-backdrop__error">
          {error}
        </p>
      )}

      <div className="summary-backdrop__actions">
        <button type="button" className="summary-backdrop__back-button" disabled={isProcessing} onClick={() => dispatch(backToDetails())}>
          Back
        </button>
        <button
          type="button"
          className="summary-backdrop__pay-button"
          disabled={isProcessing}
          onClick={() => dispatch(payWithCard(card))}
        >
          {isProcessing ? 'Processing…' : 'Pay now'}
        </button>
      </div>
    </section>
  );
}
