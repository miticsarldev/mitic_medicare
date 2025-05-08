"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Types pour les formulaires
type AppointmentFormData = {
  patientId: string;
  scheduledAt: Date;
  startTime?: Date;
  endTime?: Date;
  type?: string;
  reason?: string;
  notes?: string;
};

type AvailabilityFormData = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
};

// ========== ACTIONS POUR LES RENDEZ-VOUS ==========

/**
 * Récupère tous les rendez-vous d'un médecin
 */
export async function getAppointments() {
  const session = await getServerSession(authOptions);
  const doctorId = session?.user?.id;
  if (!doctorId) return new Error("User not authorized");

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    return { success: true, data: appointments };
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    return { success: false, error: "Impossible de récupérer les rendez-vous" };
  }
}

/**
 * Récupère un rendez-vous par son ID
 */
export async function getAppointmentById(id: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment) {
      return { success: false, error: "Rendez-vous non trouvé" };
    }

    return { success: true, data: appointment };
  } catch (error) {
    console.error("Erreur lors de la récupération du rendez-vous:", error);
    return { success: false, error: "Impossible de récupérer le rendez-vous" };
  }
}

/**
 * Crée un nouveau rendez-vous
 */
export async function createAppointment(data: AppointmentFormData) {
  const session = await getServerSession(authOptions);
  const doctorId = session?.user?.id;
  if (!doctorId) return new Error("User not authorized");

  try {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId,
        scheduledAt: data.scheduledAt,
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type,
        reason: data.reason,
        notes: data.notes,
        status: AppointmentStatus.PENDING,
      },
    });

    revalidatePath("/dashboard/independant_doctor/rendez-vous");
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Erreur lors de la création du rendez-vous:", error);
    return { success: false, error: "Impossible de créer le rendez-vous" };
  }
}

/**
 * Met à jour le statut d'un rendez-vous
 */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
) {
  try {
    const updateData: {
      status: AppointmentStatus;
      completedAt?: Date;
      cancelledAt?: Date;
    } = {
      status,
    };

    // Ajouter des champs supplémentaires en fonction du statut
    if (status === AppointmentStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (status === AppointmentStatus.CANCELED) {
      updateData.cancelledAt = new Date();
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard/independant_doctor/rendez-vous");
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return { success: false, error: "Impossible de mettre à jour le statut" };
  }
}

/**
 * Annule un rendez-vous avec une raison
 */
export async function cancelAppointment(
  id: string,
  cancellationReason: string
) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELED,
        cancelledAt: new Date(),
        cancellationReason,
      },
    });

    revalidatePath("/dashboard/independant_doctor/rendez-vous");
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Erreur lors de l'annulation du rendez-vous:", error);
    return { success: false, error: "Impossible d'annuler le rendez-vous" };
  }
}

// ========== ACTIONS POUR LES DISPONIBILITÉS ==========

/**
 * Récupère toutes les disponibilités d'un médecin
 */
export async function getDoctorAvailabilities() {
  const session = await getServerSession(authOptions);
  const doctorId = session?.user?.id;
  if (!doctorId) return new Error("User not authorized");

  try {
    const availabilities = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        isActive: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return { success: true, data: availabilities };
  } catch (error) {
    console.error("Erreur lors de la récupération des disponibilités:", error);
    return {
      success: false,
      error: "Impossible de récupérer les disponibilités",
    };
  }
}

/**
 * Crée une nouvelle disponibilité
 */
export async function createAvailability(data: AvailabilityFormData) {
  const session = await getServerSession(authOptions);
  const doctorId = session?.user?.id;
  if (!doctorId) return new Error("User not authorized");

  try {
    // Vérifier si une disponibilité similaire existe déjà
    const existingAvailability = await prisma.doctorAvailability.findFirst({
      where: {
        doctorId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });

    if (existingAvailability) {
      return {
        success: false,
        error:
          "Une disponibilité similaire existe déjà pour ce jour et cette plage horaire",
      };
    }

    const availability = await prisma.doctorAvailability.create({
      data: {
        doctorId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        slotDuration: data.slotDuration,
        isActive: data.isActive,
      },
    });

    revalidatePath("/dashboard/independant_doctor/disponibilites");
    return { success: true, data: availability };
  } catch (error) {
    console.error("Erreur lors de la création de la disponibilité:", error);
    return { success: false, error: "Impossible de créer la disponibilité" };
  }
}

/**
 * Met à jour une disponibilité existante
 */
export async function updateAvailability(
  id: string,
  data: AvailabilityFormData
) {
  try {
    const availability = await prisma.doctorAvailability.update({
      where: { id },
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive,
      },
    });

    revalidatePath("/dashboard/independant_doctor/disponibilites");
    return { success: true, data: availability };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la disponibilité:", error);
    return {
      success: false,
      error: "Impossible de mettre à jour la disponibilité",
    };
  }
}

/**
 * Supprime une disponibilité
 */
export async function deleteAvailability(id: string) {
  try {
    await prisma.doctorAvailability.delete({
      where: { id },
    });

    revalidatePath("/dashboard/independant_doctor/disponibilites");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la disponibilité:", error);
    return {
      success: false,
      error: "Impossible de supprimer la disponibilité",
    };
  }
}

/**
 * Récupère les patients pour le sélecteur de rendez-vous
 */
export async function getPatients() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: true,
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return { success: true, data: patients };
  } catch (error) {
    console.error("Erreur lors de la récupération des patients:", error);
    return { success: false, error: "Impossible de récupérer les patients" };
  }
}
