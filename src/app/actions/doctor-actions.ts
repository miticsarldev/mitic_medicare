"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  Prisma,
  SubscriberType,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from "@prisma/client";
import { Availability } from "@/types/doctor";
import { format } from "date-fns";
import bcrypt from "bcryptjs";

export async function createDoctor(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const passwordRaw =
      ((formData.get("password") as string) ?? "").trim() ||
      "defaultPassword123";
    const specialty = (formData.get("specialty") as string)?.trim();
    const location = (formData.get("location") as string)?.trim();
    const status = ((formData.get("status") as string) ?? "active").trim();
    const licenseNumber = (formData.get("licenseNumber") as string) ?? "";
    const hospitalIdRaw = (formData.get("hospitalId") as string) ?? "";
    const verified = (formData.get("verified") as string) === "on";
    const doctorType = ((formData.get("doctorType") as string) ??
      "hospital") as "independent" | "hospital";
    const isIndependent = doctorType === "independent";

    const subscriptionPlanStr = (formData.get("subscription") as string) || "";
    const subscriptionPlan = subscriptionPlanStr as SubscriptionPlan | "";

    if (!name || !email || !specialty || !location) {
      return { error: "Missing required fields." };
    }
    if (!passwordRaw) {
      return { error: "Password is required." };
    }
    if (!isIndependent && !hospitalIdRaw) {
      return { error: "Hospital is required for hospital doctors." };
    }
    if (isIndependent && !subscriptionPlan) {
      return {
        error: "Subscription plan is required for independent doctors.",
      };
    }

    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    const role: UserRole = isIndependent
      ? UserRole.INDEPENDENT_DOCTOR
      : UserRole.HOSPITAL_DOCTOR;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        isActive: status === "active",
        emailVerified: new Date(),
        isApproved: verified,
        profile: {
          create: {
            city: location,
          },
        },
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: specialty,
        hospitalId: isIndependent ? null : hospitalIdRaw || null,
        licenseNumber,
        isVerified: verified,
        isIndependent,
      },
    });

    if (isIndependent) {
      await prisma.subscription.create({
        data: {
          subscriberType: SubscriberType.DOCTOR,
          doctorId: doctor.id,
          plan: subscriptionPlan as SubscriptionPlan,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
          currency: "XOF",
          autoRenew: true,
          amount: new Prisma.Decimal(0),
        },
      });
    }

    revalidatePath("/doctors");
    return { success: true, doctorId: doctor.id };
  } catch (error) {
    console.error("Error creating doctor:", error);
    return { error: "Failed to create doctor" };
  }
}

export async function getDoctorById(id: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      hospital: true,
      department: true,
      reviews: {
        orderBy: {
          createdAt: "desc",
        },
      },
      favoritedBy: {
        select: {
          id: true,
        },
      },
      availabilities: true,
    },
  });

  if (!doctor) return null;

  const isFavorite =
    !!userId && doctor.favoritedBy.some((u) => u.id === userId);

  return {
    ...doctor,
    isFavorite,
    consultationFee: doctor.consultationFee?.toNumber() ?? 0,
  };
}

export async function updateDoctorStatus(
  doctorId: string,
  status: "active" | "inactive"
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { userId: true },
    });
    if (!doctor) return { error: "Doctor not found" };

    await prisma.user.update({
      where: { id: doctor.userId },
      data: { isActive: status === "active" },
    });

    revalidatePath("/dasboard/superadmin/users/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error updating doctor status:", error);
    return { error: "Failed to update doctor status" };
  }
}

export async function updateDoctorVerification(
  doctorId: string,
  verified: boolean,
  alsoApproveUser = true
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN")
    return { error: "Unauthorized" };

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { userId: true },
  });
  if (!doctor) return { error: "Doctor not found" };

  await prisma.doctor.update({
    where: { id: doctorId },
    data: { isVerified: verified },
  });

  if (alsoApproveUser) {
    await prisma.user.update({
      where: { id: doctor.userId },
      data: { isApproved: verified },
    });
  }

  revalidatePath("/dasboard/superadmin/users/doctors");
  return { success: true };
}

export async function bulkDeleteDoctors(doctorIds: string[]) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    await prisma.user.deleteMany({
      where: {
        id: {
          in: doctorIds,
        },
      },
    });

    revalidatePath("/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting doctors:", error);
    return { error: "Failed to delete doctors" };
  }
}

export async function bulkExportDoctors(doctorIds: string[]) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    const doctors = await prisma.doctor.findMany({
      where: {
        user: {
          id: {
            in: doctorIds,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            profile: {
              select: {
                city: true,
              },
            },
          },
        },
        hospital: {
          select: {
            name: true,
            city: true,
            phone: true,
            state: true,
          },
        },
        subscription: {
          select: {
            plan: true,
            payments: {
              select: {
                amount: true,
              },
            },
          },
        },
      },
    });

    const exportData = doctors.map((doctor) => ({
      id: doctor.user.id,
      name: doctor.user.name,
      email: doctor.user.email,
      phone: doctor.user.phone,
      specialty: doctor.specialization,
      location: doctor.user.profile?.city || "",
      status: doctor.user.isActive ? "active" : "inactive",
      verified: doctor.user.emailVerified ? "Yes" : "No",
      hospital: doctor.hospital?.name || "",
      subscription: doctor.subscription?.plan || "FREE",
      joinedAt: doctor.user.createdAt.toISOString(),
    }));

    return { success: true, data: exportData };
  } catch (error) {
    console.error("Error exporting doctors:", error);
    return { error: "Failed to export doctors" };
  }
}

export async function assignDoctorToHospital(
  doctorId: string,
  hospitalId: string
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    const doctor = await prisma.doctor.findFirst({
      where: {
        user: {
          id: doctorId,
        },
      },
    });

    if (!doctor) {
      return { error: "Doctor not found" };
    }

    await prisma.doctor.update({
      where: {
        id: doctor.id,
      },
      data: {
        hospitalId,
      },
    });

    revalidatePath("/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error assigning doctor to hospital:", error);
    return { error: "Failed to assign doctor to hospital" };
  }
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatAvailabilities(availabilities: Availability[]) {
  const groupedByDay = availabilities.reduce(
    (acc, curr) => {
      if (!curr.isActive) return acc;
      const day = dayNames[curr.dayOfWeek];
      if (!acc[day]) acc[day] = [];
      acc[day].push(`${curr.startTime} - ${curr.endTime}`);
      return acc;
    },
    {} as Record<string, string[]>
  );

  return Object.entries(groupedByDay).map(([day, slots]) => ({
    day,
    slots,
  }));
}

export async function getDoctorDetailsById(id: string) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        specialization: true,
        licenseNumber: true,
        education: true,
        experience: true,
        consultationFee: true,
        isVerified: true,
        isIndependent: true,
        availableForChat: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            profile: {
              select: {
                bio: true,
                avatarUrl: true,
                address: true,
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        appointments: {
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            reason: true,
            notes: true,
            startTime: true,
            endTime: true,
            createdAt: true,
            updatedAt: true,
            patient: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                    profile: {
                      select: {
                        avatarUrl: true,
                        address: true,
                        city: true,
                        state: true,
                        country: true,
                        bio: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const availabilities = await prisma.doctorAvailability.findMany({
      where: { doctorId: doctor.id, isActive: true },
      select: {
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        isActive: true,
      },
    });

    const totalRatings = doctor.reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = doctor.reviews.length
      ? totalRatings / doctor.reviews.length
      : 0;

    const formattedSchedule = formatAvailabilities(availabilities);

    return {
      id: doctor.id,
      name: doctor.user.name,
      email: doctor.user.email,
      phone: doctor.user.phone,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      education: doctor.education,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      isVerified: doctor.isVerified,
      isIndependent: doctor.isIndependent,
      availableForChat: doctor.availableForChat,
      createdAt: doctor.createdAt,
      avatarUrl: doctor.user.profile?.avatarUrl,
      bio: doctor.user.profile?.bio,
      address: doctor.user.profile?.address,
      city: doctor.user.profile?.city,
      state: doctor.user.profile?.state,
      country: doctor.user.profile?.country,
      department: doctor.department,
      averageRating,
      reviewsCount: doctor.reviews.length,
      schedule: formattedSchedule,
      appointments: doctor.appointments,
    };
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    throw new Error("Failed to fetch doctor");
  }
}

//methode pour retourner les heures de travaille d'un médecin
export async function getDoctorSlotsWithTakenStatus(
  doctorId: string,
  date?: Date
) {
  const timeToDate = (baseDate: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  // CAS 1 : une seule date est fournie
  if (date) {
    const dayOfWeek = date.getDay();

    const availability = await prisma.doctorAvailability.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!availability) {
      return { all: [], taken: [] };
    }

    const slots: string[] = [];
    let current = timeToDate(date, availability.startTime);
    const end = timeToDate(date, availability.endTime);

    const durationMs = availability.slotDuration * 60 * 1000;

    while (current < end) {
      slots.push(format(current, "HH:mm"));
      current = new Date(current.getTime() + durationMs);
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
        status: {
          notIn: ["CANCELED"],
        },
      },
      select: {
        scheduledAt: true,
      },
    });

    const taken = appointments.map((a) =>
      format(new Date(a.scheduledAt), "HH:mm")
    );

    return {
      all: slots,
      taken,
    };
  }

  // CAS 2 : aucune date → toute la semaine
  const today = new Date();
  const currentDay = today.getDay();
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const monday = new Date(today);
  monday.setDate(today.getDate() - ((currentDay + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const result: Record<string, { all: string[]; taken: string[] }> = {};

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    const dayOfWeek = dayDate.getDay();

    const availability = await prisma.doctorAvailability.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!availability) {
      result[days[dayOfWeek]] = { all: [], taken: [] };
      continue;
    }

    const slots: string[] = [];
    let current = timeToDate(dayDate, availability.startTime);
    const end = timeToDate(dayDate, availability.endTime);

    const durationMs = availability.slotDuration * 60 * 1000;

    while (current < end) {
      slots.push(format(current, "HH:mm"));
      current = new Date(current.getTime() + durationMs);
    }

    const startOfDay = new Date(dayDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dayDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
        status: {
          notIn: ["CANCELED"],
        },
      },
      select: {
        scheduledAt: true,
      },
    });

    const taken = appointments.map((a) =>
      format(new Date(a.scheduledAt), "HH:mm")
    );

    result[days[dayOfWeek]] = {
      all: slots,
      taken,
    };
  }

  return result;
}

// Lister toutes les disponibilités d'un médecin
export async function getDoctorAvailabilities(doctorId: string) {
  return await prisma.doctorAvailability.findMany({
    where: { doctorId },
    orderBy: { dayOfWeek: "asc" },
  });
}

export async function upsertDoctorAvailability(availability: {
  id?: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}) {
  const { id, ...data } = availability;

  if (id) {
    // Mise à jour
    return await prisma.doctorAvailability.update({
      where: { id },
      data,
    });
  } else {
    // Création
    return await prisma.doctorAvailability.create({
      data,
    });
  }
}

// Supprimer une disponibilité
export async function deleteDoctorAvailability(id: string) {
  return await prisma.doctorAvailability.delete({
    where: { id },
  });
}

export async function updateSlotDurationForAllAvailabilities(
  doctorId: string,
  slotDuration: number
) {
  return await prisma.doctorAvailability.updateMany({
    where: { doctorId },
    data: { slotDuration },
  });
}

/**
 * Met à jour ou crée les disponibilités pour plusieurs médecins en transaction
 * @param doctorIds - Tableau des IDs des médecins à mettre à jour
 * @param dayOfWeek - Jour de la semaine (0-6)
 * @param startTime - Heure de début (format HH:MM)
 * @param endTime - Heure de fin (format HH:MM)
 * @param slotDuration - Durée des créneaux (en minutes)
 * @param isActive - Si la disponibilité est active
 * @returns Le nombre de médecins distincts modifiés/créés
 */
export async function updateAvailabilityForMultipleDoctors(
  doctorIds: string[],
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  slotDuration: number,
  isActive: boolean
): Promise<number> {
  // Validation des entrées...

  try {
    // Pré-collecter les IDs existants pour chaque doctorId
    const existingAvailabilities = await Promise.all(
      doctorIds.map((doctorId) =>
        prisma.doctorAvailability.findFirst({
          where: { doctorId, dayOfWeek },
          select: { id: true },
        })
      )
    );

    const results = await prisma.$transaction(
      doctorIds.map((doctorId, idx) =>
        prisma.doctorAvailability.upsert({
          where: {
            id: existingAvailabilities[idx]?.id ?? "", // Fournir une valeur par défaut qui forcera la création
          },
          update: {
            startTime,
            endTime,
            slotDuration,
            isActive,
          },
          create: {
            doctorId,
            dayOfWeek,
            startTime,
            endTime,
            slotDuration,
            isActive,
          },
        })
      )
    );

    return results.length;
  } catch (error) {
    console.error("Transaction error:", error);
    throw new Error("Failed to update doctors' availabilities");
  }
}
