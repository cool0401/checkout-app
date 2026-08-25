import { TransactionStatus } from '../../domain/transaction-status';

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface CreatePaymentInput {
  reference: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  cardToken: string;
  installments: number;
  acceptanceToken: string;
  acceptPersonalAuth: string;
}

export interface PaymentResult {
  gatewayTransactionId: string;
  status: TransactionStatus;
  cardBrand: string | null;
  cardLastFour: string | null;
}

/** Outbound port hiding the Wompi HTTP integration behind a domain-shaped contract. */
export interface PaymentGatewayPort {
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
  /** Polls the gateway until the transaction leaves PENDING, or attempts are exhausted. */
  waitForSettlement(gatewayTransactionId: string): Promise<PaymentResult>;
}
