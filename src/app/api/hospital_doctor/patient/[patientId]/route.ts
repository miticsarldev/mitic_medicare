import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { patientId: string } }) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.patientId },
      select: { patientId: true }
    });

    const actualPatientId = appointment?.patientId || params.patientId;

    const patient = await prisma.patient.findUnique({
      where: { id: actualPatientId },
      include: {
        user: true,
        medicalHistories: {
          orderBy: { diagnosedDate: 'desc' }
        },
        appointments: {
          where: { status: 'COMPLETED' },
          orderBy: { scheduledAt: 'desc' },
          include: {
            doctor: {
              include: { user: true }
            },
            medicalRecord: {
              include: { prescriptions: true }
            }
          }
        },
        vitalSigns: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient non trouvé" }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Erreur lors de la récupération du patient:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}