import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { submitDetails } from '../../features/checkout/checkoutSlice';
import type { CardInput } from '../../features/checkout/checkoutSlice';
import { detectCardBrand, formatCardNumber, isValidCardNumber, isValidCvc, isValidExpiry } from '../../utils/card';
import './DetailsForm.css';

interface Props {
  initialCard: CardInput | null;
  onSubmitted: (card: CardInput) => void;
}

type Errors = Partial<Record<string, string>>;

export default function DetailsForm({ initialCard, onSubmitted }: Props) {
  const dispatch = useAppDispatch();
  const savedCustomer = useAppSelector((state) => state.checkout.customer);
  const savedDelivery = useAppSelector((state) => state.checkout.delivery);

  const [fullName, setFullName] = useState(savedCustomer?.fullName ?? '');
  const [email, setEmail] = useState(savedCustomer?.email ?? '');
  const [customerPhone, setCustomerPhone] = useState(savedCustomer?.phone ?? '');
  const [legalIdType, setLegalIdType] = useState(savedCustomer?.legalIdType ?? 'CC');
  const [legalIdNumber, setLegalIdNumber] = useState(savedCustomer?.legalIdNumber ?? '');

  const [addressLine1, setAddressLine1] = useState(savedDelivery?.addressLine1 ?? '');
  const [city, setCity] = useState(savedDelivery?.city ?? '');
  const [region, setRegion] = useState(savedDelivery?.region ?? '');
  const [country, setCountry] = useState(savedDelivery?.country ?? 'CO');
  const [postalCode, setPostalCode] = useState(savedDelivery?.postalCode ?? '');
  const [deliveryPhone, setDeliveryPhone] = useState(savedDelivery?.phone ?? '');

  const [cardNumber, setCardNumber] = useState(initialCard?.number ?? '');
  const [cardHolder, setCardHolder] = useState(initialCard?.cardHolder ?? '');
  const [expMonth, setExpMonth] = useState(initialCard?.expMonth ?? '');
  const [expYear, setExpYear] = useState(initialCard?.expYear ?? '');
  const [cvc, setCvc] = useState(initialCard?.cvc ?? '');
  const [installments, setInstallments] = useState(initialCard?.installments ?? 1);

  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const brand = detectCardBrand(cardNumber);

  // scroll to the first error, otherwise it's easy to miss on a long form
  useEffect(() => {
    if (Object.keys(errors).length === 0) {
      return;
    }
    const firstError = formRef.current?.querySelector('.details-form__error');
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [errors]);

  function validate(): Errors {
    const next: Errors = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email';
    if (!customerPhone.trim()) next.customerPhone = 'Phone is required';
    if (!legalIdNumber.trim()) next.legalIdNumber = 'ID number is required';

    if (!addressLine1.trim()) next.addressLine1 = 'Address is required';
    if (!city.trim()) next.city = 'City is required';
    if (!region.trim()) next.region = 'Region is required';
    if (!postalCode.trim()) next.postalCode = 'Postal code is required';
    if (!deliveryPhone.trim()) next.deliveryPhone = 'Delivery phone is required';

    if (!cardNumber.trim()) {
      next.cardNumber = 'Card number is required';
    } else if (!isValidCardNumber(cardNumber)) {
      next.cardNumber = 'Enter a valid card number';
    } else if (brand === 'UNKNOWN') {
      next.cardNumber = 'Only Visa and Mastercard are supported';
    }
    if (!cardHolder.trim()) next.cardHolder = 'Cardholder name is required';
    if (!isValidExpiry(expMonth, expYear)) next.expiry = 'Enter a valid, non-expired date';
    if (!isValidCvc(cvc)) next.cvc = 'Enter a valid CVC';

    return next;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    dispatch(
      submitDetails({
        customer: { fullName, email, phone: customerPhone, legalIdType, legalIdNumber },
        delivery: { addressLine1, city, region, country, postalCode, phone: deliveryPhone },
      }),
    );
    onSubmitted({ number: cardNumber.replace(/\s/g, ''), cvc, expMonth, expYear, cardHolder, installments });
  }

  return (
    <form className="details-form" ref={formRef} onSubmit={handleSubmit} noValidate>
      <h2>Payment &amp; delivery details</h2>

      <fieldset>
        <legend>Card information</legend>

        <label>
          Card number {brand !== 'UNKNOWN' && <span className="details-form__brand">{brand}</span>}
          <input
            inputMode="numeric"
            autoComplete="cc-number"
            value={formatCardNumber(cardNumber)}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="4242 4242 4242 4242"
          />
        </label>
        {errors.cardNumber && <p className="details-form__error">{errors.cardNumber}</p>}

        <label>
          Cardholder name
          <input autoComplete="cc-name" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} />
        </label>
        {errors.cardHolder && <p className="details-form__error">{errors.cardHolder}</p>}

        <div className="details-form__row">
          <label>
            Exp. month
            <input inputMode="numeric" maxLength={2} placeholder="MM" value={expMonth} onChange={(e) => setExpMonth(e.target.value)} />
          </label>
          <label>
            Exp. year
            <input inputMode="numeric" maxLength={4} placeholder="YYYY" value={expYear} onChange={(e) => setExpYear(e.target.value)} />
          </label>
          <label>
            CVC
            <input inputMode="numeric" maxLength={4} autoComplete="cc-csc" value={cvc} onChange={(e) => setCvc(e.target.value)} />
          </label>
        </div>
        {errors.expiry && <p className="details-form__error">{errors.expiry}</p>}
        {errors.cvc && <p className="details-form__error">{errors.cvc}</p>}

        <label>
          Installments
          <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
            {[1, 3, 6, 12].map((n) => (
              <option key={n} value={n}>
                {n === 1 ? '1 (single payment)' : n}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Your information</legend>
        <label>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        {errors.fullName && <p className="details-form__error">{errors.fullName}</p>}

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {errors.email && <p className="details-form__error">{errors.email}</p>}

        <div className="details-form__row">
          <label>
            Phone
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </label>
          <label>
            ID type
            <select value={legalIdType} onChange={(e) => setLegalIdType(e.target.value)}>
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="NIT">NIT</option>
              <option value="PP">Passport</option>
            </select>
          </label>
          <label>
            ID number
            <input value={legalIdNumber} onChange={(e) => setLegalIdNumber(e.target.value)} />
          </label>
        </div>
        {errors.customerPhone && <p className="details-form__error">{errors.customerPhone}</p>}
        {errors.legalIdNumber && <p className="details-form__error">{errors.legalIdNumber}</p>}
      </fieldset>

      <fieldset>
        <legend>Delivery address</legend>
        <label>
          Address
          <input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
        </label>
        {errors.addressLine1 && <p className="details-form__error">{errors.addressLine1}</p>}

        <div className="details-form__row">
          <label>
            City
            <input value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <label>
            Region
            <input value={region} onChange={(e) => setRegion(e.target.value)} />
          </label>
          <label>
            Postal code
            <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          </label>
        </div>
        {errors.city && <p className="details-form__error">{errors.city}</p>}
        {errors.region && <p className="details-form__error">{errors.region}</p>}
        {errors.postalCode && <p className="details-form__error">{errors.postalCode}</p>}

        <label>
          Country
          <input value={country} onChange={(e) => setCountry(e.target.value)} />
        </label>

        <label>
          Delivery phone
          <input value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} />
        </label>
        {errors.deliveryPhone && <p className="details-form__error">{errors.deliveryPhone}</p>}
      </fieldset>

      <button type="submit" className="details-form__submit">
        Continue to summary
      </button>
    </form>
  );
}
