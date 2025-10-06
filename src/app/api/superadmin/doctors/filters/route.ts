export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [hospitalCities, profileCities] = await Promise.all([
      prisma.hospital.findMany({
        where: { city: { not: "" }, doctors: { some: {} } },
        select: { city: true },
        distinct: ["city"],
        orderBy: { city: "asc" },
      }),
      prisma.userProfile.findMany({
        where: {
          city: { not: null },
          user: { doctor: { isNot: null } },
        },
        select: { city: true },
        distinct: ["city"],
        orderBy: { city: "asc" },
      }),
    ]);

    const set = new Set<string>();
    hospitalCities.forEach((h) => h.city && set.add(h.city));
    profileCities.forEach((p) => p.city && set.add(p.city!));

    return NextResponse.json({ cities: Array.from(set).sort() });
  } catch (error) {
    console.error("[FILTERS_API_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
