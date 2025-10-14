"use server";

import { revalidatePath, unstable_noStore } from "next/cache";
import prisma from "@/lib/prisma";
import { addMonths, subDays, subMonths } from "date-fns";
import type {
  DashboardStats,
  PendingApprovalUser,
  SubscriptionStats,
  SubscriptionPaymentWithRelations,
  PlanStat,
} from "./types";
import { sendApprovingEmail } from "@/lib/email";

// actions.ts (server)
import { Prisma, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

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
  unstable_noStore();
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
  unstable_noStore();
  try {
    const users = await prisma.user.findMany({
      where: {
        emailVerified: { not: null },
        isApproved: false,
        role: {
          in: ["HOSPITAL_ADMIN", "INDEPENDENT_DOCTOR"],
        },
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
  unstable_noStore();

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
  unstable_noStore();

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

    const now = new Date();
    const periodStart = now;
    const periodEnd = addMonths(now, 1);

    // should check for role
    // Assign Free Subscription to Patient (If not already assigned)
    if (user.role === "INDEPENDENT_DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: user?.id },
      });

      const existingSubscription = await prisma.subscription.findFirst({
        where: { doctorId: doctor?.id, subscriberType: "DOCTOR" },
      });

      if (!existingSubscription && doctor) {
        await prisma.subscription.create({
          data: {
            doctorId: doctor?.id,
            subscriberType: "DOCTOR",
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.ACTIVE,
            amount: 0,
            startDate: periodStart,
            endDate: periodEnd,
          },
        });
      }
    } else if (user.role === "HOSPITAL_ADMIN") {
      // Find the hospital associated with this admin
      const hospital = await prisma.hospital.findUnique({
        where: { adminId: user.id },
      });

      if (hospital) {
        const existingSubscription = await prisma.subscription.findFirst({
          where: {
            hospitalId: hospital.id,
            subscriberType: "HOSPITAL",
          },
        });

        if (!existingSubscription) {
          await prisma.subscription.create({
            data: {
              hospitalId: hospital.id,
              subscriberType: "HOSPITAL",
              plan: SubscriptionPlan.FREE,
              status: SubscriptionStatus.ACTIVE,
              amount: 0,
              startDate: periodStart,
              endDate: periodEnd,
            },
          });
        }
      }
    }

    await sendApprovingEmail(
      user.name,
      user.email,
      user.role,
      user.hospital?.name ?? "Hopital"
    );

    revalidatePath("/dashboard/superadmin/overview");
    revalidatePath("/dashboard/superadmin/verifications/all");
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
    let result: unknown;

    switch (dataType) {
      case "stats":
        result = await getDashboardStats(timeRange);
        break;
      case "approvals":
        result = await getPendingApprovals();
        break;
      case "subscriptions":
        result = await getSubscriptionStats();
        break;
      default:
        throw new Error("Invalid data type");
    }

    revalidatePath("/dashboard/superadmin/overview");
    return result;
  } catch (error) {
    console.error(`Error refreshing ${dataType} data:`, error);
    throw new Error(`Failed to refresh ${dataType} data`);
  }
}
