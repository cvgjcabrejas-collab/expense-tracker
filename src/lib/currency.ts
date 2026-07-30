export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  INR: '₹',
  MXN: '$',
  PHP: '₱',
};

export function getCurrencySymbol(currency: string): string {
  return currencySymbols[currency] || '$';
}

export function formatCurrencyWithSymbol(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
}
