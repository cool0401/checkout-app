export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

/** Detects Visa / Mastercard by BIN range. Returns UNKNOWN for anything else. */
export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = onlyDigits(cardNumber);
  if (/^4/.test(digits)) {
    return 'VISA';
  }
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(digits)) {
    return 'MASTERCARD';
  }
  return 'UNKNOWN';
}

/** Standard mod-10 checksum used by all major card networks. */
export function isValidCardNumber(cardNumber: string): boolean {
  const digits = onlyDigits(cardNumber);
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function isValidExpiry(month: string, year: string): boolean {
  const monthNum = Number(month);
  const yearNum = Number(year.length === 2 ? `20${year}` : year);
  if (!monthNum || monthNum < 1 || monthNum > 12 || !yearNum) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (yearNum < currentYear) {
    return false;
  }
  if (yearNum === currentYear && monthNum < currentMonth) {
    return false;
  }
  return true;
}

export function isValidCvc(cvc: string): boolean {
  return /^\d{3,4}$/.test(cvc);
}

export function formatCardNumber(cardNumber: string): string {
  return onlyDigits(cardNumber)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function maskedLastFour(cardNumber: string): string {
  const digits = onlyDigits(cardNumber);
  return digits.slice(-4);
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}
