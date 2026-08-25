export function formatCentsAsCurrency(cents: number, currency = 'COP'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
