import type {
  AccommodationStay,
  CostBreakdown,
  ExchangeRates,
  ProgramLineItem,
  Scenario,
  ScenarioResult,
  TransportationItem,
  TripData,
} from "./TripCalculator.types";
import { convertToGbp } from "./TripCalculator.utils";

/**
 * Works out what a single program line item costs, in GBP, for a scenario
 * with a given number of total travelers.
 *  - "group" items cost the same no matter how many people are on the trip.
 *  - "perPerson" items are multiplied by the total number of travelers.
 */
export function calculateProgramCostGbp(
  program: ProgramLineItem,
  totalTravelers: number,
  rates: ExchangeRates
): number {
  const unitCostGbp = convertToGbp(program.price, program.currency, rates);
  return program.pricingType === "perPerson"
    ? unitCostGbp * totalTravelers
    : unitCostGbp;
}

/**
 * Works out the bill for one hotel stay, in GBP: the nightly rate x the
 * number of nights for that stay x the number of travelers (everyone
 * needs a room, every night of that stay).
 */
export function calculateStayCostGbp(
  stay: AccommodationStay,
  totalTravelers: number,
  rates: ExchangeRates
): number {
  const nightlyRateGbp = convertToGbp(stay.pricePerNight, stay.currency, rates);
  return nightlyRateGbp * stay.nights * totalTravelers;
}

/**
 * Works out one transportation line's cost, in GBP: the price x how many
 * times it's used (units) x - for "perPerson" items only - the number of
 * travelers. A "group" item (e.g. one coach hire) ignores traveler count.
 */
export function calculateTransportationCostGbp(
  item: TransportationItem,
  totalTravelers: number,
  rates: ExchangeRates
): number {
  const unitCostGbp = convertToGbp(item.price, item.currency, rates);
  const perUnitCost =
    item.pricingType === "perPerson"
      ? unitCostGbp * totalTravelers
      : unitCostGbp;
  return perUnitCost * item.units;
}

/**
 * Calculates every number needed to render one scenario column: the cost
 * of every accommodation stay, every transportation item and every other
 * program line, the total trip expense, the expense per person, the
 * revenue from the paying customers, and the profit.
 *
 * Revenue assumes every payer buys the package at the same sale price,
 * and that the payers cover the cost of every traveler (payers + guests).
 */
export function calculateScenarioResult(
  scenario: Scenario,
  programs: ProgramLineItem[],
  accommodation: AccommodationStay[],
  transportation: TransportationItem[],
  rates: ExchangeRates,
  packageSalePriceGbp: number
): ScenarioResult {
  const accommodationLines: CostBreakdown[] = accommodation.map((stay) => ({
    id: stay.id,
    name: `${stay.name} (${stay.nights} night${stay.nights === 1 ? "" : "s"})`,
    costGbp: calculateStayCostGbp(stay, scenario.totalTravelers, rates),
  }));

  const transportationLines: CostBreakdown[] = transportation.map((item) => ({
    id: item.id,
    name: item.units === 1 ? item.name : `${item.name} (x${item.units})`,
    costGbp: calculateTransportationCostGbp(
      item,
      scenario.totalTravelers,
      rates
    ),
  }));

  const programLines: CostBreakdown[] = programs.map((program) => ({
    id: program.id,
    name: program.name,
    costGbp: calculateProgramCostGbp(program, scenario.totalTravelers, rates),
  }));

  const lineItems = [
    ...accommodationLines,
    ...transportationLines,
    ...programLines,
  ];

  const totalExpenseGbp = lineItems.reduce(
    (sum, item) => sum + item.costGbp,
    0
  );
  const expensePerPersonGbp =
    scenario.numPayers > 0 ? totalExpenseGbp / scenario.numPayers : 0;

  const revenueGbp = packageSalePriceGbp * scenario.numPayers;
  const profitGbp = revenueGbp - totalExpenseGbp;

  return {
    scenarioId: scenario.id,
    label: scenario.label,
    numPayers: scenario.numPayers,
    totalTravelers: scenario.totalTravelers,
    lineItems,
    totalExpenseGbp,
    expensePerPersonGbp,
    revenueGbp,
    profitGbp,
  };
}

/** Runs calculateScenarioResult for every scenario in the trip. */
export function calculateAllScenarios(trip: TripData): ScenarioResult[] {
  return trip.scenarios.map((scenario) =>
    calculateScenarioResult(
      scenario,
      trip.programs,
      trip.accommodation,
      trip.transportation,
      trip.metadata.exchangeRates,
      trip.packageSalePriceGbp
    )
  );
}
