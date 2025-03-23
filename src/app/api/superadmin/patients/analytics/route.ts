export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json({
      totalPatients,
      activePatients,
      newPatients,
      patientActivity: appointmentsActivity,
      geographicalDistribution: formattedGeographicalDistribution,
    });
  } catch (error) {
    console.error("Error fetching patient analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient analytics" },
      { status: 500 }
    );
  }
}
