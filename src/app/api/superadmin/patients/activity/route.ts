export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = Number.parseInt(
      request.nextUrl.searchParams.get("limit") || "10"
    );

    // Get recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
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
          },
        },
      },
    });

    // Get recent medical records
    const recentMedicalRecords = await prisma.medicalRecord.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Get recent profile updates
    const recentProfileUpdates = await prisma.user.findMany({
      where: {
        role: "PATIENT",
        updatedAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
        },
      },
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        name: true,
        updatedAt: true,
      },
    });

    // Combine and format all activities
    const activities = [
      ...recentAppointments.map((appointment) => ({
        id: `A-${appointment.id}`,
        patientId: appointment.patientId,
        patientName: appointment.patient.user.name,
        action:
          appointment.status === "CONFIRMED"
            ? "Rendez-vous pris"
            : appointment.status === "CANCELED"
              ? "Rendez-vous annulé"
              : "Rendez-vous mis à jour",
        details: `Consultation avec Dr. ${appointment.doctor.user.name} (${appointment.type || "Consultation"})`,
        date: appointment.updatedAt.toISOString(),
      })),
      ...recentMedicalRecords.map((record) => ({
        id: `M-${record.id}`,
        patientId: record.patientId,
        patientName: record.patient.user.name,
        action: "Document ajouté",
        details: `Dossier médical: ${record.diagnosis.substring(0, 50)}...`,
        date: record.createdAt.toISOString(),
      })),
      ...recentProfileUpdates.map((user) => ({
        id: `P-${user.id}`,
        patientId: user.id,
        patientName: user.name,
        action: "Mise à jour du profil",
        details: "Informations de contact modifiées",
        date: user.updatedAt.toISOString(),
      })),
    ];

    // Sort by date (newest first)
    activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Take only the requested number
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json(limitedActivities);
  } catch (error) {
    console.error("Error fetching patient activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient activity" },
      { status: 500 }
    );
  }
}
