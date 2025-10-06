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
  DistributionDataPoint,
  StatisticsData,
  StatisticsDataPoint,
} from "./types";
import { sendApprovingEmail } from "@/lib/email";

// actions.ts (server)
import { Prisma } from "@prisma/client";

type Bucket = {
  bucket: string;
  patients?: number;
  doctors?: number;
  hospitals?: number;
  subscriptions?: Prisma.Decimal;
};

function bucketFormat(range: string) {
  // month buckets for large ranges; day buckets for ≤30d
  if (["all", "6m", "1y", "90d"].includes(range)) return "month";
  return "day";
}

function dateRangeFor(range: string) {
  const now = new Date();
  switch (range) {
    case "24h":
      return { start: subDays(now, 1), end: now };
    case "7d":
      return { start: subDays(now, 7), end: now };
    case "30d":
      return { start: subDays(now, 30), end: now };
    case "90d":
      return { start: subDays(now, 90), end: now };
    case "6m":
      return { start: subMonths(now, 6), end: now };
    case "1y":
      return { start: subMonths(now, 12), end: now };
    case "all":
    default:
      return { start: new Date("2024-01-01"), end: now };
  }
}

async function usersGrowthBuckets(range: string) {
  const { start, end } = dateRangeFor(range);
  const grain = bucketFormat(range) === "month" ? "month" : "day";

  // Patients
  const patients = await prisma.$queryRaw<Bucket[]>`
    SELECT to_char(date_trunc(${grain}, "createdAt"), ${grain === "month" ? "FMMon YYYY" : "DD/MM"}) AS bucket,
           COUNT(*)::int AS patients
    FROM "User"
    WHERE "role" = 'PATIENT' AND "createdAt" >= ${start} AND "createdAt" < ${end}
    GROUP BY 1
    ORDER BY MIN(date_trunc(${grain}, "createdAt"))
  `;
  // Doctors (both types)
  const doctors = await prisma.$queryRaw<Bucket[]>`
    SELECT to_char(date_trunc(${grain}, "createdAt"), ${grain === "month" ? "FMMon YYYY" : "DD/MM"}) AS bucket,
           COUNT(*)::int AS doctors
    FROM "User"
    WHERE "role" IN ('INDEPENDENT_DOCTOR','HOSPITAL_DOCTOR')
      AND "createdAt" >= ${start} AND "createdAt" < ${end}
    GROUP BY 1
    ORDER BY MIN(date_trunc(${grain}, "createdAt"))
  `;
  // Hospitals (created)
  const hospitals = await prisma.$queryRaw<Bucket[]>`
    SELECT to_char(date_trunc(${grain}, "createdAt"), ${grain === "month" ? "FMMon YYYY" : "DD/MM"}) AS bucket,
           COUNT(*)::int AS hospitals
    FROM "Hospital"
    WHERE "createdAt" >= ${start} AND "createdAt" < ${end}
    GROUP BY 1
    ORDER BY MIN(date_trunc(${grain}, "createdAt"))
  `;

  // merge buckets
  const map = new Map<
    string,
    { month: string; patients: number; doctors: number; hospitals: number }
  >();
  const ensure = (b: string) => {
    if (!map.has(b))
      map.set(b, { month: b, patients: 0, doctors: 0, hospitals: 0 });
    return map.get(b)!;
  };
  patients.forEach((r) => {
    ensure(r.bucket).patients = r.patients ?? 0;
  });
  doctors.forEach((r) => {
    ensure(r.bucket).doctors = r.doctors ?? 0;
  });
  hospitals.forEach((r) => {
    ensure(r.bucket).hospitals = r.hospitals ?? 0;
  });

  return Array.from(map.values());
}

async function revenueBuckets(range: string) {
  const { start, end } = dateRangeFor(range);
  const grain = bucketFormat(range) === "month" ? "month" : "day";

  const rows = await prisma.$queryRaw<Bucket[]>`
    SELECT to_char(date_trunc(${grain}, "paymentDate"), ${grain === "month" ? "FMMon YYYY" : "DD/MM"}) AS bucket,
           COALESCE(SUM("amount"), 0) AS subscriptions
    FROM "SubscriptionPayment"
    WHERE "status" = 'COMPLETED' AND "paymentDate" >= ${start} AND "paymentDate" < ${end}
    GROUP BY 1
    ORDER BY MIN(date_trunc(${grain}, "paymentDate"))
  `;

  return rows.map((r) => ({
    date: r.bucket,
    subscriptions: Number(r.subscriptions ?? 0),
    total: Number(r.subscriptions ?? 0),
  }));
}

export async function getDashboardStats(
  timeRange = "all"
): Promise<DashboardStats> {
  try {
    const { start: periodStart, end: now } = dateRangeFor(timeRange);

    const [
      totalUsers,
      newPatients,
      newDoctors,
      totalAppointments,
      userGrowthData,
      revenueData,
      totalPatients,
      totalDoctorsUsers,
      totalHospAdmins,
    ] = await Promise.all([
      prisma.user.count(), // TRUE total
      prisma.user.count({
        where: { role: "PATIENT", createdAt: { gte: periodStart, lt: now } },
      }),
      prisma.user.count({
        where: {
          role: { in: ["INDEPENDENT_DOCTOR", "HOSPITAL_DOCTOR"] },
          createdAt: { gte: periodStart, lt: now },
        },
      }),
      prisma.appointment.count({
        where: { createdAt: { gte: periodStart, lt: now } },
      }),
      generateUserGrowthData(timeRange),
      generateRevenueData(timeRange),
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.user.count({
        where: { role: { in: ["INDEPENDENT_DOCTOR", "HOSPITAL_DOCTOR"] } },
      }),
      prisma.user.count({ where: { role: "HOSPITAL_ADMIN" } }),
    ]);

    const overviewStats = [
      {
        title: "Utilisateurs Totaux",
        value: String(totalUsers),
        icon: "Users",
        color: "blue",
      },
      {
        title: "Nouveaux patients",
        value: String(newPatients),
        icon: "User",
        color: "green",
      },
      {
        title: "Nouveaux médecins",
        value: String(newDoctors),
        icon: "Activity",
        color: "purple",
      },
      {
        title: "Rendez-vous",
        value: String(totalAppointments),
        icon: "Calendar",
        color: "amber",
      },
    ];

    const userDistributionData = [
      { name: "Patients", value: totalPatients },
      { name: "Médecins", value: totalDoctorsUsers },
      { name: "Hôpitaux", value: totalHospAdmins },
    ];

    return { overviewStats, userGrowthData, revenueData, userDistributionData };
  } catch (e) {
    console.error(e);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

async function generateUserGrowthData(timeRange: string) {
  return usersGrowthBuckets(timeRange); // already in chart shape
}

async function generateRevenueData(range: string) {
  return revenueBuckets(range);
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

    return users.map((user) => ({
      ...user,
      createdAt:
        user.createdAt instanceof Date
          ? user.createdAt.toISOString()
          : user.createdAt,
      updatedAt:
        user.updatedAt instanceof Date
          ? user.updatedAt.toISOString()
          : user.updatedAt,
      profile: user.profile
        ? {
            ...user.profile,
            createdAt:
              user.profile.createdAt instanceof Date
                ? user.profile.createdAt.toISOString()
                : user.profile.createdAt,
            updatedAt:
              user.profile.updatedAt instanceof Date
                ? user.profile.updatedAt.toISOString()
                : user.profile.updatedAt,
          }
        : null,
      doctor: user.doctor
        ? {
            ...user.doctor,
            createdAt:
              user.doctor.createdAt instanceof Date
                ? user.doctor.createdAt.toISOString()
                : user.doctor.createdAt,
            updatedAt:
              user.doctor.updatedAt instanceof Date
                ? user.doctor.updatedAt.toISOString()
                : user.doctor.updatedAt,
          }
        : null,
      hospital: user.hospital
        ? {
            ...user.hospital,
            createdAt:
              user.hospital.createdAt instanceof Date
                ? user.hospital.createdAt.toISOString()
                : user.hospital.createdAt,
            updatedAt:
              user.hospital.updatedAt instanceof Date
                ? user.hospital.updatedAt.toISOString()
                : user.hospital.updatedAt,
          }
        : null,
    })) as PendingApprovalUser[];
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
    // ➤ Total des abonnements actifs
    const totalActiveSubscriptions = await prisma.subscription.count({
      where: { status: "ACTIVE" },
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

    // Get subscriptions by plan and subscriber type
    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ["plan"],
      _count: {
        id: true,
      },
      where: {
        status: "ACTIVE",
      },
    });

    // ➤ Nombre total pour calcul des pourcentages
    const totalCount = subscriptionsByPlan.reduce(
      (sum, item) => sum + item._count.id,
      0
    );

    // ➤ Statistiques par plan
    const planStats: PlanStat[] = subscriptionsByPlan.map((sub) => ({
      plan: sub.plan,
      count: sub._count.id,
      percentage:
        totalCount > 0 ? Math.round((sub._count.id / totalCount) * 100) : 0,
      amount: 0, // (optionnel) si on veut un montant par plan, à calculer plus bas
    }));

    // ➤ Derniers paiements
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

export async function approveUser(user: PendingApprovalUser): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { isApproved: true },
    });

    await sendApprovingEmail(
      user.name,
      user.email,
      user.role,
      user.hospital?.name ?? "Hopital"
    );
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
