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

    // Get total doctors count
    const totalDoctors = await prisma.doctor.count();

    // Get active doctors count
    const activeDoctors = await prisma.doctor.count({
      where: {
        user: {
          isActive: true,
        },
      },
    });

    // Get verified doctors count
    const verifiedDoctors = await prisma.doctor.count({
      where: {
        isVerified: true,
      },
    });

    // Get new doctors in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newDoctors = await prisma.doctor.count({
      where: {
        user: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      },
    });

    // Get doctor registrations over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const doctorRegistrations = await prisma.doctor.findMany({
      where: {
        user: {
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
      },
      select: {
        user: {
          select: {
            createdAt: true,
          },
        },
      },
      orderBy: {
        user: {
          createdAt: "asc",
        },
      },
    });

    // Group doctors by month
    const registrationsByMonth: Record<string, number> = {};

    doctorRegistrations.forEach((doctor) => {
      const monthYear = `${doctor.user.createdAt.getMonth() + 1}/${doctor.user.createdAt.getFullYear()}`;
      registrationsByMonth[monthYear] =
        (registrationsByMonth[monthYear] || 0) + 1;
    });

    // Format registrations by month for chart
    const registrationsActivity = Object.entries(registrationsByMonth).map(
      ([month, count]) => ({
        month,
        count,
      })
    );

    // Get specialty distribution
    const specialtyDistribution = await prisma.doctor.groupBy({
      by: ["specialization"],
      _count: {
        id: true,
      },
    });

    // Format specialty distribution
    const formattedSpecialtyDistribution = specialtyDistribution.map(
      (item) => ({
        specialty: item.specialization,
        count: item._count.id,
      })
    );

    // Get geographical distribution (by city)
    const geographicalDistribution = await prisma.userProfile.groupBy({
      by: ["city"],
      where: {
        user: {
          doctor: {
            isNot: null,
          },
        },
        city: {
          not: null,
        },
      },
      _count: {
        city: true,
      },
    });

    // Format geographical distribution
    const formattedGeographicalDistribution = geographicalDistribution.map(
      (item) => ({
        city: item.city!,
        count: item._count.city,
      })
    );

    const subscriptionDistribution = await prisma.subscription.groupBy({
      by: ["plan"],
      where: {
        doctorId: {
          not: null, // Only independent doctors
        },
      },
      _count: {
        plan: true,
      },
    });

    const formattedSubscriptionDistribution = subscriptionDistribution.map(
      (item) => ({
        plan: item.plan,
        count: item._count.plan,
      })
    );

    return NextResponse.json({
      totalDoctors,
      activeDoctors,
      verifiedDoctors,
      newDoctors,
      registrationsActivity,
      specialtyDistribution: formattedSpecialtyDistribution,
      geographicalDistribution: formattedGeographicalDistribution,
      subscriptionDistribution: formattedSubscriptionDistribution,
    });
  } catch (error) {
    console.error("Error fetching doctor analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor analytics" },
      { status: 500 }
    );
  }
}
