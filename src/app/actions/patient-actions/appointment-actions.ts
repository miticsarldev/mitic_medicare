"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  AppointmentFormData,
  AppointmentWithRelations,
} from "@/types/patient/index";

export async function getAppointments(
  status: "upcoming" | "past" | "canceled"
): Promise<AppointmentWithRelations[]> {
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
  const now = new Date();

  let statusCondition = {};

  if (status === "upcoming") {
    statusCondition = {
      status: {
        in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING],
      },
      scheduledAt: {
        gte: now,
      },
    };
  } else if (status === "past") {
    statusCondition = {
      status: AppointmentStatus.COMPLETED,
    };
  } else if (status === "canceled") {
    statusCondition = {
      status: AppointmentStatus.CANCELED,
    };
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      patientId,
      ...statusCondition,
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
      scheduledAt: "desc",
    },
  });

  return appointments;
}

export async function getAppointmentById(
  id: string
): Promise<AppointmentWithRelations | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const appointment = await prisma.appointment.findUnique({
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
      medicalRecord: {
        include: {
          prescriptionOrder: {
            include: {
              prescriptions: true,
            },
          },
        },
      },
    },
  });

  // Check if the appointment belongs to the logged-in user
  if (appointment?.patient.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  return appointment;
}

export async function createAppointment(
  data: AppointmentFormData
): Promise<AppointmentWithRelations> {
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

  // Get the doctor's hospital ID
  const doctor = await prisma.doctor.findUnique({
    where: {
      id: data.doctorId,
    },
  });

  // Combine date and time
  const [hours, minutes] = data.time.split(":").map(Number);
  const scheduledAt = new Date(data.date);
  scheduledAt.setHours(hours, minutes, 0, 0);

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: data.doctorId,
      hospitalId: doctor?.hospitalId || null,
      scheduledAt,
      status: AppointmentStatus.PENDING,
      reason: data.reason,
      notes: data.notes,
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
  });

  revalidatePath("/dashboard/appointments");
  return appointment;
}

export async function cancelAppointment(
  id: string,
  reason: string
): Promise<AppointmentWithRelations> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get the appointment to check ownership
  const existingAppointment = await prisma.appointment.findUnique({
    where: {
      id,
    },
    include: {
      patient: true,
    },
  });

  if (!existingAppointment) {
    throw new Error("Appointment not found");
  }

  // Check if the appointment belongs to the logged-in user
  if (existingAppointment.patient.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const appointment = await prisma.appointment.update({
    where: {
      id,
    },
    data: {
      status: AppointmentStatus.CANCELED,
      cancelledAt: new Date(),
      cancellationReason: reason,
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
  });

  revalidatePath("/dashboard/appointments");
  return appointment;
}

export async function getDoctors() {
  const doctors = await prisma.doctor.findMany({
    include: {
      user: true,
      hospital: true,
    },
    where: {
      isVerified: true,
    },
  });

  return doctors;
}
