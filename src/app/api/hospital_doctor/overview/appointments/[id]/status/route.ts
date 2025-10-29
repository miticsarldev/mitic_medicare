// ==========================================================
// FILE: app/api/appointments/[id]/status/route.ts
// (Patch de statut avec validations + revalidation)
// ==========================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppointmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const status: AppointmentStatus | undefined = body?.status;
  const cancellationReason: string | undefined = body?.cancellationReason;

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { doctor: true },
  });
  if (!appointment)
    return NextResponse.json(
      { error: "Rendez-vous introuvable" },
      { status: 404 }
    );

  // Sécurité: l’utilisateur doit être le médecin concerné
  const doctor = await prisma.doctor.findFirst({
    where: { userId: session.user.id },
  });
  if (!doctor || doctor.id !== appointment.doctorId)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  // Transitions autorisées
  const allowed: Record<AppointmentStatus, AppointmentStatus[]> = {
    PENDING: ["CONFIRMED", "CANCELED"],
    CONFIRMED: ["COMPLETED", "CANCELED", "NO_SHOW"],
    COMPLETED: [],
    CANCELED: [],
    NO_SHOW: [],
  };
  if (!status || !allowed[appointment.status].includes(status)) {
    return NextResponse.json(
      { error: "Transition de statut invalide" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { status, updatedAt: new Date() };
  if (status === "CANCELED") {
    updateData.cancelledAt = new Date();
    updateData.cancellationReason = cancellationReason ?? null;
  }
  if (status === "COMPLETED") {
    updateData.completedAt = new Date();
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: updateData,
  });

  // Invalider le cache des pages pertinentes
  revalidatePath("/dashboard/hopital_doctor/overview");
  revalidatePath("/dashboard/hopital_doctor/appointments");

  return NextResponse.json({ ok: true });
}
