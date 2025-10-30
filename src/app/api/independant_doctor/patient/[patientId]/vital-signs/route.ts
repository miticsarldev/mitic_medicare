// app/api/INDEPENDENT_DOCTOR/patient/[appointmentId]/vital-signes/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const {
    temperature,
    heartRate,
    bloodPressureSystolic,
    bloodPressureDiastolic,
    oxygenSaturation,
    weight,
    height,
  } = await request.json();

  try {
    // Handle both appointmentId and patientId
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.patientId },
      select: { patientId: true },
    });

    const actualPatientId = appointment?.patientId || params.patientId;

    // 1. Vérifier que le patient existe
    const patient = await prisma.patient.findUnique({
      where: { id: actualPatientId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json(
        { error: "Patient introuvable" },
        { status: 404 }
      );
    }

    // 2. Mettre à jour ou créer les signes vitaux
    const existingVitalSign = await prisma.vitalSign.findFirst({
      where: { patientId: actualPatientId },
      orderBy: { recordedAt: "desc" },
    });

    if (existingVitalSign) {
      await prisma.vitalSign.update({
        where: { id: existingVitalSign.id },
        data: {
          temperature,
          heartRate,
          bloodPressureSystolic,
          bloodPressureDiastolic,
          oxygenSaturation,
          weight,
          height,
          recordedAt: new Date(),
        },
      });
    } else {
      await prisma.vitalSign.create({
        data: {
          patientId: actualPatientId,
          temperature,
          heartRate,
          bloodPressureSystolic,
          bloodPressureDiastolic,
          oxygenSaturation,
          weight,
          height,
          recordedAt: new Date(),
        },
      });
    }

    // 3. Renvoyer les données complètes du patient (comme dans le GET)
    const updatedPatient = await prisma.patient.findUnique({
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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

    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error("Erreur mise à jour signes vitaux :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const {
    temperature,
    heartRate,
    bloodPressureSystolic,
    bloodPressureDiastolic,
    oxygenSaturation,
    weight,
    height,
  } = await request.json();

  try {
    // Handle both appointmentId and patientId
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.patientId },
      select: { patientId: true },
    });

    const actualPatientId = appointment?.patientId || params.patientId;

    const doctor = await prisma.doctor.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!doctor) {
      return NextResponse.json({ error: "Médecin non trouvé" }, { status: 404 });
    }

    // Ensure doctor has relationship with patient
    const linked = await prisma.appointment.findFirst({
      where: { patientId: actualPatientId, doctorId: doctor.id },
      select: { id: true },
    });
    if (!linked) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const created = await prisma.vitalSign.create({
      data: {
        patientId: actualPatientId,
        temperature: temperature ?? null,
        heartRate: heartRate ?? null,
        bloodPressureSystolic: bloodPressureSystolic ?? null,
        bloodPressureDiastolic: bloodPressureDiastolic ?? null,
        oxygenSaturation: oxygenSaturation ?? null,
        weight: weight ?? null,
        height: height ?? null,
        recordedAt: new Date(),
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (error) {
    console.error("Erreur création signes vitaux :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
