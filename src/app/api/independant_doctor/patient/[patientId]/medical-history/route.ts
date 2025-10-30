import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { patientId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { title, condition, details, diagnosedDate, status } = await request.json();
    
    // Handle both appointmentId and patientId
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.patientId },
      select: { patientId: true }
    });

    const realPatientId = appointment?.patientId || params.patientId;

    // Vérifie si le patient existe
    const patientExists = await prisma.patient.findUnique({
      where: { id: realPatientId }
    });

    if (!patientExists) {
      return NextResponse.json(
        { error: "Patient introuvable" },
        { status: 404 }
      );
    }

    // Vérifie si l'utilisateur est un médecin et récupère son doctorId
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id }
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Seul un médecin peut créer un historique médical" },
        { status: 403 }
      );
    }

    // Créer l'historique médical avec le doctorId
    await prisma.medicalHistory.create({
      data: {
        title,
        condition,
        details,
        diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : undefined,
        status,
        patientId: realPatientId,
        doctorId: doctor.id, // Ajout du doctorId
        createdBy: session.user.id
      }
    });

    const updatedPatient = await prisma.patient.findUnique({
      where: { id: realPatientId },
      include: {
        medicalHistories: {
          include: {
            doctor: true // Inclure les informations du médecin dans la réponse
          }
        }
      }
    });

    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'historique:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}