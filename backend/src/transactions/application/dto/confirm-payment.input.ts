export interface ConfirmPaymentInput {
  transactionId: string;
  cardToken: string;
  installments: number;
  acceptanceToken: string;
  acceptPersonalAuth: string;
}

export interface ConfirmPaymentOutput {
  transactionId: string;
  reference: string;
  status: string;
  amountInCents: number;
  currency: string;
  cardBrand: string | null;
  cardLastFour: string | null;
  productId: string;
  remainingStock: number;
}
