import { httpClient } from './httpClient';

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stock: number;
  imageUrl: string;
}

export interface CustomerInput {
  fullName: string;
  email: string;
  phone: string;
  legalIdType: string;
  legalIdNumber: string;
}

export interface DeliveryInput {
  addressLine1: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  phone: string;
}

export interface CreateTransactionResponse {
  transactionId: string;
  reference: string;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  totalAmountInCents: number;
  currency: string;
}

export interface ConfirmPaymentResponse {
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

export interface TransactionDto {
  id: string;
  reference: string;
  status: string;
  productId: string;
  quantity: number;
  amountInCents: number;
  currency: string;
  cardBrand: string | null;
  cardLastFour: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeesDto {
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  currency: string;
}

export async function fetchFees(): Promise<FeesDto> {
  const { data } = await httpClient.get<FeesDto>('/config/fees');
  return data;
}

export async function fetchProducts(): Promise<ProductDto[]> {
  const { data } = await httpClient.get<ProductDto[]>('/products');
  return data;
}

export async function fetchProduct(productId: string): Promise<ProductDto> {
  const { data } = await httpClient.get<ProductDto>(`/products/${productId}`);
  return data;
}

export async function createTransaction(input: {
  productId: string;
  quantity: number;
  customer: CustomerInput;
  delivery: DeliveryInput;
}): Promise<CreateTransactionResponse> {
  const { data } = await httpClient.post<CreateTransactionResponse>('/transactions', input);
  return data;
}

export async function confirmPayment(
  transactionId: string,
  input: { cardToken: string; installments: number; acceptanceToken: string; acceptPersonalAuth: string },
): Promise<ConfirmPaymentResponse> {
  const { data } = await httpClient.post<ConfirmPaymentResponse>(`/transactions/${transactionId}/confirm`, input);
  return data;
}

export async function getTransaction(transactionId: string): Promise<TransactionDto> {
  const { data } = await httpClient.get<TransactionDto>(`/transactions/${transactionId}`);
  return data;
}
