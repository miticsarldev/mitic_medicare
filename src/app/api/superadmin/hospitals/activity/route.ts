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

    // Get recent hospital registrations
    const recentRegistrations = await prisma.hospital.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        city: true,
        createdAt: true,
      },
    });

    // Get recent hospital updates
    const recentUpdates = await prisma.hospital.findMany({
      where: {
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
        city: true,
        updatedAt: true,
      },
    });

    // Get recent doctor assignments to hospitals
    const recentDoctorAssignments = await prisma.doctor.findMany({
      where: {
        hospitalId: {
          not: null,
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
        user: {
          select: {
            name: true,
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedAt: true,
      },
    });

    // Combine and format all activities
    const activities = [
      ...recentRegistrations.map((hospital) => ({
        id: `R-${hospital.id}`,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        action: "Nouvel établissement",
        details: `${hospital.city}`,
        date: hospital.createdAt.toISOString(),
      })),
      ...recentUpdates.map((hospital) => ({
        id: `U-${hospital.id}`,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        action: "Mise à jour",
        details: `Informations modifiées pour ${hospital.name} à ${hospital.city}`,
        date: hospital.updatedAt.toISOString(),
      })),
      ...recentDoctorAssignments.map((doctor) => ({
        id: `D-${doctor.id}`,
        hospitalId: doctor.hospital?.id,
        hospitalName: doctor.hospital?.name,
        action: "Médecin ajouté",
        details: `${doctor.user.name} a rejoint l'établissement`,
        date: doctor.updatedAt.toISOString(),
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
    console.error("Error fetching hospital activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospital activity" },
      { status: 500 }
    );
  }
}
