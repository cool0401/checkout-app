import axios from 'axios';
import { WOMPI_API_URL, WOMPI_PUBLIC_KEY } from '../config/env';

const wompiClient = axios.create({ baseURL: WOMPI_API_URL });

export interface AcceptanceTokens {
  acceptanceToken: string;
  acceptPersonalAuth: string;
}

export interface CardTokenizationInput {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

// presigned acceptance + personal data auth tokens, required on every transaction
export async function fetchAcceptanceTokens(): Promise<AcceptanceTokens> {
  const { data } = await wompiClient.get(`/merchants/${WOMPI_PUBLIC_KEY}`);
  return {
    acceptanceToken: data.data.presigned_acceptance.acceptance_token,
    acceptPersonalAuth: data.data.presigned_personal_data_auth.acceptance_token,
  };
}

// tokenized client-side so the raw card number/cvc never hit our backend
export async function tokenizeCard(card: CardTokenizationInput): Promise<string> {
  const { data } = await wompiClient.post(
    '/tokens/cards',
    {
      number: card.number.replace(/\s/g, ''),
      cvc: card.cvc,
      exp_month: card.expMonth.padStart(2, '0'),
      exp_year: card.expYear.length === 4 ? card.expYear.slice(2) : card.expYear,
      card_holder: card.cardHolder,
    },
    { headers: { Authorization: `Bearer ${WOMPI_PUBLIC_KEY}` } },
  );
  return data.data.id;
}
