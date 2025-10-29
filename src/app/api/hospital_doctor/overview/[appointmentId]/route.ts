import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppointmentStatus } from "@prisma/client";
import { revalidateTag } from "next/cache";

export async function PATCH(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { status } = await request.json();
    const validStatuses: AppointmentStatus[] = [
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELED",
      "NO_SHOW",
    ] as const;
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });
    if (!doctor)
      return NextResponse.json(
        { error: "Médecin non trouvé" },
        { status: 404 }
      );

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.appointmentId, doctorId: doctor.id },
      data: { status },
      include: { patient: { include: { user: true } }, hospital: true },
    });

    revalidateTag(`doctor:overview:${doctor.id}`);

    return NextResponse.json({
      id: updatedAppointment.id,
      status: updatedAppointment.status,
      message: "Statut mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
