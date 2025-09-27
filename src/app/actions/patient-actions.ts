"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { BloodType, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Patient } from "@/types/patient";

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

const BLOOD_LABEL: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

export async function bulkExportPatients(patientIds: string[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    if (!Array.isArray(patientIds) || patientIds.length === 0) {
      return { error: "No ids provided" };
    }

    // IMPORTANT: filter by Patient.id (NOT user.id)
    const patients = await prisma.patient.findMany({
      where: { id: { in: patientIds } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            dateOfBirth: true,
            profile: {
              select: {
                address: true,
                city: true,
                state: true,
                country: true,
                zipCode: true,
                genre: true,
              },
            },
          },
        },
      },
    });

    const exportData = patients.map((p) => ({
      // choose what you want as the primary id in CSV
      patientId: p.id,
      userId: p.user?.id ?? "",
      name: p.user?.name ?? "",
      email: p.user?.email ?? "",
      phone: p.user?.phone ?? "",
      dateOfBirth: p.user?.dateOfBirth
        ? new Date(p.user.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender:
        p.user?.profile?.genre === "MALE"
          ? "Homme"
          : p.user?.profile?.genre === "FEMALE"
            ? "Femme"
            : "",
      address: p.user?.profile?.address ?? "",
      city: p.user?.profile?.city ?? "",
      state: p.user?.profile?.state ?? "",
      zipCode: p.user?.profile?.zipCode ?? "",
      country: p.user?.profile?.country ?? "",
      status: p.user?.isActive ? "active" : "inactive",
      emergencyContact: p.emergencyContact ?? "",
      emergencyPhone: p.emergencyPhone ?? "",
      bloodType: p.bloodType ? (BLOOD_LABEL[p.bloodType] ?? p.bloodType) : "",
      allergies: p.allergies ?? "",
      insuranceProvider: p.insuranceProvider ?? "",
      insuranceNumber: p.insuranceNumber ?? "",
      medicalNotes: p.medicalNotes ?? "",
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return { success: true, data: exportData };
  } catch (error) {
    console.error("Error exporting patients:", error);
    return { error: "Failed to export patients" };
  }
}

export const getPatientById = async (id: string): Promise<Patient> => {
  const data = await prisma.patient.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      appointments: {
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
          hospital: true,
          medicalRecord: {
            include: {
              hospital: true,
              doctor: {
                include: {
                  user: true,
                },
              },
              attachments: true,
              prescription: {
                include: {
                  doctor: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      medicalHistories: true,
      prescriptions: {
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
        },
      },
      vitalSigns: true,
    },
  });

  if (!data) {
    throw new Error(`Patient not found`);
  }

  const mapped: Patient = {
    id: data.id,
    userId: data.userId,
    bloodType: data.bloodType ?? undefined,
    allergies:
      typeof data.allergies === "string"
        ? data.allergies.split(",").map((s) => s.trim())
        : (data.allergies ?? undefined),
    emergencyContact: data.emergencyContact ?? undefined,
    emergencyPhone: data.emergencyPhone ?? undefined,
    insuranceProvider: data.insuranceProvider ?? undefined,
    insuranceNumber: data.insuranceNumber ?? undefined,
    medicalNotes: data.medicalNotes ?? undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,

    user: {
      ...data.user,
      dateOfBirth: data.user.dateOfBirth ?? undefined,
      profile: data.user.profile
        ? {
            address: data.user.profile.address ?? undefined,
            city: data.user.profile.city ?? undefined,
            state: data.user.profile.state ?? undefined,
            zipCode: data.user.profile.zipCode ?? undefined,
            country: data.user.profile.country ?? undefined,
            bio: data.user.profile.bio ?? undefined,
            avatarUrl: data.user.profile.avatarUrl ?? undefined,
            genre: data.user.profile.genre ?? undefined,
            createdAt: data.user.profile.createdAt ?? undefined,
            updatedAt: data.user.profile.updatedAt ?? undefined,
          }
        : undefined,
    },

    appointments: data.appointments?.map((a) => ({
      id: a.id,
      scheduledAt: a.scheduledAt,
      endTime: a.endTime ?? new Date(0),
      status: a.status,
      type: a.type ?? undefined,
      reason: a.reason ?? undefined,
      notes: a.notes ?? undefined,
      cancellationReason: a.cancellationReason ?? undefined,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      doctor: {
        id: a.doctor.id,
        specialization: a.doctor.specialization,
        user: {
          id: a.doctor.user.id,
          name: a.doctor.user.name,
          email: a.doctor.user.email,
        },
      },
      hospital: a.hospital
        ? {
            id: a.hospital.id,
            name: a.hospital.name,
            city: a.hospital.city,
          }
        : undefined,
      medicalRecord: a.medicalRecord
        ? {
            id: a.medicalRecord.id,
            diagnosis: a.medicalRecord.diagnosis,
            treatment: a.medicalRecord.treatment ?? undefined,
            notes: a.medicalRecord.notes ?? undefined,
            followUpNeeded: a.medicalRecord.followUpNeeded,
            followUpDate: a.medicalRecord.followUpDate ?? undefined,
            createdAt: a.medicalRecord.createdAt,
            updatedAt: a.medicalRecord.updatedAt,
            hospital: a.medicalRecord.hospital
              ? {
                  id: a.medicalRecord.hospital.id,
                  name: a.medicalRecord.hospital.name,
                }
              : undefined,
            doctor: {
              id: a.medicalRecord.doctor.id,
              user: {
                id: a.medicalRecord.doctor.user.id,
                name: a.medicalRecord.doctor.user.name,
              },
            },
            attachments: a.medicalRecord.attachments.map((att) => ({
              id: att.id,
              fileName: att.fileName,
              fileType: att.fileType,
              fileUrl: att.fileUrl,
              fileSize: att.fileSize,
              uploadedAt: att.uploadedAt,
            })),
            prescriptions: a.medicalRecord.prescription.map((p) => ({
              id: p.id,

              medicationName: p.medicationName,
              dosage: p.dosage,
              frequency: p.frequency,
              duration: p.duration ?? undefined,
              instructions: p.instructions ?? undefined,
              isActive: p.isActive,
              startDate: p.startDate,
              endDate: p.endDate ?? undefined,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
              doctor: {
                id: p.doctor.id,
                user: {
                  id: p.doctor.user.id,
                  name: p.doctor.user.name,
                },
              },
            })),
          }
        : undefined,
    })),

    medicalHistories: data.medicalHistories?.map((h) => ({
      id: h.id,
      title: h.title,
      condition: h.condition,
      diagnosedDate: h.diagnosedDate ?? undefined,
      status: h.status,
      details: h.details ?? undefined,
      createdBy: h.createdBy,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
    })),

    prescriptions: data.prescriptions?.map((p) => ({
      id: p.id,
      medicationName: p.medicationName,
      dosage: p.dosage,
      frequency: p.frequency,
      duration: p.duration ?? undefined,
      instructions: p.instructions ?? undefined,
      isActive: p.isActive,
      startDate: p.startDate,
      endDate: p.endDate ?? undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      doctor: {
        id: p.doctor.id,
        user: {
          id: p.doctor.user.id,
          name: p.doctor.user.name,
        },
      },
    })),

    vitalSigns: data.vitalSigns?.map((v) => ({
      id: v.id,
      temperature: v.temperature ? Number(v.temperature) : undefined,
      heartRate: v.heartRate ?? undefined,
      bloodPressureSystolic: v.bloodPressureSystolic ?? undefined,
      bloodPressureDiastolic: v.bloodPressureDiastolic ?? undefined,
      respiratoryRate: v.respiratoryRate ?? undefined,
      oxygenSaturation: v.oxygenSaturation ?? undefined,
      weight: v.weight ? Number(v.weight) : undefined,
      height: v.height ? Number(v.height) : undefined,
      notes: v.notes ?? undefined,
      recordedAt: v.recordedAt,
      createdAt: v.createdAt,
    })),
  };

  return mapped;
};
