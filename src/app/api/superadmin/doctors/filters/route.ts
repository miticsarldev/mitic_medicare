export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Villes distinctes
    // ✅ Get distinct cities from hospitals that have doctors
    const cities = await prisma.hospital.findMany({
      where: {
        city: { not: "" },
        doctors: {
          some: {},
        },
      },
      select: {
        city: true,
      },
      distinct: ["city"],
      orderBy: {
        city: "asc",
      },
    });

    const uniqueCities = cities.map((h) => h.city).filter(Boolean);

    return NextResponse.json({
      cities: uniqueCities,
    });
  } catch (error) {
    console.error("[FILTERS_API_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
