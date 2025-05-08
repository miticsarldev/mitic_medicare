export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });

    if (!doctor) {
      return NextResponse.json(
        { message: "Médecin non trouvé" },
        { status: 404 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        hospital: true,
        medicalRecord: {
          include: {
            prescription: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });

    const formattedAppointments = appointments.map((appointment) => {
      const { patient, medicalRecord } = appointment;

      return {
        id: appointment.id,
        patientName: patient.user.name,
        date: appointment.scheduledAt,
        scheduledAt: appointment.scheduledAt,
        status: appointment.status,
        motif: appointment.reason || "Non spécifié",
        notes: appointment.notes || "Aucune note",
        prescription: medicalRecord?.prescription?.[0] || null,
      };
    });

    return NextResponse.json(formattedAppointments, { status: 200 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
