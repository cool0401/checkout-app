/** Shape of the `data` object inside a Wompi transaction response. Only the fields we use. */
export interface WompiTransactionData {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
  reference: string;
  amount_in_cents: number;
  currency: string;
  payment_method?: {
    type?: string;
    extra?: {
      brand?: string;
      last_four?: string;
    };
  };
}

export interface WompiEnvelope<T> {
  data: T;
}
