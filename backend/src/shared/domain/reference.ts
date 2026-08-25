import { randomUUID } from 'node:crypto';

/** Human-shareable, unique-enough reference sent to the payment gateway. */
export function generateReference(prefix = 'CHK'): string {
  const timestampPart = Date.now().toString(36).toUpperCase();
  const randomPart = randomUUID().split('-')[0].toUpperCase();
  return `${prefix}-${timestampPart}-${randomPart}`;
}
