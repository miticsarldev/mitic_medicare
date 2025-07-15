import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const appointmentId = params.id;

    // Récupérer le rendez-vous avec les relations
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                profile: {
                  select: {
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
            hospital: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Rendez-vous non trouvé" },
        { status: 404 }
      );
    }

    // Formater les données pour l'exportation
    const exportData = {
      id: appointment.id,
      patient: {
        user: {
          name: appointment.patient.user.name,
          email: appointment.patient.user.email,
          phone: appointment.patient.user.phone || "Non renseigné",
          profile: {
            avatarUrl: appointment.patient.user.profile?.avatarUrl || null,
          },
        },
      },
      doctor: {
        user: {
          name: appointment.doctor.user.name,
        },
        specialization: appointment.doctor.specialization,
        hospital: appointment.doctor.hospital
          ? { name: appointment.doctor.hospital.name }
          : null,
      },
      scheduledAt: appointment.scheduledAt,
      endTime: appointment.endTime,
      status: appointment.status,
      reason: appointment.reason,
      type: appointment.type,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      completedAt: appointment.completedAt,
      cancelledAt: appointment.cancelledAt,
      cancellationReason: appointment.cancellationReason,
    };

    return NextResponse.json({
      success: true,
      ...exportData,
    });
  } catch (error) {
    console.error("Erreur lors de l'exportation du rendez-vous:", error);
    return NextResponse.json(
      { error: "Échec de l'exportation" },
      { status: 500 }
    );
  }
}