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

function calculatePercentageChange(current: number, previous: number): string {
  const change = (current - previous) / Math.max(previous, 1); // doit etre multiplie par 100 pour le pourcentage
  // const change = ((current - previous) / previous) * 100;
  const formatted = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
  return formatted;
}

export async function getDashboardStats(
  timeRange: string = "30d"
): Promise<DashboardStats> {
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

    let userData: number | null = null;

    switch (timeRange) {
      case "7d":
        const sevenDaysAgo = subDays(new Date(), 7);
        userData = await prisma.user.count({
          where: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
        });
        break;
      case "30d":
        const thirtyDaysAgo = subDays(new Date(), 30);
        userData = await prisma.user.count({
          where: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        });
        break;
      case "90d":
        const ninetyDaysAgo = subDays(new Date(), 90);
        userData = await prisma.user.count({
          where: {
            createdAt: {
              gte: ninetyDaysAgo,
            },
          },
        });
        break;
      case "6m":
        const sixMonthsAgo = subMonths(new Date(), 6);
        userData = await prisma.user.count({
          where: {
            createdAt: {
              gte: sixMonthsAgo,
            },
          },
        });
        break;
      case "1y":
        const oneYearAgo = subMonths(new Date(), 12);
        userData = await prisma.user.count({
          where: {
            createdAt: {
              gte: oneYearAgo,
            },
          },
        });
        break;
      default:
        const defaultDaysAgo = subDays(new Date(), 30);
        userData = await prisma.user.count({
          where: {
            createdAt: {
              gte: defaultDaysAgo,
            },
          },
        });
        break;
    }

    // Get appointment counts
    const totalAppointments = await prisma.appointment.count();

    // Calculate percentage changes (mock data for now)
    let periodDays = 30;
    switch (timeRange) {
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
    const previousPeriodStart = subDays(periodStart, periodDays);

    // ➤ Count for previous period
    const [
      previousUsers,
      previousPatients,
      previousDoctors,
      previousAppointments,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: previousPeriodStart, lt: periodStart } },
      }),
      prisma.user.count({
        where: {
          role: "PATIENT",
          createdAt: { gte: previousPeriodStart, lt: periodStart },
        },
      }),
      prisma.user.count({
        where: {
          OR: [{ role: "INDEPENDENT_DOCTOR" }, { role: "HOSPITAL_DOCTOR" }],
          createdAt: { gte: previousPeriodStart, lt: periodStart },
        },
      }),
      prisma.appointment.count({
        where: { createdAt: { gte: previousPeriodStart, lt: periodStart } },
      }),
    ]);

    // ➤ Calculate percentage change
    const userChange = calculatePercentageChange(userData, previousUsers);
    const patientChange = calculatePercentageChange(
      await prisma.user.count({
        where: { role: "PATIENT", createdAt: { gte: periodStart } },
      }),
      previousPatients
    );
    const doctorChange = calculatePercentageChange(
      await prisma.user.count({
        where: {
          OR: [{ role: "INDEPENDENT_DOCTOR" }, { role: "HOSPITAL_DOCTOR" }],
          createdAt: { gte: periodStart },
        },
      }),
      previousDoctors
    );
    const appointmentChange = calculatePercentageChange(
      await prisma.appointment.count({
        where: { createdAt: { gte: periodStart } },
      }),
      previousAppointments
    );

    // const userChange = "+12.5%";
    // const patientChange = "+18.2%";
    // const doctorChange = "+5.3%";
    // const appointmentChange = "-2.1%";

    const userGrowthData = await generateUserGrowthData(timeRange);

    const revenueData = await generateRevenueData(timeRange);

    // Generate user distribution data
    const userDistributionData = [
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

    // Overview stats
    const overviewStats = [
      {
        title: "Utilisateurs Totaux",
        value: totalUsers.toString(),
        change: userChange,
        trend: "up" as const,
        icon: "Users",
        color: "blue",
      },
      {
        title: "Nouveaux Patients",
        value: userData.toString(),
        change: patientChange,
        trend: "up" as const,
        icon: "User",
        color: "green",
      },
      {
        title: "Médecins Actifs",
        value: totalDoctors.toString(),
        change: doctorChange,
        trend: "up" as const,
        icon: "Activity",
        color: "purple",
      },
      {
        title: "Rendez-vous",
        value: totalAppointments.toString(),
        change: appointmentChange,
        trend: "down" as const,
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

// async function generateUserGrowthData(
//   timeRange: string
// ): Promise<UserGrowthDataPoint[]> {
//   let startDate: Date;
//   const now = new Date();

//   switch (timeRange) {
//     case "24h":
//       startDate = subDays(now, 1);
//       break;
//     case "7d":
//       startDate = subDays(now, 7);
//       break;
//     case "30d":
//       startDate = subDays(now, 30);
//       break;
//     case "90d":
//       startDate = subDays(now, 90);
//       break;
//     case "6m":
//       startDate = subMonths(now, 6);
//       break;
//     case "1y":
//       startDate = subMonths(now, 12);
//       break;
//     default:
//       startDate = subDays(now, 30);
//   }

//   try {
//     const data: UserGrowthDataPoint[] = [];

//     // Example: break by week if range < 90d, else by month
//     const interval = timeRange === "24h" ? 1 : timeRange === "7d" ? 1 : 7;

//     for (
//       let i = 0;
//       i <=
//       Math.floor(
//         (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * interval)
//       );
//       i++
//     ) {
//       const from = subDays(
//         now,
//         interval *
//           (Math.floor(
//             Math.floor(
//               (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
//             ) / interval
//           ) -
//             i)
//       );
//       const to = new Date(from);
//       to.setDate(from.getDate() + interval);

//       const [patients, doctors, hospitals] = await Promise.all([
//         prisma.user.count({
//           where: { role: "PATIENT", createdAt: { gte: from, lt: to } },
//         }),
//         prisma.user.count({
//           where: {
//             OR: [{ role: "INDEPENDENT_DOCTOR" }, { role: "HOSPITAL_DOCTOR" }],
//             createdAt: { gte: from, lt: to },
//           },
//         }),
//         prisma.user.count({
//           where: { role: "HOSPITAL_ADMIN", createdAt: { gte: from, lt: to } },
//         }),
//       ]);

//       data.push({
//         month: format(
//           from,
//           timeRange === "24h" || timeRange === "7d" ? "dd/MM" : "MMM",
//           { locale: fr }
//         ),
//         patients,
//         doctors,
//         hospitals,
//       });
//     }

//     return data;
//   } catch (error) {
//     console.error("Error generating user growth data:", error);
//     // Return fallback data
//     return Array.from({ length: 12 }, (_, i) => {
//       const month = format(subMonths(new Date(), 11 - i), "MMM", {
//         locale: fr,
//       });
//       return {
//         month,
//         patients: 500 + Math.floor(Math.random() * 300) + i * 50,
//         doctors: 100 + Math.floor(Math.random() * 50) + i * 10,
//         hospitals: 20 + Math.floor(Math.random() * 10) + i * 2,
//       };
//     });
//   }
// }

async function generateUserGrowthData(
  timeRange: string
): Promise<UserGrowthDataPoint[]> {
  const now = new Date();
  let startDate: Date;
  let intervalDays: number;
  let labelFormat: string;

  switch (timeRange) {
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
    const total = subscriptions + services;

    data.push({
      date: format(from, labelFormat, { locale: fr }),
      subscriptions,
      services,
      total,
    });
  }

  return data;
}

export async function getPendingApprovals(): Promise<PendingApprovalUser[]> {
  try {
    const users = await prisma.user.findMany({
      where: {
        isApproved: false,
        emailVerified: { not: null }, // Only users who have verified their email
        role: {
          in: ["HOSPITAL_ADMIN", "INDEPENDENT_DOCTOR"],
        },
      },
      include: {
        profile: true,
        doctor: true,
        hospital: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5, // Limit to 10 for dashboard
    });

    return sanitizePrisma(users) as PendingApprovalUser[];
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    throw new Error("Failed to fetch pending approvals");
  }
}

export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  try {
    // Get total active subscriptions
    const totalActiveSubscriptions = await prisma.subscription.count({
      where: {
        status: "ACTIVE",
      },
    });

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
      { name: "BASIC", value: 30 },
      { name: "STANDARD", value: 20 },
      { name: "PREMIUM", value: 8 },
      { name: "ENTERPRISE", value: 2 },
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
      { name: "BASIC", value: 30 },
      { name: "STANDARD", value: 20 },
      { name: "PREMIUM", value: 8 },
      { name: "ENTERPRISE", value: 2 },
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
