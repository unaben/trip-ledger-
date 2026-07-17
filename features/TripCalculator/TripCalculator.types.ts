// All the shapes of data used by the trip calculator.
// Keeping these in one file makes it easy to see the whole "data model"
// at a glance, and to reuse the same shapes in components, hooks and logic.

/** The three currencies this tool understands. GBP is always the "home" currency. */
export type Currency = "GBP" | "HUF" | "EUR";

/** A cost item can either be a single flat fee, or a fee charged per traveler. */
export type PricingType = "group" | "perPerson";

/** Exchange rates needed to turn HUF and EUR amounts into GBP. */
export interface ExchangeRates {
  /** How many GBP one HUF is worth, e.g. 0.0022 */
  hufToGbp: number;
  /** How many GBP one EUR is worth, e.g. 0.84 */
  eurToGbp: number;
}

/** Trip-level information: name, date range and the money-conversion rates. */
export interface TripMetadata {
  tripName: string;
  tripDateFrom: string; // ISO date string, e.g. "2026-10-12"
  tripDateTo: string; // ISO date string, e.g. "2026-10-15"
  exchangeRates: ExchangeRates;
}

/** One line in the itinerary/program list, e.g. "City tour" or "Therapy session". */
export interface ProgramLineItem {
  id: string;
  name: string;
  /** The price as entered by the user, in whatever currency they picked. */
  price: number;
  currency: Currency;
  /** "group" = one flat cost. "perPerson" = multiplied by traveler count. */
  pricingType: PricingType;
}

/** One of the 3 side-by-side "what if" columns, e.g. "6 payers". */
export interface Scenario {
  id: string;
  label: string;
  numPayers: number;
  totalTravelers: number;
}

/**
 * One stretch of the trip spent at a particular hotel, e.g. "2 nights at
 * Hotel A, then 3 nights at Hotel B". A trip can have as many of these as
 * it needs - they all add together, they are not alternatives to pick
 * between. Each traveler is assumed to need one room for every night.
 */
export interface AccommodationStay {
  id: string;
  name: string;
  pricePerNight: number;
  currency: Currency;
  nights: number;
}

/**
 * One transportation cost, e.g. "Airport coach" or "Internal flight".
 * Like accommodation stays, these all add together - a trip might use a
 * coach for the airport run AND a train between two cities, and both are
 * listed here. "units" is how many times this cost is incurred (e.g. a
 * round trip = 2 units); "group" pricing ignores traveler count, "perPerson"
 * multiplies by the total number of travelers.
 */
export interface TransportationItem {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  pricingType: PricingType;
  units: number;
}

/** The full state of the tool - this whole object is what gets saved as JSON. */
export interface TripData {
  metadata: TripMetadata;
  programs: ProgramLineItem[];
  accommodation: AccommodationStay[];
  transportation: TransportationItem[];
  scenarios: Scenario[];
  /** The price charged to a single paying customer, already in GBP. */
  packageSalePriceGbp: number;
}

/**
 * A trip once it has been submitted and saved. Everything from TripData,
 * plus the bits that only make sense once something is actually stored:
 * an id to look it up by, and when it was created/last changed.
 */
export interface SavedTrip extends TripData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/** The calculated cost of a single line, for a single scenario. */
export interface CostBreakdown {
  id: string;
  name: string;
  costGbp: number;
}

/** The calculated numbers for one scenario column, ready to render. */
export interface ScenarioResult {
  scenarioId: string;
  label: string;
  numPayers: number;
  totalTravelers: number;
  lineItems: CostBreakdown[];
  totalExpenseGbp: number;
  expensePerPersonGbp: number;
  revenueGbp: number;
  profitGbp: number;
}
