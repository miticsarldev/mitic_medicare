import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { patientId: string } }) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
      }
  
      const body = await request.json();
      const patient = await prisma.patient.findUnique({
        where: { id: params.patientId }
      });
      if (!patient) {
        console.log(params.patientId);
        return NextResponse.json({ error: "Patient introuvable" }, { status: 404 });
      }

      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.user.id },
      });
    if (!doctor) {
      console.log(session.user.id);
      return NextResponse.json({ error: "Médecin introuvable" }, { status: 404 });
    }
      
      const newPrescription = await prisma.prescription.create({
        data: {
          medicationName: body.medicationName,
          dosage: body.dosage,
          frequency: body.frequency,
          duration: body.duration,
          instructions: body.instructions,
          startDate: new Date(body.startDate || new Date()),
          isActive: true,
          patient: {
            connect: {
              id: params.patientId
            }
          },
          doctor: {
            connect: {
              userId: session.user.id
            }
          },
          // Correction: utiliser medicalRecord au lieu de medicalRecordId
          medicalRecord: body.medicalRecordId ? {
            connect: {
              id: body.medicalRecordId
            }
          } : undefined
        }
      });
  
      // Retourner les données mises à jour du patient
      const updatedPatient = await prisma.patient.findUnique({
        where: { id: params.patientId },
        include: {
          user: true,
          medicalHistories: true,
          appointments: {
            include: {
              doctor: { include: { user: true } },
              medicalRecord: { include: { prescriptions: true } }
            }
          },
          vitalSigns: true
        }
      });
  
      return NextResponse.json(updatedPatient);
    } catch (error) {
      console.error("Erreur lors de la création de la prescription:", error);
      return NextResponse.json(
        { error: "Erreur serveur" },
        { status: 500 }
      );
    }
  }