// =============================================================
// FILE: app/api/appointments/route.ts (POST)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { patientId, scheduledAt, type, notes } = body ?? {};

  const doctor = await prisma.doctor.findFirst({
    where: { userId: session.user.id },
  });
  if (!doctor)
    return NextResponse.json({ error: "Médecin non trouvé" }, { status: 404 });

  const appt = await prisma.appointment.create({
    data: {
      patientId,
      doctorId: doctor.id,
      hospitalId: doctor.hospitalId ?? null,
      scheduledAt: new Date(scheduledAt),
      type: type ?? null,
      notes: notes ?? null,
      status: "PENDING",
    },
  });
  return NextResponse.json({ ok: true, id: appt.id });
}
