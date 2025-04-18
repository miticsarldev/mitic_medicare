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
  
      // Vérifie si le patient existe
      const patientExists = await prisma.patient.findUnique({
        where: { id: params.patientId }
      });
  
      if (!patientExists) {
        return NextResponse.json(
          { error: "Patient introuvable" },
          { status: 404 }
        );
      }
  
      // Créer l'historique médical
      await prisma.medicalHistory.create({
        data: {
          title,
          condition,
          details,
          diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : undefined,
          status,
          patientId: params.patientId,
          createdBy: session.user.id
        }
      });
  
      const updatedPatient = await prisma.patient.findUnique({
        where: { id: params.patientId },
        include: {
          medicalHistories: true
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
  