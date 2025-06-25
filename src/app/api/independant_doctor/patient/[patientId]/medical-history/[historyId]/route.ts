
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();
// Nouvelle méthode PUT (modification)
export async function PUT(
  request: Request,
  { params }: { params: { patientId: string; historyId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { title, condition, details, diagnosedDate, status } = await request.json();

    // Trouver le rendez-vous pour obtenir le vrai patientId
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.patientId },
      select: { patientId: true }
    });

    if (!appointment) {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }

    const realPatientId = appointment.patientId;

    // Vérifier que l'historique appartient bien à ce patient
    const history = await prisma.medicalHistory.findFirst({
      where: {
        id: params.historyId,
        patientId: realPatientId
      }
    });

    if (!history) {
      return NextResponse.json(
        { error: "Historique médical introuvable ou ne correspond pas au patient" },
        { status: 404 }
      );
    }

    // Mettre à jour l'historique
    await prisma.medicalHistory.update({
      where: { id: params.historyId },
      data: {
        title,
        condition,
        details,
        diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : null,
        status,
      }
    });

    // Retourner le patient mis à jour
    const updatedPatient = await prisma.patient.findUnique({
      where: { id: realPatientId },
      include: {
        medicalHistories: true
      }
    });

    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'historique:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// Nouvelle méthode DELETE (suppression)
export async function DELETE(
  request: Request,
  { params }: { params: { patientId: string; historyId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Trouver le rendez-vous pour obtenir le vrai patientId
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.patientId },
      select: { patientId: true }
    });

    if (!appointment) {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }

    const realPatientId = appointment.patientId;

    // Vérifier que l'historique appartient bien à ce patient
    const history = await prisma.medicalHistory.findFirst({
      where: {
        id: params.historyId,
        patientId: realPatientId
      }
    });

    if (!history) {
      return NextResponse.json(
        { error: "Historique médical introuvable ou ne correspond pas au patient" },
        { status: 404 }
      );
    }

    // Supprimer l'historique
    await prisma.medicalHistory.delete({
      where: { id: params.historyId }
    });

    // Retourner le patient mis à jour
    const updatedPatient = await prisma.patient.findUnique({
      where: { id: realPatientId },
      include: {
        medicalHistories: true
      }
    });

    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'historique:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}