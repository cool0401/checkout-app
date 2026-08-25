export interface CreateTransactionInput {
  productId: string;
  quantity: number;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    legalIdType: string;
    legalIdNumber: string;
  };
  delivery: {
    addressLine1: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
    phone: string;
  };
}

export interface CreateTransactionOutput {
  transactionId: string;
  reference: string;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  totalAmountInCents: number;
  currency: string;
}
