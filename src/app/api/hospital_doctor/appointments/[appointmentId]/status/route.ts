import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: { appointmentId: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { status } = await request.json();

    // Validation du statut
    const validStatuses = ["PENDING", "CONFIRMED", "REJECTED", "COMPLETED", "CANCELED", "NO_SHOW"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" }, 
        { status: 400 }
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Médecin non trouvé" }, { status: 404 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { 
        id: params.appointmentId,
        doctorId: doctor.id
      },
      data: { status },
      include: {
        patient: {
          include: {
            user: true
          }
        },
        hospital: true
      }
    });

    await prisma.notification.create({
      data: {
        userId: updatedAppointment.patient.userId,
        title: "Statut de rendez-vous mis à jour",
        message: `Votre rendez-vous a été ${status === "CONFIRMED" ? "confirmé" : "refusé"} par le Dr. ${session.user.name}`,
        type: "APPOINTMENT"
      }
    });

    return NextResponse.json({
      id: updatedAppointment.id,
      status: updatedAppointment.status,
      message: "Statut mis à jour avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}