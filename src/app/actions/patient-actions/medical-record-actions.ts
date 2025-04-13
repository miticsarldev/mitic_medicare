"use server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  MedicalHistoryWithRelations,
  MedicalRecordWithRelations,
} from "@/types/patient/index";
import { getServerSession } from "next-auth";

export async function getMedicalRecords(): Promise<
  MedicalRecordWithRelations[]
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get the patient ID from the user ID
  const patient = await prisma.patient.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  const patientId = patient.id;

  const medicalRecords = await prisma.medicalRecord.findMany({
    where: {
      patientId,
    },
    include: {
      doctor: {
        include: {
          user: true,
        },
      },
      patient: {
        include: {
          user: true,
        },
      },
      hospital: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return medicalRecords;
}

export async function getMedicalRecordById(
  id: string
): Promise<MedicalRecordWithRelations | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const medicalRecord = await prisma.medicalRecord.findUnique({
    where: {
      id,
    },
    include: {
      doctor: {
        include: {
          user: true,
        },
      },
      patient: {
        include: {
          user: true,
        },
      },
      hospital: true,
      attachments: true,
      prescriptions: true,
    },
  });

  // Check if the medical record belongs to the logged-in user
  if (medicalRecord?.patient.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  return medicalRecord;
}

export async function getMedicalHistory(): Promise<
  MedicalHistoryWithRelations[]
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get the patient ID from the user ID
  const patient = await prisma.patient.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  const patientId = patient.id;

  const medicalHistory = await prisma.medicalHistory.findMany({
    where: {
      patientId,
    },
    include: {
      patient: true,
      createdByUser: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return medicalHistory;
}
