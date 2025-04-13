"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import {
  MedicalInfoFormData,
  PatientWithRelations,
  ProfileFormData,
  SecurityFormData,
} from "@/types/patient/index";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function getPatientProfile(): Promise<PatientWithRelations | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const patient = await prisma.patient.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  return patient;
}

export async function updateProfile(data: ProfileFormData): Promise<void> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Update user
  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
    },
  });

  // Update or create profile
  await prisma.userProfile.upsert({
    where: {
      userId: session.user.id,
    },
    update: {
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      bio: data.bio,
      genre: data.genre,
    },
    create: {
      userId: session.user.id,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      bio: data.bio,
      genre: data.genre,
    },
  });

  revalidatePath("/profile");
}

export async function updateMedicalInfo(
  data: MedicalInfoFormData
): Promise<void> {
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

  // Update patient
  await prisma.patient.update({
    where: {
      id: patient.id,
    },
    data: {
      bloodType: data.bloodType,
      allergies: data.allergies,
      emergencyContact: data.emergencyContact,
      emergencyPhone: data.emergencyPhone,
      insuranceProvider: data.insuranceProvider,
      insuranceNumber: data.insuranceNumber,
      medicalNotes: data.medicalNotes,
    },
  });

  revalidatePath("/profile");
}

export async function updateSecurity(
  data: SecurityFormData
): Promise<{ success: boolean; message: string }> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get the user
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      password: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // If changing password, verify current password
  if (data.currentPassword && data.newPassword) {
    const passwordMatch = await compare(data.currentPassword, user.password);

    if (!passwordMatch) {
      return {
        success: false,
        message: "Current password is incorrect",
      };
    }

    // Hash the new password
    const hashedPassword = await hash(data.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  // In a real application, you would store notification preferences in a separate table
  // For this example, we'll just return success

  revalidatePath("/profile");
  return {
    success: true,
    message: "Security settings updated successfully",
  };
}
