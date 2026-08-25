import axios from 'axios';

jest.mock('axios');

const mockInstance = { get: jest.fn(), post: jest.fn() };
(axios.create as jest.Mock) = jest.fn().mockReturnValue(mockInstance);

import * as wompiApi from './wompiApi';

describe('wompiApi', () => {
  beforeEach(() => {
    mockInstance.get.mockReset();
    mockInstance.post.mockReset();
  });

  it('fetchAcceptanceTokens extracts both presigned tokens', async () => {
    mockInstance.get.mockResolvedValue({
      data: {
        data: {
          presigned_acceptance: { acceptance_token: 'accept-token' },
          presigned_personal_data_auth: { acceptance_token: 'auth-token' },
        },
      },
    });

    const tokens = await wompiApi.fetchAcceptanceTokens();

    expect(tokens).toEqual({ acceptanceToken: 'accept-token', acceptPersonalAuth: 'auth-token' });
  });

  it('tokenizeCard strips spaces, pads the month, and shortens the year', async () => {
    mockInstance.post.mockResolvedValue({ data: { data: { id: 'tok_123' } } });

    const token = await wompiApi.tokenizeCard({
      number: '4242 4242 4242 4242',
      cvc: '123',
      expMonth: '5',
      expYear: '2029',
      cardHolder: 'Jane Doe',
    });

    expect(token).toBe('tok_123');
    expect(mockInstance.post).toHaveBeenCalledWith(
      '/tokens/cards',
      {
        number: '4242424242424242',
        cvc: '123',
        exp_month: '05',
        exp_year: '29',
        card_holder: 'Jane Doe',
      },
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.stringContaining('Bearer') }) }),
    );
  });

  it('tokenizeCard keeps an already 2-digit year as-is', async () => {
    mockInstance.post.mockResolvedValue({ data: { data: { id: 'tok_456' } } });

    await wompiApi.tokenizeCard({ number: '4242424242424242', cvc: '123', expMonth: '12', expYear: '29', cardHolder: 'Jane' });

    expect(mockInstance.post).toHaveBeenCalledWith(
      '/tokens/cards',
      expect.objectContaining({ exp_month: '12', exp_year: '29' }),
      expect.anything(),
    );
  });
});
