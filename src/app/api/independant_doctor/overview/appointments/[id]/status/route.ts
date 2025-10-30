export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AppointmentStatus, Prisma } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const appointmentId = params.id;
    const body = (await req.json()) as {
      status: AppointmentStatus;
      cancellationReason?: string;
    };

    if (!body?.status) {
      return NextResponse.json({ error: "Statut requis" }, { status: 400 });
    }

    const allowed: AppointmentStatus[] = [
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.CANCELED,
      AppointmentStatus.COMPLETED,
    ];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, doctorId: true, status: true },
    });
    if (!appt) {
      return NextResponse.json({ error: "RDV introuvable" }, { status: 404 });
    }

    // Ensure appointment belongs to the logged independant doctor
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!doctor || doctor.id !== appt.doctorId) {
      return NextResponse.json({ error: "Interdit" }, { status: 403 });
    }

    const updateData: Prisma.AppointmentUpdateInput = { status: body.status };
    if (body.status === "CANCELED") {
      updateData.cancellationReason = body.cancellationReason ?? null;
      updateData.cancelledAt = new Date();
    }
    if (body.status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      select: {
        id: true,
        status: true,
        cancellationReason: true,
        completedAt: true,
        cancelledAt: true,
      },
    });

    return NextResponse.json({ success: true, appointment: updated });
  } catch (err) {
    console.error("Error updating appointment status:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
