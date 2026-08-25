import { formatCentsAsCurrency } from './money';

describe('formatCentsAsCurrency', () => {
  it('formats cents as a whole-unit COP currency string', () => {
    expect(formatCentsAsCurrency(32000000)).toBe('$ 320.000');
  });

  it('supports other currencies', () => {
    expect(formatCentsAsCurrency(150000, 'USD')).toContain('1.500');
  });
});
