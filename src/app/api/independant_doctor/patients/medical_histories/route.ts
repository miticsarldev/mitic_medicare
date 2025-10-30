// =============================================================
// FILE: app/api/medical_histories/route.ts (POST)
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
  const { patientId, title, condition, status, diagnosedDate, details } =
    body ?? {};

  const doc = await prisma.doctor.findFirst({
    where: { userId: session.user.id },
  });
  if (!doc)
    return NextResponse.json({ error: "Médecin non trouvé" }, { status: 404 });

  const linked = await prisma.appointment.findFirst({
    where: { patientId, doctorId: doc.id },
  });
  if (!linked)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const mh = await prisma.medicalHistory.create({
    data: {
      patientId,
      title,
      condition,
      status,
      diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : null,
      details: details ?? null,
      createdBy: session.user.id,
    },
  });
  return NextResponse.json({ ok: true, id: mh.id });
}
