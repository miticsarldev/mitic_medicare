"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { BloodType, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

type GetPatientsOptions = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

export async function getAllPatients(options: GetPatientsOptions) {
  const {
    search = "",
    status = "all",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const skip = (page - 1) * limit;

  const where: Prisma.PatientWhereInput = {
    user: {
      role: "PATIENT",
      isActive: status === "all" ? undefined : status === "active",
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { id: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
  };

  const totalPatients = await prisma.patient.count({ where });

  let orderBy: Prisma.PatientOrderByWithRelationInput = {
    createdAt: sortOrder as Prisma.SortOrder,
  };

  if (sortBy === "name") {
    orderBy = { user: { name: sortOrder === "asc" ? "asc" : "desc" } };
  } else if (sortBy === "email") {
    orderBy = { user: { email: sortOrder === "asc" ? "asc" : "desc" } };
  } else if (sortBy === "registrationDate") {
    orderBy = { user: { createdAt: sortOrder === "asc" ? "asc" : "desc" } };
  } else if (sortBy === "lastLogin") {
    orderBy = { user: { updatedAt: sortOrder === "asc" ? "asc" : "desc" } };
  }

  const patients = await prisma.patient.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          isApproved: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              address: true,
              city: true,
              state: true,
              country: true,
              zipCode: true,
              bio: true,
              genre: true,
              avatarUrl: true,
              createdAt: true,
            },
          },
        },
      },
      appointments: {
        select: { id: true },
      },
      medicalRecords: {
        select: { id: true },
      },
    },
    skip,
    take: limit,
    orderBy,
  });

  const formatted = patients.map((patient) => ({
    ...patient,
    appointmentsCount: patient.appointments.length,
    medicalRecordsCount: patient.medicalRecords.length,
    allergies: patient.allergies ? patient.allergies.split(",") : [],
    chronicConditions: patient.medicalNotes
      ? patient.medicalNotes.split(",")
      : [],
  }));

  return {
    patients: formatted,
    pagination: {
      total: totalPatients,
      page,
      limit,
      totalPages: Math.ceil(totalPatients / limit),
    },
  };
}

// Get patient analytics
export async function getPatientAnalytics() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    // Get total patients count
    const totalPatients = await prisma.patient.count();

    // Get active patients count
    const activePatients = await prisma.patient.count({
      where: {
        user: {
          isActive: true,
        },
      },
    });

    // Get new patients in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newPatients = await prisma.patient.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get patient activity over time (appointments per month for the last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const appointments = await prisma.appointment.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group appointments by month
    const appointmentsByMonth: Record<string, number> = {};

    appointments.forEach((appointment) => {
      const monthYear = `${appointment.createdAt.getMonth() + 1}/${appointment.createdAt.getFullYear()}`;
      appointmentsByMonth[monthYear] =
        (appointmentsByMonth[monthYear] || 0) + 1;
    });

    // Format appointments by month for chart
    const appointmentsActivity = Object.entries(appointmentsByMonth).map(
      ([month, count]) => ({
        month,
        count,
      })
    );

    // Get geographical distribution (by state/region)
    const geographicalDistribution = await prisma.userProfile.groupBy({
      by: ["state"],
      where: {
        user: {
          role: "PATIENT",
        },
        state: {
          not: null,
        },
      },
      _count: {
        state: true,
      },
    });

    // Format geographical distribution
    const formattedGeographicalDistribution = geographicalDistribution.map(
      (item) => ({
        region: item.state!,
        count: item._count.state,
      })
    );

    return {
      totalPatients,
      activePatients,
      newPatients,
      patientActivity: appointmentsActivity,
      geographicalDistribution: formattedGeographicalDistribution,
    };
  } catch (error) {
    console.error("Error fetching patient analytics:", error);
    throw new Error("Failed to fetch patient analytics");
  }
}

export async function createPatient(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const gender = formData.get("gender") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;
    const country = formData.get("country") as string;
    const bloodType = formData.get("bloodType") as string;
    const allergies = formData.get("allergies") as string;
    const emergencyContact = formData.get("emergencyContact") as string;
    const emergencyPhone = formData.get("emergencyPhone") as string;
    const insuranceProvider = formData.get("insuranceProvider") as string;
    const insuranceNumber = formData.get("insuranceNumber") as string;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        dateOfBirth: new Date(dateOfBirth),
        role: "PATIENT",
        isActive: true,
        emailVerified: new Date(),
        isApproved: true,
        profile: {
          create: {
            address,
            city,
            state,
            zipCode,
            country,
            genre: gender === "Homme" ? "MALE" : "FEMALE",
          },
        },
      },
    });

    // Create patient record
    await prisma.patient.create({
      data: {
        userId: user.id,
        bloodType: bloodType ? (bloodType as BloodType) : null,
        allergies,
        emergencyContact,
        emergencyPhone,
        insuranceProvider,
        insuranceNumber,
      },
    });

    revalidatePath("/patients");
    return { success: true, patientId: user.id };
  } catch (error) {
    console.error("Error creating patient:", error);
    return { error: "Failed to create patient" };
  }
}

export async function updatePatientStatus(patientId: string, status: string) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    await prisma.user.update({
      where: {
        id: patientId,
      },
      data: {
        isActive: status === "active",
      },
    });

    revalidatePath("/patients");
    return { success: true };
  } catch (error) {
    console.error("Error updating patient status:", error);
    return { error: "Failed to update patient status" };
  }
}

export async function bulkDeletePatients(patientIds: string[]) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    // Delete users (will cascade to patient records)
    await prisma.user.deleteMany({
      where: {
        id: {
          in: patientIds,
        },
      },
    });

    revalidatePath("/patients");
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting patients:", error);
    return { error: "Failed to delete patients" };
  }
}

export async function bulkExportPatients(patientIds: string[]) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    // Get patient data for export
    const patients = await prisma.patient.findMany({
      where: {
        user: {
          id: {
            in: patientIds,
          },
        },
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Format data for export
    const exportData = patients.map((patient) => ({
      id: patient.user.id,
      name: patient.user.name,
      email: patient.user.email,
      phone: patient.user.phone,
      dateOfBirth: patient?.user?.dateOfBirth?.toISOString().split("T")[0],
      gender: patient.user.profile?.genre === "MALE" ? "Homme" : "Femme",
      address: patient.user.profile?.address || "",
      status: patient.user.isActive ? "active" : "inactive",
      insuranceProvider: patient.insuranceProvider || "",
      insuranceNumber: patient.insuranceNumber || "",
      emergencyContact: patient.emergencyContact || "",
      bloodType: patient.bloodType || "",
      allergies: patient.allergies || "",
    }));

    return { success: true, data: exportData };
  } catch (error) {
    console.error("Error exporting patients:", error);
    return { error: "Failed to export patients" };
  }
}
