// =============================================================
// FILE: app/api/medical_histories/[id]/route.ts (DELETE, PUT)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const doc = await prisma.doctor.findFirst({
    where: { userId: session.user.id },
  });
  if (!doc)
    return NextResponse.json({ error: "Médecin non trouvé" }, { status: 404 });

  const mh = await prisma.medicalHistory.findUnique({
    where: { id: params.id },
    include: { patient: true },
  });
  if (!mh) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const linked = await prisma.appointment.findFirst({
    where: { patientId: mh.patientId, doctorId: doc.id },
  });
  if (!linked)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  await prisma.medicalHistory.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { title, condition, status, diagnosedDate, details, patientId } =
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

  const mh = await prisma.medicalHistory.update({
    where: { id: params.id },
    data: {
      title,
      condition,
      status,
      diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : null,
      details: details ?? null,
    },
  });
  return NextResponse.json({ ok: true, id: mh.id });
}
