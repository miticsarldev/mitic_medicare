"use server";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { DashboardData } from "@/types/patient/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getDashboardData(): Promise<DashboardData> {
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

  // Get dashboard stats
  const appointmentsCount = await prisma.appointment.count({
    where: {
      patientId,
      status: {
        in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING],
      },
      scheduledAt: {
        gte: new Date(),
      },
    },
  });

  const medicalRecordsCount = await prisma.medicalRecord.count({
    where: {
      patientId,
    },
  });

  const distinctDoctors = await prisma.appointment.findMany({
    where: {
      patientId,
    },
    select: {
      doctorId: true,
    },
    distinct: ["doctorId"] as const,
  });

  const doctorsCount = distinctDoctors.length;

  const medicationsCount = await prisma.prescription.count({
    where: {
      patientId,
      isActive: true,
    },
  });

  // Get upcoming appointments
  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      patientId,
      status: {
        in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING],
      },
      scheduledAt: {
        gte: new Date(),
      },
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
      scheduledAt: "asc",
    },
    take: 3,
  });

  // Get active medications
  const medications = await prisma.prescription.findMany({
    where: {
      patientId,
      isActive: true,
    },
    include: {
      doctor: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  // Get vital signs
  const vitalSigns = await prisma.vitalSign.findMany({
    where: {
      patientId,
    },
    orderBy: {
      recordedAt: "desc",
    },
    take: 5,
  });

  // Get recent medical records
  const recentMedicalRecords = await prisma.medicalRecord.findMany({
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
    take: 3,
  });

  return {
    stats: {
      appointmentsCount,
      medicalRecordsCount,
      doctorsCount,
      medicationsCount,
    },
    upcomingAppointments,
    medications,
    vitalSigns,
    recentMedicalRecords,
  };
}
