import type { TripData } from "./TripCalculator.types";
import { createId } from "./TripCalculator.utils";

export function createDefaultTripData(): TripData {
  return {
    metadata: {
      tripName: "Autumn Retreat",
      tripDateFrom: "2026-10-12",
      tripDateTo: "2026-10-15",
      exchangeRates: {
        hufToGbp: 0.0022,
        eurToGbp: 0.84,
      },
    },
    accommodation: [
      {
        id: createId("stay"),
        name: "Hévíz Hotel",
        pricePerNight: 42000,
        currency: "HUF",
        nights: 2,
      },
      {
        id: createId("stay"),
        name: "Lakeside Hotel",
        pricePerNight: 38000,
        currency: "HUF",
        nights: 1,
      },
    ],
    transportation: [
      {
        id: createId("trans"),
        name: "Airport coach transfer",
        price: 250,
        currency: "GBP",
        pricingType: "group",
        units: 1,
      },
      {
        id: createId("trans"),
        name: "Inter-city train",
        price: 25,
        currency: "EUR",
        pricingType: "perPerson",
        units: 2,
      },
    ],
    programs: [
      {
        id: createId("prog"),
        name: "City tour with guide",
        price: 350,
        currency: "EUR",
        pricingType: "group",
      },
      {
        id: createId("prog"),
        name: "Group dinner",
        price: 8500,
        currency: "HUF",
        pricingType: "perPerson",
      },
      {
        id: createId("prog"),
        name: "Therapy session",
        price: 60,
        currency: "EUR",
        pricingType: "perPerson",
      },
    ],
    scenarios: [
      {
        id: createId("scn"),
        label: "Small group",
        numPayers: 6,
        totalTravelers: 8,
      },
      {
        id: createId("scn"),
        label: "Medium group",
        numPayers: 8,
        totalTravelers: 10,
      },
      {
        id: createId("scn"),
        label: "Large group",
        numPayers: 10,
        totalTravelers: 12,
      },
    ],
    packageSalePriceGbp: 650,
  };
}

export function createBlankTripData(): TripData {
  return {
    metadata: {
      tripName: "",
      tripDateFrom: "",
      tripDateTo: "",
      exchangeRates: {
        hufToGbp: 0,
        eurToGbp: 0,
      },
    },
    accommodation: [],
    transportation: [],
    programs: [],
    scenarios: [
      {
        id: createId("scn"),
        label: "Scenario 1",
        numPayers: 0,
        totalTravelers: 0,
      },
      {
        id: createId("scn"),
        label: "Scenario 2",
        numPayers: 0,
        totalTravelers: 0,
      },
      {
        id: createId("scn"),
        label: "Scenario 3",
        numPayers: 0,
        totalTravelers: 0,
      },
    ],
    packageSalePriceGbp: 0,
  };
}
