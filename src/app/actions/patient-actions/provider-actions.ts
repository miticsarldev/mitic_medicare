"use server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  DoctorWithRelations,
  HospitalWithRelations,
} from "@/types/patient/index";
import { getServerSession } from "next-auth";

export async function getDoctors(): Promise<DoctorWithRelations[]> {
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

  // Get doctors that the patient has had appointments with
  const doctors = await prisma.doctor.findMany({
    where: {
      appointments: {
        some: {
          patientId,
        },
      },
    },
    include: {
      user: true,
      hospital: true,
      doctorReviews: {
        where: {
          patientId,
        },
      },
    },
  });

  return doctors.map((doctor) => ({
    ...doctor,
    reviews: doctor.doctorReviews,
  }));
}

export async function getDoctorById(
  id: string
): Promise<DoctorWithRelations | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      hospital: true,
      doctorReviews: true,
      department: true,
    },
  });

  if (!doctor) return null;

  return {
    ...doctor,
    reviews: doctor.doctorReviews,
  };
}

export async function getHospitals(): Promise<HospitalWithRelations[]> {
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

  // Get hospitals that the patient has had appointments with
  const hospitals = await prisma.hospital.findMany({
    where: {
      appointments: {
        some: {
          patientId,
        },
      },
    },
    include: {
      admin: true,
    },
  });

  return hospitals;
}

export async function getHospitalById(
  id: string
): Promise<HospitalWithRelations | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const hospital = await prisma.hospital.findUnique({
    where: {
      id,
    },
    include: {
      admin: true,
      departments: true,
    },
  });

  return hospital;
}
