import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const doctor = await prisma.doctor.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!doctor) {
    return NextResponse.json({ error: "Médecin non trouvé" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || undefined;

  const from = searchParams.get("from")
    ? new Date(searchParams.get("from")!)
    : undefined;
  const to = searchParams.get("to")
    ? new Date(searchParams.get("to")!)
    : undefined;

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10))
  );

  const whereAppt: Prisma.AppointmentWhereInput = {
    doctorId: doctor.id,
    ...(from && to ? { scheduledAt: { gte: from, lte: to } } : {}),
  };

  const apptPatients = await prisma.appointment.findMany({
    where: whereAppt,
    select: { patientId: true },
    distinct: ["patientId"],
  });

  const recPatients = await prisma.medicalRecord.findMany({
    where: {
      doctorId: doctor.id,
      ...(from && to ? { createdAt: { gte: from, lte: to } } : {}),
    },
    select: { patientId: true },
    distinct: ["patientId"],
  });

  const patientIds = Array.from(
    new Set([...apptPatients, ...recPatients].map((x) => x.patientId))
  );

  // If there are no related patients, short-circuit to avoid invalid "in: []"
  if (patientIds.length === 0) {
    return NextResponse.json({
      range: { from: from?.toISOString(), to: to?.toISOString() },
      items: [],
      total: 0,
      page,
      pageSize,
    });
  }

  const wherePatient: Prisma.PatientWhereInput = {
    id: { in: patientIds },
    ...(q
      ? {
          user: {
            is: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { phone: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.patient.findMany({
      where: wherePatient,
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            appointments: true,
            medicalHistories: true,
            medicalRecords: true,
            vitalSigns: true,
          },
        },
        appointments: {
          where: from && to ? { scheduledAt: { gte: from, lte: to } } : {},
          orderBy: { scheduledAt: "desc" },
          select: { scheduledAt: true },
          take: 1,
        },
      },
      orderBy: { user: { name: "asc" } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.patient.count({ where: wherePatient }),
  ]);

  const payload = items.map((p) => ({
    id: p.id,
    userId: p.userId,
    name: p.user.name,
    phone: p.user.phone,
    email: p.user.email,
    avatarUrl: p.user.profile?.avatarUrl,
    bloodType: p.bloodType,
    lastActivity: p.appointments[0]?.scheduledAt?.toISOString() ?? null,
    counts: {
      appointments: p._count.appointments,
      medicalHistories: p._count.medicalHistories,
      medicalRecords: p._count.medicalRecords,
      vitalSigns: p._count.vitalSigns,
    },
  }));

  return NextResponse.json({
    range: { from: from?.toISOString(), to: to?.toISOString() },
    items: payload,
    total,
    page,
    pageSize,
  });
}
