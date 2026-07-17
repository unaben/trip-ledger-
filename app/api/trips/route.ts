import { NextResponse } from "next/server";
import { createTrip, listTrips } from "@/lib/storage";
import type { TripData } from "@/features/TripCalculator/TripCalculator.types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const trips = await listTrips({
      name: searchParams.get("name") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
    });
    return NextResponse.json(trips);
  } catch (err) {
    console.error("GET /api/trips failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let body: TripData;
  try {
    body = (await request.json()) as TripData;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const trip = await createTrip(body);
    return NextResponse.json(trip, { status: 201 });
  } catch (err) {
    console.error("POST /api/trips failed:", err);
    return NextResponse.json(
      { error: "Failed to create trip" },
      { status: 500 }
    );
  }
}
