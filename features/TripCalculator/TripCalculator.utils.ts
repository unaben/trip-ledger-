import type { Currency, ExchangeRates } from "./TripCalculator.types";

/**
 * Converts an amount in any supported currency into GBP.
 * GBP amounts are returned unchanged.
 */
export function convertToGbp(
  amount: number,
  currency: Currency,
  rates: ExchangeRates
): number {
  if (!Number.isFinite(amount)) return 0;

  switch (currency) {
    case "GBP":
      return amount;
    case "HUF":
      return amount * rates.hufToGbp;
    case "EUR":
      return amount * rates.eurToGbp;
    default:
      return amount;
  }
}

/** Formats a number as GBP, e.g. 1234.5 -> "£1,234.50". */
export function formatGbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/** Formats a plain number with thousands separators, no currency symbol. */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/** Creates a short random id, good enough for list keys in this tool. */
export function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
