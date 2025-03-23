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

    // Get recent doctor registrations
    const recentRegistrations = await prisma.doctor.findMany({
      take: limit,
      orderBy: {
        user: {
          createdAt: "desc",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    // Get recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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
        doctor: {
          isNot: null,
        },
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
      ...recentRegistrations.map((doctor) => ({
        id: `R-${doctor.id}`,
        doctorId: doctor.user.id,
        doctorName: doctor.user.name,
        action: "Inscription",
        details: `Nouveau médecin inscrit: ${doctor.specialization}`,
        date: doctor.user.createdAt.toISOString(),
      })),
      ...recentAppointments.map((appointment) => ({
        id: `A-${appointment.id}`,
        doctorId: appointment.doctor.user.id,
        doctorName: appointment.doctor.user.name,
        action: "Rendez-vous",
        details: `Rendez-vous avec ${appointment.patient.user.name} (${appointment.status})`,
        date: appointment.createdAt.toISOString(),
      })),
      ...recentProfileUpdates.map((user) => ({
        id: `P-${user.id}`,
        doctorId: user.id,
        doctorName: user.name,
        action: "Mise à jour",
        details: "Profil mis à jour",
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
    console.error("Error fetching doctor activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor activity" },
      { status: 500 }
    );
  }
}
