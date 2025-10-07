export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer l’hôpital de l’admin connecté
    const hospital = await prisma.hospital.findUnique({
      where: { adminId: session.user.id },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        country: true,
        phone: true,
        email: true,
        website: true,
        description: true,
        logoUrl: true,
        isVerified: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            doctors: true,
            departments: true,
            appointments: true,
            medicalRecords: true,
            reviews: true,
          },
        },
      },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ hospital });
  } catch (error) {
    console.error("Error fetching hospital info:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospital info" },
      { status: 500 }
    );
  }
}
