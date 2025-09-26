"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { format, subDays, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import type {
  DashboardStats,
  PendingApprovalUser,
  SubscriptionStats,
  SubscriptionPaymentWithRelations,
  PlanStat,
  UserGrowthDataPoint,
  RevenueDataPoint,
  DistributionDataPoint,
  StatisticsData,
  StatisticsDataPoint,
} from "./types";
import { sanitizePrisma } from "@/utils/sanitizePrisma";

export async function getDashboardStats(
  timeRange: string = "all"
): Promise<DashboardStats> {
  try {
    // Calculate percentage changes (mock data for now)
    let periodDays = 30;
    switch (timeRange) {
      case "all":
        const p = new Date("2024-01-01");
        const newDate = new Date();
        const milliDate = newDate.getTime() - p.getTime();
        const oneDayInMilliseconds = 1000 * 60 * 60 * 24;
        periodDays = Math.floor(milliDate / oneDayInMilliseconds);
        break;
      case "24h":
        periodDays = 1;
        break;
      case "7d":
        periodDays = 7;
        break;
      case "30d":
        periodDays = 30;
        break;
      case "90d":
        periodDays = 90;
        break;
      case "6m":
        periodDays = 180;
        break;
      case "1y":
        periodDays = 365;
        break;
    }

    const now = new Date();
    const periodStart = subDays(now, periodDays);

    // ➤ Count for previous period
    const currentNewDoctors = await prisma.user.count({
      where: {
        createdAt: { gte: periodStart, lt: now },
        OR: [{ role: "INDEPENDENT_DOCTOR" }, { role: "HOSPITAL_DOCTOR" }],
      },
    });

    // Get appointment counts
    const totalAppointments = await prisma.appointment.count({
      where: {
        createdAt: { gte: periodStart, lt: now },
      },
    });

    const userGrowthData = await generateUserGrowthData(timeRange);

    const revenueData = await generateRevenueData(timeRange);

    // Generate user distribution data
    const totalPatients = await prisma.user.count({
      where: { role: "PATIENT" },
    });
    const totalDoctors = await prisma.user.count({
      where: {
        OR: [{ role: "INDEPENDENT_DOCTOR" }, { role: "HOSPITAL_DOCTOR" }],
      },
    });
    const totalHospitals = await prisma.user.count({
      where: { role: "HOSPITAL_ADMIN" },
    });

    const userDistributionData = [
      { name: "Patients", value: totalPatients },
      { name: "Médecins", value: totalDoctors },
      { name: "Hôpitaux", value: totalHospitals },
    ];

    // Overview stats
    const overviewStats = [
      {
        title: "Utilisateurs Totaux",
        value: await prisma.user
          .count({
            where: { createdAt: { gte: periodStart } },
          })
          .then((v) => v.toString()),
        icon: "Users",
        color: "blue",
      },
      {
        title: "Nouveaux patients",
        value: await prisma.user
          .count({
            where: { role: "PATIENT", createdAt: { gte: periodStart } },
          })
          .then((v) => v.toString()),
        icon: "User",
        color: "green",
      },
      {
        title: "Nouveaux médecins",
        value: currentNewDoctors.toString(),
        icon: "Activity",
        color: "purple",
      },
      {
        title: "Rendez-vous",
        value: totalAppointments.toString(),
        icon: "Calendar",
        color: "amber",
      },
    ];

    return {
      overviewStats,
      userGrowthData,
      revenueData,
      userDistributionData,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

async function generateUserGrowthData(
  timeRange: string
): Promise<UserGrowthDataPoint[]> {
  const now = new Date();
  let startDate: Date;
  let intervalDays: number;
  let labelFormat: string;

  switch (timeRange) {
    case "all":
      const p = new Date("2023-07-01");
      const newDate = new Date();
      const diffInMonths =
        (newDate.getFullYear() - p.getFullYear()) * 12 +
        (newDate.getMonth() - p.getMonth());
      startDate = subMonths(now, diffInMonths);
      console.log({ startDate });
      intervalDays = 30;
      labelFormat = "MMM";
      break;
    case "24h":
      startDate = subDays(now, 1);
      intervalDays = 1;
      labelFormat = "HH:mm"; // optional: hourly not implemented here
      break;
    case "7d":
      startDate = subDays(now, 7);
      intervalDays = 1;
      labelFormat = "dd/MM";
      break;
    case "30d":
      startDate = subDays(now, 30);
      intervalDays = 2;
      labelFormat = "dd/MM";
      break;
    case "90d":
      startDate = subDays(now, 90);
      intervalDays = 7;
      labelFormat = "dd/MM";
      break;
    case "6m":
      startDate = subMonths(now, 6);
      intervalDays = 30;
      labelFormat = "MMM";
      break;
    case "1y":
      startDate = subMonths(now, 12);
      intervalDays = 30;
      labelFormat = "MMM";
      break;
    default:
      startDate = subDays(now, 30);
      intervalDays = 2;
      labelFormat = "dd/MM";
      break;
  }

  try {
    const data: UserGrowthDataPoint[] = [];

    const totalDays = Math.ceil(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const steps = Math.ceil(totalDays / intervalDays);

    for (let i = 0; i < steps; i++) {
      const from = subDays(now, intervalDays * (steps - i));
      const to = subDays(now, intervalDays * (steps - i - 1));

      const [patients, doctors, hospitals] = await Promise.all([
        prisma.user.count({
          where: { role: "PATIENT", createdAt: { gte: from, lt: to } },
        }),
        prisma.user.count({
          where: {
            OR: [{ role: "INDEPENDENT_DOCTOR" }, { role: "HOSPITAL_DOCTOR" }],
            createdAt: { gte: from, lt: to },
          },
        }),
        prisma.user.count({
          where: { role: "HOSPITAL_ADMIN", createdAt: { gte: from, lt: to } },
        }),
      ]);

      data.push({
        month: format(from, labelFormat, { locale: fr }),
        patients,
        doctors,
        hospitals,
      });
    }

    return data;
  } catch (error) {
    console.error("Error generating user growth data:", error);
    return [];
  }
}

async function generateRevenueData(range: string): Promise<RevenueDataPoint[]> {
  const now = new Date();
  let startDate: Date;
  let interval = 1; // in days
  let labelFormat = "dd/MM";

  switch (range) {
    case "all":
      const p = new Date("2023-07-01");
      const newDate = new Date();
      const diffInMonths =
        (newDate.getFullYear() - p.getFullYear()) * 12 +
        (newDate.getMonth() - p.getMonth());
      startDate = subMonths(now, diffInMonths);
      console.log({ startDate });
      interval = 30;
      labelFormat = "MMM";
      break;
    case "24h":
      startDate = subDays(now, 1);
      interval = 1;
      labelFormat = "HH:mm"; // could adapt this if grouping by hour later
      break;
    case "7d":
      startDate = subDays(now, 7);
      interval = 1;
      labelFormat = "dd/MM";
      break;
    case "30d":
      startDate = subDays(now, 30);
      interval = 2;
      labelFormat = "dd/MM";
      break;
    case "90d":
      startDate = subDays(now, 90);
      interval = 7;
      labelFormat = "dd/MM";
      break;
    case "6m":
      startDate = subMonths(now, 6);
      interval = 30;
      labelFormat = "MMM";
      break;
    case "1y":
      startDate = subMonths(now, 12);
      interval = 30;
      labelFormat = "MMM";
      break;
    default:
      startDate = subDays(now, 30);
      interval = 2;
  }

  const data: RevenueDataPoint[] = [];

  const loopCount = Math.ceil(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * interval)
  );

  for (let i = 0; i < loopCount; i++) {
    const from = subDays(now, interval * (loopCount - i));
    const to = subDays(now, interval * (loopCount - i - 1));

    const subscriptionRevenue = await prisma.subscriptionPayment.aggregate({
      _sum: { amount: true },
      where: {
        status: "COMPLETED",
        paymentDate: {
          gte: from,
          lt: to,
        },
      },
    });

    const subscriptions = subscriptionRevenue._sum.amount?.toNumber() || 0;
    const services = 0; // 👈 tu peux adapter si tu as d'autres sources

    data.push({
      date: format(from, labelFormat, { locale: fr }),
      subscriptions,
      services,
      total: subscriptions,
    });
  }

  return data;
}

export async function getPendingApprovals(): Promise<PendingApprovalUser[]> {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          // Independent doctors waiting for approval OR whose Doctor is not verified
          {
            role: "INDEPENDENT_DOCTOR",
            OR: [{ isApproved: false }, { doctor: { isVerified: false } }],
          },
          // Hospital admins awaiting approval
          { role: "HOSPITAL_ADMIN", isApproved: false },
        ],
      },
      include: {
        profile: true,
        doctor: true,
        hospital: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return sanitizePrisma(users) as PendingApprovalUser[];
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    throw new Error("Failed to fetch pending approvals");
  }
}

export async function getPendingSubscriptionPayments() {
  const payments = await prisma.subscriptionPayment.findMany({
    where: { status: "PENDING" },
    orderBy: { paymentDate: "desc" },
    take: 6,
    include: {
      subscription: {
        include: {
          doctor: {
            include: { user: { select: { name: true, email: true } } },
          },
          hospital: { select: { name: true, email: true } },
        },
      },
    },
  });
  return payments as SubscriptionPaymentWithRelations[];
}

export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  try {
    // Get total active subscriptions
    const totalActiveSubscriptions = await prisma.subscription.count({
      where: {
        status: "ACTIVE",
      },
    });

    console.log({ totalActiveSubscriptions });

    // Get total revenue (completed payments)
    const totalRevenue = await prisma.subscriptionPayment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "COMPLETED",
      },
    });

    console.log({ totalRevenue });

    // Get subscriptions by plan and subscriber type
    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ["plan", "subscriberType"],
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
      where: {
        status: "ACTIVE",
      },
    });

    // Get total count for percentage calculation
    const totalCount = subscriptionsByPlan.reduce(
      (sum, item) => sum + item._count.id,
      0
    );

    // Combine plan details with subscription counts
    const planStats: PlanStat[] = subscriptionsByPlan.map((sub) => {
      return {
        plan: sub.plan,
        subscriberType: sub.subscriberType,
        count: sub._count.id,
        percentage:
          totalCount > 0 ? Math.round((sub._count.id / totalCount) * 100) : 0,
        amount: sub._sum.amount?.toNumber() || 0,
      };
    });

    // Get recent payments
    const recentPayments = await prisma.subscriptionPayment.findMany({
      take: 10,
      orderBy: {
        paymentDate: "desc",
      },
      include: {
        subscription: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            hospital: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      totalActiveSubscriptions,
      totalRevenue: totalRevenue._sum.amount?.toNumber() || 0,
      planStats,
      recentPayments: recentPayments as SubscriptionPaymentWithRelations[],
    };
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    throw new Error("Failed to fetch subscription statistics");
  }
}

export async function approveUser(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/verification");
  } catch (error) {
    console.error("Error approving user:", error);
    throw new Error("Failed to approve user");
  }
}

export async function rejectUser(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/verification");
  } catch (error) {
    console.error("Error rejecting user:", error);
    throw new Error("Failed to reject user");
  }
}

export async function refreshDashboardData(
  dataType: string,
  timeRange: string = "30d"
): Promise<unknown> {
  try {
    switch (dataType) {
      case "stats":
        return await getDashboardStats(timeRange);
      case "approvals":
        return await getPendingApprovals();
      case "subscriptions":
        return await getSubscriptionStats();
      default:
        throw new Error("Invalid data type");
    }
  } catch (error) {
    console.error(`Error refreshing ${dataType} data:`, error);
    throw new Error(`Failed to refresh ${dataType} data`);
  }
}

export async function getStatisticsData(): Promise<StatisticsData> {
  try {
    // Get user counts
    const totalUsers = await prisma.user.count();
    const totalPatients = await prisma.user.count({
      where: { role: "PATIENT" },
    });
    const totalDoctors = await prisma.user.count({
      where: {
        OR: [{ role: "INDEPENDENT_DOCTOR" }, { role: "HOSPITAL_DOCTOR" }],
      },
    });
    const totalHospitals = await prisma.user.count({
      where: { role: "HOSPITAL_ADMIN" },
    });

    // Get new users in the last 30 days
    const thirtyDaysAgo = subDays(new Date(), 30);
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get appointment counts
    const totalAppointments = await prisma.appointment.count();

    // Get revenue data
    const totalRevenue = await prisma.subscriptionPayment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "COMPLETED",
      },
    });

    // Generate user growth data
    const userGrowthData = await generateStatisticsUserGrowthData();

    // Generate active users data
    const activeUsersData = await generateActiveUsersData();

    // Generate revenue data
    const revenueData = await generateStatisticsRevenueData();

    // Generate appointments data
    const appointmentsData = await generateAppointmentsData();

    // Generate user type distribution
    const userTypeData = [
      {
        name: "Patients",
        value: Math.round((totalPatients / totalUsers) * 100) || 0,
      },
      {
        name: "Médecins",
        value: Math.round((totalDoctors / totalUsers) * 100) || 0,
      },
      {
        name: "Hôpitaux",
        value: Math.round((totalHospitals / totalUsers) * 100) || 0,
      },
    ];

    // Generate subscription type distribution
    const subscriptionTypeData = await generateSubscriptionTypeData();

    // Generate platform usage data
    const platformUsageData = await generatePlatformUsageData();

    // Generate region data
    const regionData = await generateRegionData();

    // KPI cards data
    const kpiData = [
      {
        title: "Utilisateurs totaux",
        value: totalUsers.toString(),
        change: "+12.5%",
        trend: "up" as const,
        period: "vs mois dernier",
        icon: "Users",
        color: "blue",
      },
      {
        title: "Nouveaux utilisateurs",
        value: newUsers.toString(),
        change: "+8.2%",
        trend: "up" as const,
        period: "vs mois dernier",
        icon: "Activity",
        color: "green",
      },
      {
        title: "Rendez-vous",
        value: totalAppointments.toString(),
        change: "-3.1%",
        trend: "down" as const,
        period: "vs mois dernier",
        icon: "Calendar",
        color: "amber",
      },
      {
        title: "Revenus",
        value: `€${Math.round(totalRevenue._sum.amount?.toNumber() || 0)}`,
        change: "+15.3%",
        trend: "up" as const,
        period: "vs mois dernier",
        icon: "LineChart",
        color: "emerald",
      },
    ];

    return {
      kpiData,
      userGrowthData,
      activeUsersData,
      revenueData,
      appointmentsData,
      userTypeData,
      subscriptionTypeData,
      platformUsageData,
      regionData,
    };
  } catch (error) {
    console.error("Error fetching statistics data:", error);
    // Return fallback data
    return generateFallbackData();
  }
}

async function generateStatisticsUserGrowthData(): Promise<
  StatisticsDataPoint[]
> {
  try {
    const months = 12;
    const data: StatisticsDataPoint[] = [];

    for (let i = 0; i < months; i++) {
      const startDate = subMonths(new Date(), months - i - 1);
      const endDate = subMonths(new Date(), months - i - 2);

      const value = await prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      data.push({
        month: format(startDate, "MMM yyyy", { locale: fr }),
        value,
      });
    }

    return data;
  } catch (error) {
    console.error("Error generating user growth data:", error);
    // Return fallback data
    return Array.from({ length: 12 }, (_, i) => ({
      month: format(subMonths(new Date(), 11 - i), "MMM yyyy", { locale: fr }),
      value: Math.floor(Math.random() * 300) + 500 + i * 50,
    }));
  }
}

async function generateActiveUsersData(): Promise<StatisticsDataPoint[]> {
  try {
    const days = 30;
    const data: StatisticsDataPoint[] = [];

    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), days - i - 1);

      // In a real app, you would query a user_sessions or activity_logs table
      // For now, we'll generate random data that looks realistic
      const value = Math.floor(Math.random() * 1000) + 4000 + i * 30;

      data.push({
        month: format(date, "dd MMM", { locale: fr }),
        value,
      });
    }

    return data;
  } catch (error) {
    console.error("Error generating active users data:", error);
    // Return fallback data
    return Array.from({ length: 30 }, (_, i) => ({
      month: format(subDays(new Date(), 29 - i), "dd MMM", { locale: fr }),
      value: Math.floor(Math.random() * 1000) + 4000 + i * 30,
    }));
  }
}

async function generateStatisticsRevenueData(): Promise<StatisticsDataPoint[]> {
  try {
    const months = 12;
    const data: StatisticsDataPoint[] = [];

    for (let i = 0; i < months; i++) {
      const startDate = subMonths(new Date(), months - i - 1);
      const endDate = subMonths(new Date(), months - i - 2);

      const result = await prisma.subscriptionPayment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: "COMPLETED",
          paymentDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      data.push({
        month: format(startDate, "MMM yyyy", { locale: fr }),
        value: result._sum.amount?.toNumber() || 0,
      });
    }

    return data;
  } catch (error) {
    console.error("Error generating revenue data:", error);
    // Return fallback data
    return Array.from({ length: 12 }, (_, i) => ({
      month: format(subMonths(new Date(), 11 - i), "MMM yyyy", { locale: fr }),
      value: Math.floor(Math.random() * 5000) + 10000 + i * 1000,
    }));
  }
}

async function generateAppointmentsData(): Promise<StatisticsDataPoint[]> {
  try {
    const months = 12;
    const data: StatisticsDataPoint[] = [];

    for (let i = 0; i < months; i++) {
      const startDate = subMonths(new Date(), months - i - 1);
      const endDate = subMonths(new Date(), months - i - 2);

      const count = await prisma.appointment.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      data.push({
        month: format(startDate, "MMM yyyy", { locale: fr }),
        value: count,
      });
    }

    return data;
  } catch (error) {
    console.error("Error generating appointments data:", error);
    // Return fallback data
    return Array.from({ length: 12 }, (_, i) => ({
      month: format(subMonths(new Date(), 11 - i), "MMM yyyy", { locale: fr }),
      value: Math.floor(Math.random() * 500) + 2500 + i * 100,
    }));
  }
}

async function generateSubscriptionTypeData(): Promise<
  DistributionDataPoint[]
> {
  try {
    const subscriptionCounts = await prisma.subscription.groupBy({
      by: ["plan"],
      _count: {
        id: true,
      },
      where: {
        status: "ACTIVE",
      },
    });

    const totalCount = subscriptionCounts.reduce(
      (sum, item) => sum + item._count.id,
      0
    );

    return subscriptionCounts.map((item) => ({
      name: item.plan,
      value:
        totalCount > 0 ? Math.round((item._count.id / totalCount) * 100) : 0,
    }));
  } catch (error) {
    console.error("Error generating subscription type data:", error);
    // Return fallback data
    return [
      { name: "FREE", value: 40 },
      { name: "STANDARD", value: 20 },
      { name: "PREMIUM", value: 8 },
    ];
  }
}

async function generatePlatformUsageData(): Promise<DistributionDataPoint[]> {
  // In a real app, you would query a user_sessions or analytics table
  // For now, we'll return mock data
  return [
    { name: "Web", value: 45 },
    { name: "Mobile", value: 55 },
  ];
}

async function generateRegionData(): Promise<DistributionDataPoint[]> {
  try {
    // In a real app, you would query user addresses or location data
    // For now, we'll return mock data
    return [
      { name: "Dakar", value: 35 },
      { name: "Thiès", value: 15 },
      { name: "Saint-Louis", value: 12 },
      { name: "Ziguinchor", value: 10 },
      { name: "Kaolack", value: 8 },
      { name: "Autres", value: 20 },
    ];
  } catch (error) {
    console.error("Error generating region data:", error);
    // Return fallback data
    return [
      { name: "Dakar", value: 35 },
      { name: "Thiès", value: 15 },
      { name: "Saint-Louis", value: 12 },
      { name: "Ziguinchor", value: 10 },
      { name: "Kaolack", value: 8 },
      { name: "Autres", value: 20 },
    ];
  }
}

function generateFallbackData(): StatisticsData {
  // Generate fallback data for when the database queries fail
  return {
    kpiData: [
      {
        title: "Utilisateurs totaux",
        value: "24,892",
        change: "+12.5%",
        trend: "up",
        period: "vs mois dernier",
        icon: "Users",
        color: "blue",
      },
      {
        title: "Nouveaux utilisateurs",
        value: "1,253",
        change: "+8.2%",
        trend: "up",
        period: "vs mois dernier",
        icon: "Activity",
        color: "green",
      },
      {
        title: "Rendez-vous",
        value: "8,472",
        change: "-3.1%",
        trend: "down",
        period: "vs mois dernier",
        icon: "Calendar",
        color: "amber",
      },
      {
        title: "Revenus",
        value: "€89,432",
        change: "+15.3%",
        trend: "up",
        period: "vs mois dernier",
        icon: "LineChart",
        color: "emerald",
      },
    ],
    userGrowthData: Array.from({ length: 12 }, (_, i) => ({
      month: format(subMonths(new Date(), 11 - i), "MMM yyyy", { locale: fr }),
      value: Math.floor(Math.random() * 300) + 500 + i * 50,
    })),
    activeUsersData: Array.from({ length: 30 }, (_, i) => ({
      month: format(subDays(new Date(), 29 - i), "dd MMM", { locale: fr }),
      value: Math.floor(Math.random() * 1000) + 4000 + i * 30,
    })),
    revenueData: Array.from({ length: 12 }, (_, i) => ({
      month: format(subMonths(new Date(), 11 - i), "MMM yyyy", { locale: fr }),
      value: Math.floor(Math.random() * 5000) + 10000 + i * 1000,
    })),
    appointmentsData: Array.from({ length: 12 }, (_, i) => ({
      month: format(subMonths(new Date(), 11 - i), "MMM yyyy", { locale: fr }),
      value: Math.floor(Math.random() * 500) + 2500 + i * 100,
    })),
    userTypeData: [
      { name: "Patients", value: 65 },
      { name: "Médecins", value: 25 },
      { name: "Hôpitaux", value: 10 },
    ],
    subscriptionTypeData: [
      { name: "FREE", value: 40 },
      { name: "STANDARD", value: 20 },
      { name: "PREMIUM", value: 8 },
    ],
    platformUsageData: [
      { name: "Web", value: 45 },
      { name: "Mobile", value: 55 },
    ],
    regionData: [
      { name: "Dakar", value: 35 },
      { name: "Thiès", value: 15 },
      { name: "Saint-Louis", value: 12 },
      { name: "Ziguinchor", value: 10 },
      { name: "Kaolack", value: 8 },
      { name: "Autres", value: 20 },
    ],
  };
}
