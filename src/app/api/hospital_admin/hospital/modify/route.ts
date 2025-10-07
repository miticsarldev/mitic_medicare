export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Liste des champs autorisés à être modifiés
    const {
      name,
      address,
      city,
      state,
      country,
      phone,
      email,
      website,
      description,
      logoUrl,
      status,
    } = body;

    // Vérification de l’existence de l’hôpital
    const hospital = await prisma.hospital.findUnique({
      where: { adminId: session.user.id },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    // Mise à jour de l’hôpital
    const updatedHospital = await prisma.hospital.update({
      where: { id: hospital.id },
      data: {
        name,
        address,
        city,
        state,
        country,
        phone,
        email,
        website,
        description,
        logoUrl,
        status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ hospital: updatedHospital });
  } catch (error) {
    console.error("Error updating hospital:", error);
    return NextResponse.json(
      { error: "Failed to update hospital info" },
      { status: 500 }
    );
  }
}
