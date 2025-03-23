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

    // Get total hospitals count
    const totalHospitals = await prisma.hospital.count();

    // Get active hospitals count
    const activeHospitals = await prisma.hospital.count({
      where: {
        status: "ACTIVE",
      },
    });

    // Get new hospitals in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newHospitals = await prisma.hospital.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get hospital registrations over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const hospitalRegistrations = await prisma.hospital.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group hospitals by month
    const registrationsByMonth: Record<string, number> = {};

    hospitalRegistrations.forEach((hospital) => {
      const monthYear = `${hospital.createdAt.getMonth() + 1}/${hospital.createdAt.getFullYear()}`;
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

    // Get geographical distribution (by state/region)
    const geographicalDistribution = await prisma.hospital.groupBy({
      by: ["city"],
      where: {
        city: {
          not: "",
        },
      },
      _count: {
        id: true,
      },
    });

    // Format geographical distribution
    const formattedGeographicalDistribution = geographicalDistribution.map(
      (item) => ({
        region: item.city!,
        count: item?._count,
      })
    );

    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ["plan"],
      where: {
        hospitalId: {
          not: null, // We only want hospital subscriptions
        },
      },
      _count: {
        hospitalId: true,
      },
    });

    const formattedSubscriptionDistribution = subscriptionsByPlan.map(
      (item) => ({
        plan: item.plan,
        count: item._count.hospitalId,
      })
    );

    return NextResponse.json({
      totalHospitals,
      activeHospitals,
      newHospitals,
      registrationsActivity,
      geographicalDistribution: formattedGeographicalDistribution,
      subscriptionsByPlan: formattedSubscriptionDistribution,
    });
  } catch (error) {
    console.error("Error fetching hospital analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospital analytics" },
      { status: 500 }
    );
  }
}
