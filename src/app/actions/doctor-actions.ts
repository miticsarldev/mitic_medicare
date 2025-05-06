"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { SubscriptionPlan, UserRole } from "@prisma/client";
import { Availability } from "@/types/doctor";
import { format } from "date-fns"


export async function createDoctor(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password =
      (formData.get("password") as string) || "defaultPassword123";
    const specialty = formData.get("specialty") as string;
    const location = formData.get("location") as string;
    const status = formData.get("status") as string;
    const subscription = formData.get("subscription") as SubscriptionPlan;
    const licenseNumber = formData.get("licenseNumber") as string;
    const role = formData.get("role") as UserRole;
    const hospitalId = (formData.get("hospitalId") as string) || null;

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password, // In a real app, you would hash this password
        role: role,
        isActive: status === "active",
        emailVerified: new Date(),
        isApproved: true,
        profile: {
          create: {
            city: location,
          },
        },
      },
    });

    await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: specialty,
        hospitalId: hospitalId || null,
        licenseNumber: licenseNumber,
        isVerified: true,
        isIndependent: !hospitalId, // optionnel : déterminer automatiquement le type
        subscription: {
          create: {
            plan: subscription as SubscriptionPlan,
            startDate: new Date(),
            status: "ACTIVE",
            amount: 0,
            endDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
            subscriberType: "HOSPITAL",
          },
        },
      },
    });

    // In a real app, you would send an email here if sendEmail is true

    revalidatePath("/doctors");
    return { success: true, doctorId: user.id };
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
      doctorReviews: {
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

export async function updateDoctorStatus(doctorId: string, status: string) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    await prisma.user.update({
      where: {
        id: doctorId,
      },
      data: {
        isActive: status === "active",
      },
    });

    revalidatePath("/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error updating doctor status:", error);
    return { error: "Failed to update doctor status" };
  }
}

export async function updateDoctorVerification(
  doctorId: string,
  verified: boolean
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    await prisma.user.update({
      where: {
        id: doctorId,
      },
      data: {
        isApproved: verified,
      },
    });

    revalidatePath("/doctors");
    return { success: true };
  } catch (error) {
    console.error("Error updating doctor verification:", error);
    return { error: "Failed to update doctor verification" };
  }
}

export async function bulkDeleteDoctors(doctorIds: string[]) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    // Delete users (will cascade to doctor records)
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

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return { error: "Unauthorized" };
    }

    // Get doctor data for export
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

    // Format data for export
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

    // Check if user is authenticated and is a SUPER_ADMIN
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

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatAvailabilities(availabilities: Availability[]) {
  const groupedByDay = availabilities.reduce((acc, curr) => {
    if (!curr.isActive) return acc;
    const day = dayNames[curr.dayOfWeek];
    if (!acc[day]) acc[day] = [];
    acc[day].push(`${curr.startTime} - ${curr.endTime}`);
    return acc;
  }, {} as Record<string, string[]>);

  return Object.entries(groupedByDay).map(([day, slots]) => ({
    day,
    slots,
  }));
}

export async function getDoctorDetailsById(id: string) {
  try {
    // Récupérer le médecin à partir de l'ID
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

    // Récupérer les disponibilités du médecin
    const availabilities = await prisma.doctorAvailability.findMany({
      where: { doctorId: doctor.id, isActive: true },
      select: {
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        isActive: true,
      },
    });

    // Calculer la note moyenne
    const totalRatings = doctor.reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = doctor.reviews.length ? totalRatings / doctor.reviews.length : 0;

    const formattedSchedule = formatAvailabilities(availabilities);

    // Retourner les détails complets du médecin
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
export async function getDoctorSlotsWithTakenStatus(doctorId: string, date?: Date) {
  const timeToDate = (baseDate: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const d = new Date(baseDate)
    d.setHours(hours, minutes, 0, 0)
    return d
  }

  // --- CAS 1 : Une date est fournie (comportement inchangé) ---
  if (date) {
    const dayOfWeek = date.getDay() // 0 = dimanche ... 6 = samedi

    const availability = await prisma.doctorAvailability.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    })

    if (!availability) {
      return {
        all: [],
        taken: [],
      }
    }

    const slots: string[] = []
    let current = timeToDate(date, availability.startTime)
    const end = timeToDate(date, availability.endTime)

    while (current < end) {
      slots.push(format(current, "HH:mm"))
      current = new Date(current.getTime() + 60 * 60 * 1000) // +1h
    }

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

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
    })

    const taken = appointments.map((a) => format(new Date(a.scheduledAt), "HH:mm"))

    return {
      all: slots,
      taken,
    }
  }

  // --- CAS 2 : Aucune date fournie → retourner toute la semaine ---
  const today = new Date()
  const currentDay = today.getDay()
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

  // Obtenir le lundi de la semaine courante
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((currentDay + 6) % 7))
  monday.setHours(0, 0, 0, 0)

  const result: Record<string, { all: string[]; taken: string[] }> = {}

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday)
    dayDate.setDate(monday.getDate() + i)
    const dayOfWeek = dayDate.getDay()

    const availability = await prisma.doctorAvailability.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    })

    if (!availability) {
      result[days[dayOfWeek]] = { all: [], taken: [] }
      continue
    }

    const slots: string[] = []
    let current = timeToDate(dayDate, availability.startTime)
    const end = timeToDate(dayDate, availability.endTime)

    while (current < end) {
      slots.push(format(current, "HH:mm"))
      current = new Date(current.getTime() + 60 * 60 * 1000)
    }

    const startOfDay = new Date(dayDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(dayDate)
    endOfDay.setHours(23, 59, 59, 999)

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
    })

    const taken = appointments.map((a) => format(new Date(a.scheduledAt), "HH:mm"))

    result[days[dayOfWeek]] = {
      all: slots,
      taken,
    }
  }

  return result
}

// Lister toutes les disponibilités d'un médecin
export async function getDoctorAvailabilities(doctorId: string) {
  return await prisma.doctorAvailability.findMany({
    where: { doctorId },
    orderBy: { dayOfWeek: 'asc' },
  });
}

// Créer ou mettre à jour une disponibilité
export async function upsertDoctorAvailability(availability: {
  id?: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}) {
  const { id, ...data } = availability;

  if (id) {
    // Mise à jour si l'ID est fourni
    return await prisma.doctorAvailability.update({
      where: { id },
      data,
    });
  }
}


// Mettre à jour plusieurs disponibilités en une transaction
export async function upsertManyDoctorAvailabilities(
  doctorId: string,
  availabilities: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }[]
) {
  return await prisma.$transaction(
    availabilities.map((avail) =>
      prisma.doctorAvailability.upsert({
        where: {
          doctorId_dayOfWeek_startTime_endTime: {
            doctorId,
            dayOfWeek: avail.dayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
          },
        },
        update: {
          isActive: avail.isActive,
          startTime: avail.startTime,
          endTime: avail.endTime,
        },
        create: {
          doctorId,
          ...avail,
        },
      })
    )
  );
}

// Supprimer une disponibilité
export async function deleteDoctorAvailability(id: string) {
  return await prisma.doctorAvailability.delete({
    where: { id },
  });
}

// Supprimer toutes les disponibilités d'un médecin
export async function deleteAllDoctorAvailabilities(doctorId: string) {
  return await prisma.doctorAvailability.deleteMany({
    where: { doctorId },
  });
}

