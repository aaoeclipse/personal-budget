import type { Currency } from '../types/expense';

export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  if (currency === 'GTQ') {
    return `Q${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export const EXCHANGE_RATE_GTQ_TO_USD = 0.13;
export const EXCHANGE_RATE_USD_TO_GTQ = 7.7;

export function convertToUSD(amount: number, currency: Currency): number {
  if (currency === 'GTQ') return amount * EXCHANGE_RATE_GTQ_TO_USD;
  return amount;
}

export function convertToGTQ(amount: number, currency: Currency): number {
  if (currency === 'USD') return amount * EXCHANGE_RATE_USD_TO_GTQ;
  return amount;
}
