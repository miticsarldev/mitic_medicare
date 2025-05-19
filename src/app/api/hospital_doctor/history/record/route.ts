// src/app/api/medical-records/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const prisma = new PrismaClient();

// Schéma de validation
const prescriptionSchema = z.object({
  medicationName: z.string().min(1, "Le nom du médicament est requis"),
  dosage: z.string().min(1, "La posologie est requise"),
  frequency: z.string().min(1, "La fréquence est requise"),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  startDate: z.string().min(1, "La date de début est requise"),
  endDate: z.string().optional(),
});

const medicalRecordSchema = z.object({
  appointmentId: z.string().min(1, "L'ID du rendez-vous est requis"),
  diagnosis: z.string().min(1, "Le diagnostic est requis"),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  followUpNeeded: z.boolean().default(false),
  followUpDate: z.string().optional(),
  prescriptions: z.array(prescriptionSchema).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // Validation des données
    const body = await req.json();
    const validation = medicalRecordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          message: "Données invalides", 
          errors: validation.error.errors 
        }, 
        { status: 400 }
      );
    }

    const { 
      appointmentId, 
      diagnosis, 
      treatment, 
      notes, 
      followUpNeeded, 
      followUpDate,
      prescriptions 
    } = validation.data;

    // Vérification du médecin
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      select: { id: true, hospitalId: true }
    });

    if (!doctor) {
      return NextResponse.json(
        { message: "Médecin non trouvé" }, 
        { status: 404 }
      );
    }

    // Vérification du rendez-vous
    const appointment = await prisma.appointment.findUnique({
      where: { 
        id: appointmentId,
        doctorId: doctor.id,
        status: "COMPLETED"
      },
      select: { 
        id: true,
        patientId: true 
      }
    });

    if (!appointment) {
      return NextResponse.json(
        { message: "Rendez-vous non trouvé ou non éligible" }, 
        { status: 404 }
      );
    }

    // Création du dossier médical
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        diagnosis,
        treatment,
        notes,
        followUpNeeded,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        patientId: appointment.patientId,
        doctorId: doctor.id,
        appointmentId: appointment.id,
        hospitalId: doctor.hospitalId,
        // Ajout des prescriptions si présentes
        prescriptions: prescriptions?.length ? {
          create: prescriptions.map(prescription => ({
            medicationName: prescription.medicationName,
            dosage: prescription.dosage,
            frequency: prescription.frequency,
            duration: prescription.duration,
            instructions: prescription.instructions,
            startDate: new Date(prescription.startDate),
            endDate: prescription.endDate ? new Date(prescription.endDate) : null,
            doctorId: doctor.id,
            patientId: appointment.patientId,
            isActive: true
          }))
        } : undefined
      },
      include: {
        prescriptions: true
      }
    });

    

    return NextResponse.json(medicalRecord, { status: 201 });

  } catch (error) {
    console.error("Erreur création dossier médical:", error);
    return NextResponse.json(
      { message: "Erreur serveur" }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le médecin connecté
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!doctor) {
      return NextResponse.json(
        { message: "Médecin non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer tous les dossiers médicaux associés à ce médecin
    const records = await prisma.medicalRecord.findMany({
      where: { doctorId: doctor.id },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                dateOfBirth: true
              }
            }
          }
        },
        hospital: {
          select: {
            name: true,
            address: true,
            phone: true
          }
        },
        appointment: {
          select: {
            scheduledAt: true,
            status: true,
            reason: true
          }
        },
        prescriptions: true
      }
    });

    return NextResponse.json(records, { status: 200 });

  } catch (error) {
    console.error("Erreur récupération dossiers médicaux:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
