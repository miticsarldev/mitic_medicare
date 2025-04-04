export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est authentifié et est HOSPITAL_ADMIN
    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer l'hôpital de l'admin
    const hospital = await prisma.hospital.findUnique({
      where: { adminId: session.user.id },
      select: { id: true },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found for this admin" },
        { status: 404 }
      );
    }

    // Récupérer le nombre total de patients de cet hôpital
    const totalPatients = await prisma.patient.count({
      where: {
        user: {
          hospital: { id: hospital.id },
        },
      },
    });

    return NextResponse.json({ totalPatients });
  } catch (error) {
    console.error("Error fetching patient count:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient count" },
      { status: 500 }
    );
  }
}
