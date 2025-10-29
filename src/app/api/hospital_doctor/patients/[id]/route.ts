import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const doctor = await prisma.doctor.findFirst({
    where: { userId: session.user.id },
  });
  if (!doctor)
    return NextResponse.json({ error: "Médecin non trouvé" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from")
    ? new Date(searchParams.get("from")!)
    : undefined;
  const to = searchParams.get("to")
    ? new Date(searchParams.get("to")!)
    : undefined;

  const linked = await prisma.appointment.findFirst({
    where: { patientId: params.id, doctorId: doctor.id },
  });
  if (!linked)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: { user: { include: { profile: true } } },
  });
  if (!patient)
    return NextResponse.json({ error: "Patient introuvable" }, { status: 404 });

  const [histories, records, vitals, appts] = await Promise.all([
    prisma.medicalHistory.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.medicalRecord.findMany({
      where: {
        patientId: patient.id,
        ...(from && to ? { createdAt: { gte: from, lte: to } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { doctor: { include: { user: true } } },
      take: 50,
    }),
    prisma.vitalSign.findMany({
      where: {
        patientId: patient.id,
        ...(from && to ? { recordedAt: { gte: from, lte: to } } : {}),
      },
      orderBy: { recordedAt: "asc" },
      take: 100,
    }),
    prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        doctorId: doctor.id,
        ...(from && to ? { scheduledAt: { gte: from, lte: to } } : {}),
      },
      orderBy: { scheduledAt: "desc" },
      include: { doctor: { include: { user: true } } },
      take: 50,
    }),
  ]);

  return NextResponse.json({
    patient: {
      id: patient.id,
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      emergencyRelation: patient.emergencyRelation,
      insuranceProvider: patient.insuranceProvider,
      insuranceNumber: patient.insuranceNumber,
      medicalNotes: patient.medicalNotes,
      user: {
        id: patient.user.id,
        name: patient.user.name,
        phone: patient.user.phone,
        email: patient.user.email,
        profile: patient.user.profile,
        dateOfBirth: patient.user.dateOfBirth?.toISOString() ?? null,
      },
    },
    medicalHistories: histories.map((h) => ({
      id: h.id,
      title: h.title,
      condition: h.condition,
      status: h.status,
      diagnosedDate: h.diagnosedDate?.toISOString() ?? null,
      details: h.details ?? null,
      createdAt: h.createdAt.toISOString(),
    })),
    medicalRecords: records.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      diagnosis: r.diagnosis,
      treatment: r.treatment ?? null,
      followUpNeeded: r.followUpNeeded,
      followUpDate: r.followUpDate?.toISOString() ?? null,
      doctorName: r.doctor.user.name,
    })),
    vitalSigns: vitals.map((v) => ({
      id: v.id,
      recordedAt: v.recordedAt.toISOString(),
      temperature: v.temperature?.toString() ?? null,
      heartRate: v.heartRate ?? null,
      bloodPressure:
        v.bloodPressureSystolic && v.bloodPressureDiastolic
          ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}`
          : null,
      oxygenSaturation: v.oxygenSaturation ?? null,
      weight: v.weight?.toString() ?? null,
      height: v.height?.toString() ?? null,
    })),
    appointments: appts.map((a) => ({
      id: a.id,
      scheduledAt: a.scheduledAt.toISOString(),
      status: a.status,
      type: a.type,
      doctorName: a.doctor.user.name,
    })),
  });
}
