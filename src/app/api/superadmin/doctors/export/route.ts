export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = (await req.json()) as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const docs = await prisma.doctor.findMany({
      where: { id: { in: ids } },
      include: {
        user: { include: { profile: true } },
        hospital: true,
        subscription: true,
      },
    });

    const data = docs.map((d) => ({
      id: d.id,
      name: d.user.name,
      email: d.user.email,
      phone: d.user.phone,
      isActive: d.user.isActive ? "Oui" : "Non",
      isVerified: d.isVerified ? "Oui" : "Non",
      profileType: d.isIndependent ? "Indépendant" : "Hôpital",
      specialty: d.specialization,
      city: d.user.profile?.city ?? "",
      hospital: d.hospital?.name ?? "",
      subscriptionPlan: d.isIndependent ? (d.subscription?.plan ?? "") : "",
      createdAt: d.user.createdAt.toISOString(),
    }));

    return NextResponse.json({ data });
  } catch (e) {
    console.error("Export error", e);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
