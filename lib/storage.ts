import { Prisma } from "@prisma/client";
import type {
  Currency,
  PricingType,
  LineItem as PrismaLineItem,
  Trip as PrismaTrip,
} from "@prisma/client";
import prisma from "./prisma";
import {
  Scenario,
  SavedTrip,
  AccommodationStay,
  TransportationItem,
  ProgramLineItem,
  TripData,
} from "@/features/TripCalculator/TripCalculator.types";
import { createId } from "@/features/TripCalculator/TripCalculator.utils";

type TripWithLineItems = PrismaTrip & { lineItems: PrismaLineItem[] };

/** Thrown internally to break out of a transaction when 
the target trip doesn't exist; never leaves this file. */
class TripNotFoundError extends Error {}

function toNum(value: Prisma.Decimal | number): number {
  return typeof value === "number" ? value : value.toNumber();
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseScenarios(value: Prisma.JsonValue): Scenario[] {
  return Array.isArray(value) ? (value as unknown as Scenario[]) : [];
}

/** Turns one Prisma trip (with its line items included) 
back into the SavedTrip shape the rest of the app expects. */
function toSavedTrip(trip: TripWithLineItems): SavedTrip {
  const accommodation: AccommodationStay[] = [];
  const transportation: TransportationItem[] = [];
  const programs: ProgramLineItem[] = [];

  for (const item of trip.lineItems) {
    if (item.category === "accommodation") {
      accommodation.push({
        id: item.id,
        name: item.name,
        pricePerNight: toNum(item.price),
        currency: item.currency as Currency,
        nights: item.nights ?? 1,
      });
    } else if (item.category === "transportation") {
      transportation.push({
        id: item.id,
        name: item.name,
        price: toNum(item.price),
        currency: item.currency as Currency,
        pricingType: (item.pricingType ?? "group") as PricingType,
        units: item.units ?? 1,
      });
    } else {
      programs.push({
        id: item.id,
        name: item.name,
        price: toNum(item.price),
        currency: item.currency as Currency,
        pricingType: (item.pricingType ?? "group") as PricingType,
      });
    }
  }

  return {
    id: trip.id,
    metadata: {
      tripName: trip.tripName,
      tripDateFrom: toDateStr(trip.tripDateFrom),
      tripDateTo: toDateStr(trip.tripDateTo),
      exchangeRates: {
        hufToGbp: toNum(trip.hufToGbp),
        eurToGbp: toNum(trip.eurToGbp),
      },
    },
    accommodation,
    transportation,
    programs,
    scenarios: parseScenarios(trip.scenarios),
    packageSalePriceGbp: toNum(trip.packageSalePriceGbp),
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
  };
}

/** Flattens a trip's three line-item arrays into rows ready for createMany. */
function buildLineItemRows(tripId: string, data: TripData) {
  return [
    ...data.accommodation.map((stay) => ({
      id: stay.id,
      tripId,
      category: "accommodation" as const,
      name: stay.name,
      price: stay.pricePerNight,
      currency: stay.currency,
      pricingType: null,
      units: null,
      nights: stay.nights,
    })),
    ...data.transportation.map((item) => ({
      id: item.id,
      tripId,
      category: "transportation" as const,
      name: item.name,
      price: item.price,
      currency: item.currency,
      pricingType: item.pricingType,
      units: item.units,
      nights: null,
    })),
    ...data.programs.map((prog) => ({
      id: prog.id,
      tripId,
      category: "program" as const,
      name: prog.name,
      price: prog.price,
      currency: prog.currency,
      pricingType: prog.pricingType,
      units: null,
      nights: null,
    })),
  ];
}

export interface TripFilter {
  /** Case-insensitive, partial match against the trip name. */
  name?: string;
  /** Only include trips whose date range starts on/after this date. */
  dateFrom?: string;
  /** Only include trips whose date range starts on/before this date. */
  dateTo?: string;
}

export async function listTrips(filter: TripFilter = {}): Promise<SavedTrip[]> {
  const tripDateFromFilter: { gte?: Date; lte?: Date } = {};
  if (filter.dateFrom) tripDateFromFilter.gte = new Date(filter.dateFrom);
  if (filter.dateTo) tripDateFromFilter.lte = new Date(filter.dateTo);

  try {
    const trips = await prisma.trip.findMany({
      where: {
        ...(filter.name ? { tripName: { contains: filter.name } } : {}),
        ...(Object.keys(tripDateFromFilter).length
          ? { tripDateFrom: tripDateFromFilter }
          : {}),
      },
      include: { lineItems: true },
      orderBy: { createdAt: "desc" },
    });

    return trips.map(toSavedTrip);
  } catch (err) {
    console.error("listTrips failed:", err);
    throw new Error("Failed to load trips");
  }
}

export async function getTripById(id: string): Promise<SavedTrip | null> {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { lineItems: true },
    });
    return trip ? toSavedTrip(trip) : null;
  } catch (err) {
    console.error(`getTripById(${id}) failed:`, err);
    throw new Error("Failed to load trip");
  }
}

const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 20_000 };

export async function createTrip(data: TripData): Promise<SavedTrip> {
  const id = createId("trip");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.trip.create({
        data: {
          id,
          tripName: data.metadata.tripName,
          tripDateFrom: new Date(data.metadata.tripDateFrom),
          tripDateTo: new Date(data.metadata.tripDateTo),
          hufToGbp: data.metadata.exchangeRates.hufToGbp,
          eurToGbp: data.metadata.exchangeRates.eurToGbp,
          scenarios: data.scenarios as unknown as Prisma.InputJsonValue,
          packageSalePriceGbp: data.packageSalePriceGbp,
        },
      });

      const lineItems = buildLineItemRows(id, data);
      if (lineItems.length > 0) {
        await tx.lineItem.createMany({ data: lineItems });
      }
    }, TRANSACTION_OPTIONS);
  } catch (err) {
    console.error("createTrip failed:", err);
    throw new Error("Failed to save trip");
  }

  const saved = await getTripById(id);
  if (!saved) throw new Error("Trip was saved but could not be re-read");
  return saved;
}

export async function updateTrip(
  id: string,
  data: TripData
): Promise<SavedTrip | null> {
  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.trip.updateMany({
        where: { id },
        data: {
          tripName: data.metadata.tripName,
          tripDateFrom: new Date(data.metadata.tripDateFrom),
          tripDateTo: new Date(data.metadata.tripDateTo),
          hufToGbp: data.metadata.exchangeRates.hufToGbp,
          eurToGbp: data.metadata.exchangeRates.eurToGbp,
          scenarios: data.scenarios as unknown as Prisma.InputJsonValue,
          packageSalePriceGbp: data.packageSalePriceGbp,
        },
      });

      if (updated.count === 0) {
        throw new TripNotFoundError();
      }

      await tx.lineItem.deleteMany({ where: { tripId: id } });

      const lineItems = buildLineItemRows(id, data);
      if (lineItems.length > 0) {
        await tx.lineItem.createMany({ data: lineItems });
      }
    }, TRANSACTION_OPTIONS);
  } catch (err) {
    if (err instanceof TripNotFoundError) return null;
    console.error(`updateTrip(${id}) failed:`, err);
    throw new Error("Failed to update trip");
  }

  return getTripById(id);
}

export async function deleteTrip(id: string): Promise<boolean> {
  try {
    const result = await prisma.trip.deleteMany({ where: { id } });
    return result.count > 0;
  } catch (err) {
    console.error(`deleteTrip(${id}) failed:`, err);
    throw new Error("Failed to delete trip");
  }
}
