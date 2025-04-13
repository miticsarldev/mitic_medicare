import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { adminId: string } }
) {
  const adminId = params.adminId;

  if (!adminId) {
    return NextResponse.json({ error: "adminId est requis" }, { status: 400 });
  }

  try {
    const hospital = await prisma.hospital.findUnique({
      where: { adminId },
      select: { id: true },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hôpital non trouvé" },
        { status: 404 }
      );
    }

    const patients = await prisma.patient.findMany({
      where: {
        user: {
          hospital: {
            id: hospital.id,
          },
        },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            dateOfBirth: true,
          },
        },
        bloodType: true,
      },
    });

    return NextResponse.json({ totalPatients: patients.length, patients });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur", details: error },
      { status: 500 }
    );
  }
}
