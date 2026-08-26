import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { backToDetails, cancelCheckout } from '../../features/checkout/checkoutSlice';
import type { CardInput } from '../../features/checkout/checkoutSlice';
import DetailsForm from './DetailsForm';
import SummaryBackdrop from '../SummaryBackdrop/SummaryBackdrop';
import './PaymentModal.css';

export default function PaymentModal() {
  const dispatch = useAppDispatch();
  const step = useAppSelector((state) => state.checkout.step);
  const [card, setCard] = useState<CardInput | null>(null);

  const canClose = step !== 'processing';

  // card is never persisted, so a refresh on summary needs to bounce back for it
  useEffect(() => {
    if (step === 'summary' && !card) {
      dispatch(backToDetails());
    }
  }, [step, card, dispatch]);

  return (
    <div className="payment-modal__overlay" role="dialog" aria-modal="true">
      <div className="payment-modal">
        <button
          type="button"
          className="payment-modal__close"
          aria-label="Close"
          disabled={!canClose}
          onClick={() => dispatch(cancelCheckout())}
        >
          ×
        </button>

        {step === 'details' && <DetailsForm onSubmitted={(cardInput) => setCard(cardInput)} initialCard={card} />}
        {(step === 'summary' || step === 'processing') && card && <SummaryBackdrop card={card} />}
      </div>
    </div>
  );
}
