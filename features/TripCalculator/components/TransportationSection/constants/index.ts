import type {
  Currency,
  PricingType,
} from "@/features/TripCalculator/TripCalculator.types";

export const PRICING_TYPES: { value: PricingType; label: string }[] = [
  { value: "group", label: "Flat / group price" },
  { value: "perPerson", label: "Per person" },
];

export const CURRENCY_CLASS: Record<Currency, string> = {
  GBP: "transportationSectionCurrencyGbp",
  HUF: "transportationSectionCurrencyHuf",
  EUR: "transportationSectionCurrencyEur",
};
