import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.patientId },
      select: { patientId: true },
    });

    const actualPatientId = appointment?.patientId || params.patientId;

    const patient = await prisma.patient.findUnique({
      where: { id: actualPatientId },
      select: {
        id: true,
        bloodType: true,
        allergies: true,
        emergencyContact: true,
        emergencyPhone: true,
        emergencyRelation: true,
        insuranceProvider: true,
        insuranceNumber: true,
        medicalNotes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            dateOfBirth: true,
          },
        },
        medicalHistories: {
          orderBy: { diagnosedDate: "desc" },
          select: {
            id: true,
            title: true,
            condition: true,
            diagnosedDate: true,
            status: true,
            details: true,
          },
        },
        appointments: {
          where: { status: "COMPLETED" },
          orderBy: { scheduledAt: "desc" },
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            type: true,
            reason: true,
            notes: true,
            doctor: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            medicalRecord: {
              select: {
                id: true,
                diagnosis: true,
                treatment: true,
                prescription: {
                  select: {
                    id: true,
                    medicationName: true,
                    dosage: true,
                    frequency: true,
                    duration: true,
                    instructions: true,
                  },
                },
              },
            },
          },
        },
        vitalSigns: {
          orderBy: { recordedAt: "desc" },
          take: 1,
          select: {
            id: true,
            temperature: true,
            heartRate: true,
            bloodPressureSystolic: true,
            bloodPressureDiastolic: true,
            oxygenSaturation: true,
            weight: true,
            height: true,
            recordedAt: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Erreur lors de la récupération du patient:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
