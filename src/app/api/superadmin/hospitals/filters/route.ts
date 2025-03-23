import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Villes distinctes
    const cities = await prisma.hospital.findMany({
      select: { city: true },
      distinct: ["city"],
      where: { city: { not: "" } },
      orderBy: { city: "asc" },
    });

    // Plans de souscription utilisés
    const subscriptions = await prisma.subscription.findMany({
      select: { plan: true },
      distinct: ["plan"],
    });

    const uniqueCities = cities.map((h) => h.city).filter(Boolean);
    const uniquePlans = subscriptions.map((s) => s.plan);

    return NextResponse.json({
      cities: uniqueCities,
      subscriptionPlans: uniquePlans,
    });
  } catch (error) {
    console.error("[FILTERS_API_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
