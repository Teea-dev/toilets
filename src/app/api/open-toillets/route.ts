import { NextResponse } from "next/server";
interface dataFormat {
  building: string;
  building_code: string;
  building_status: string;
  rooms: {
    [key: string]: {
      roomNumber: string;
      slot: { openTime: string; closeTime: string; status: string }[];
    };
  };
  coordinates: [number, number];
  distance: number;
}

export async function POST(req: Request) {
  try {
    const { lat, long } = await req.json();
    const response = await fetch(
      `https://api.open-toilets.org/api/v1/toilets?lat=${lat}&long=${long}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat,
          long,
        }),
      }
    );
    if (!response.ok) {
      return NextResponse.json("An error occurred", {
        status: response.status,
      });
    }
    const data: dataFormat[] = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Eroor in the route", err);
    return NextResponse.json("An error occurred", { status: 500 });
  }
}

export async function GET() {
  try {
    const response = await fetch(
      `https://api.open-toilets.org/api/v1/toilets?lat=0&long=0`,
      {
        method: "GET",
        cache: "no-cache",
      }
    );
    if (!response.ok) {
      return NextResponse.json("An error occurred", {
        status: response.status,
      });
    }
    const data: dataFormat[] = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in the route", err);
    return NextResponse.json("An error occurred", { status: 500 });
  }
}
