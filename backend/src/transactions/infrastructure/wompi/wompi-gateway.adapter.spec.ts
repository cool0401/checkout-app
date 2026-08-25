import { of } from 'rxjs';
import { createHash } from 'node:crypto';
import { computeIntegritySignature, WompiGatewayAdapter } from './wompi-gateway.adapter';
import { TransactionStatus } from '../../domain/transaction-status';

describe('computeIntegritySignature', () => {
  it('hashes reference + amount + currency + secret with SHA256', () => {
    const expected = createHash('sha256').update('REF1000COPsecret').digest('hex');
    expect(computeIntegritySignature('REF', 1000, 'COP', 'secret')).toBe(expected);
  });
});

describe('WompiGatewayAdapter', () => {
  function buildAdapter(httpOverrides: { post?: jest.Mock; get?: jest.Mock } = {}) {
    const http = {
      post: httpOverrides.post ?? jest.fn(),
      get: httpOverrides.get ?? jest.fn(),
    };
    const configService = {
      get: jest.fn().mockReturnValue({
        apiUrl: 'https://api-sandbox.example.dev/v1',
        privateKey: 'prv_test',
        integritySecret: 'secret',
        pollAttempts: 3,
        pollDelayMs: 0,
      }),
    };
    const adapter = new WompiGatewayAdapter(http as never, configService as never);
    return { adapter, http };
  }

  it('creates a payment and maps the Wompi response into a PaymentResult', async () => {
    const post = jest.fn().mockReturnValue(
      of({
        data: {
          data: {
            id: 'wompi-tx-1',
            status: 'APPROVED',
            reference: 'CHK-1',
            amount_in_cents: 10000,
            currency: 'COP',
            payment_method: { extra: { brand: 'VISA', last_four: '4242' } },
          },
        },
      }),
    );
    const { adapter } = buildAdapter({ post });

    const result = await adapter.createPayment({
      reference: 'CHK-1',
      amountInCents: 10000,
      currency: 'COP',
      customerEmail: 'jane@example.com',
      cardToken: 'tok_test',
      installments: 1,
      acceptanceToken: 'accept',
      acceptPersonalAuth: 'auth',
    });

    expect(post).toHaveBeenCalledWith(
      'https://api-sandbox.example.dev/v1/transactions',
      expect.objectContaining({ reference: 'CHK-1', amount_in_cents: 10000 }),
      expect.objectContaining({ headers: { Authorization: 'Bearer prv_test' } }),
    );
    expect(result).toEqual({
      gatewayTransactionId: 'wompi-tx-1',
      status: TransactionStatus.APPROVED,
      cardBrand: 'VISA',
      cardLastFour: '4242',
    });
  });

  it('polls waitForSettlement until the status leaves PENDING', async () => {
    const get = jest
      .fn()
      .mockReturnValueOnce(of({ data: { data: { id: 'wompi-tx-2', status: 'PENDING', payment_method: {} } } }))
      .mockReturnValueOnce(of({ data: { data: { id: 'wompi-tx-2', status: 'DECLINED', payment_method: {} } } }));
    const { adapter } = buildAdapter({ get });

    const result = await adapter.waitForSettlement('wompi-tx-2');

    expect(get).toHaveBeenCalledTimes(2);
    expect(result.status).toBe(TransactionStatus.DECLINED);
  });

  it('returns the last known PENDING result once poll attempts are exhausted', async () => {
    const get = jest.fn().mockReturnValue(of({ data: { data: { id: 'wompi-tx-3', status: 'PENDING', payment_method: {} } } }));
    const { adapter } = buildAdapter({ get });

    const result = await adapter.waitForSettlement('wompi-tx-3');

    expect(get).toHaveBeenCalledTimes(3);
    expect(result.status).toBe(TransactionStatus.PENDING);
  });
});
