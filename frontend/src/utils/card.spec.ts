import {
  detectCardBrand,
  formatCardNumber,
  isValidCardNumber,
  isValidCvc,
  isValidExpiry,
  maskedLastFour,
} from './card';

describe('detectCardBrand', () => {
  it('detects Visa numbers starting with 4', () => {
    expect(detectCardBrand('4242424242424242')).toBe('VISA');
  });

  it('detects Mastercard numbers in the 51-55 range', () => {
    expect(detectCardBrand('5254133610965646')).toBe('MASTERCARD');
  });

  it('detects Mastercard numbers in the 2221-2720 range', () => {
    expect(detectCardBrand('2223000048400011')).toBe('MASTERCARD');
  });

  it('returns UNKNOWN for anything else', () => {
    expect(detectCardBrand('6011111111111117')).toBe('UNKNOWN');
    expect(detectCardBrand('')).toBe('UNKNOWN');
  });
});

describe('isValidCardNumber', () => {
  it('accepts a Luhn-valid number', () => {
    expect(isValidCardNumber('4242 4242 4242 4242')).toBe(true);
  });

  it('rejects a Luhn-invalid number', () => {
    expect(isValidCardNumber('4242424242424241')).toBe(false);
  });

  it('rejects numbers that are too short or too long', () => {
    expect(isValidCardNumber('4242')).toBe(false);
    expect(isValidCardNumber('42'.repeat(15))).toBe(false);
  });
});

describe('isValidExpiry', () => {
  it('accepts a future month/year', () => {
    expect(isValidExpiry('12', '2099')).toBe(true);
  });

  it('accepts a 2-digit year', () => {
    expect(isValidExpiry('12', '99')).toBe(true);
  });

  it('rejects an out-of-range month', () => {
    expect(isValidExpiry('13', '2099')).toBe(false);
    expect(isValidExpiry('0', '2099')).toBe(false);
  });

  it('rejects a past year', () => {
    expect(isValidExpiry('01', '2000')).toBe(false);
  });

  it('rejects the current year with a past month', () => {
    const now = new Date();
    if (now.getMonth() === 0) {
      return;
    }
    expect(isValidExpiry(String(now.getMonth()), String(now.getFullYear()))).toBe(false);
  });
});

describe('isValidCvc', () => {
  it('accepts 3 or 4 digit codes', () => {
    expect(isValidCvc('123')).toBe(true);
    expect(isValidCvc('1234')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isValidCvc('12')).toBe(false);
    expect(isValidCvc('12345')).toBe(false);
    expect(isValidCvc('abc')).toBe(false);
  });
});

describe('formatCardNumber', () => {
  it('groups digits into blocks of 4', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  it('strips non-digit characters first', () => {
    expect(formatCardNumber('4242-4242-4242-4242')).toBe('4242 4242 4242 4242');
  });
});

describe('maskedLastFour', () => {
  it('returns the last 4 digits', () => {
    expect(maskedLastFour('4242 4242 4242 4242')).toBe('4242');
  });
});
