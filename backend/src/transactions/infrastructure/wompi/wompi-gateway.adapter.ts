import { createHash } from 'node:crypto';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../../../config/configuration';
import { TransactionStatus } from '../../domain/transaction-status';
import { CreatePaymentInput, PaymentGatewayPort, PaymentResult } from '../../application/ports/payment-gateway.port';
import { WompiEnvelope, WompiTransactionData } from './wompi.types';

/** Outbound adapter: the only place that speaks Wompi's HTTP contract. */
@Injectable()
export class WompiGatewayAdapter implements PaymentGatewayPort {
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const wompi = this.configService.get('wompi', { infer: true });
    const signature = computeIntegritySignature(
      input.reference,
      input.amountInCents,
      input.currency,
      wompi.integritySecret,
    );

    const response = await firstValueFrom(
      this.http.post<WompiEnvelope<WompiTransactionData>>(
        `${wompi.apiUrl}/transactions`,
        {
          acceptance_token: input.acceptanceToken,
          accept_personal_auth: input.acceptPersonalAuth,
          amount_in_cents: input.amountInCents,
          currency: input.currency,
          signature,
          customer_email: input.customerEmail,
          reference: input.reference,
          payment_method: {
            type: 'CARD',
            installments: input.installments,
            token: input.cardToken,
          },
        },
        { headers: { Authorization: `Bearer ${wompi.privateKey}` } },
      ),
    );

    return toPaymentResult(response.data.data);
  }

  async waitForSettlement(gatewayTransactionId: string): Promise<PaymentResult> {
    const wompi = this.configService.get('wompi', { infer: true });
    let last: PaymentResult = { gatewayTransactionId, status: TransactionStatus.PENDING, cardBrand: null, cardLastFour: null };

    for (let attempt = 0; attempt < wompi.pollAttempts; attempt += 1) {
      const response = await firstValueFrom(
        this.http.get<WompiEnvelope<WompiTransactionData>>(`${wompi.apiUrl}/transactions/${gatewayTransactionId}`, {
          headers: { Authorization: `Bearer ${wompi.privateKey}` },
        }),
      );
      last = toPaymentResult(response.data.data);
      if (last.status !== TransactionStatus.PENDING) {
        return last;
      }
      await sleep(wompi.pollDelayMs);
    }

    return last;
  }
}

export function computeIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string,
  integritySecret: string,
): string {
  const raw = `${reference}${amountInCents}${currency}${integritySecret}`;
  return createHash('sha256').update(raw).digest('hex');
}

function toPaymentResult(data: WompiTransactionData): PaymentResult {
  return {
    gatewayTransactionId: data.id,
    status: data.status as TransactionStatus,
    cardBrand: data.payment_method?.extra?.brand ?? null,
    cardLastFour: data.payment_method?.extra?.last_four ?? null,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
