"use server";

import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BillingInterval, SubscriptionPlan } from "@prisma/client";
import { revalidatePath } from "next/cache";

// --------- utils
function assertSuper(session: Session | null) {
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
}

const ALL_PLANS: SubscriptionPlan[] = ["FREE", "STANDARD", "PREMIUM"];

/** Make sure we always have 3 plan rows (FREE, STANDARD, PREMIUM).
 *  This never overwrites existing data; it only creates missing rows with safe defaults.
 */
async function ensurePlanConfigs() {
  const existing = await prisma.planConfig.findMany({ select: { code: true } });
  const have = new Set(existing.map((e) => e.code));
  const missing = ALL_PLANS.filter((p) => !have.has(p));
  if (missing.length === 0) return;

  await prisma.$transaction(
    missing.map((code) =>
      prisma.planConfig.create({
        data: {
          code,
          name:
            code === "FREE"
              ? "Gratuit"
              : code === "STANDARD"
                ? "Standard"
                : "Premium",
          description:
            code === "FREE"
              ? "Essentiel pour démarrer"
              : code === "STANDARD"
                ? "Pour grandir sereinement"
                : "Pour les équipes exigeantes",
          price:
            code === "FREE" ? "0.00" : code === "STANDARD" ? "29.00" : "99.00",
          currency: "USD",
          interval: "MONTH",
          isActive: true,
          limits: {
            create:
              code === "FREE"
                ? {
                    maxAppointments: 200,
                    maxPatients: 1000,
                    maxDoctorsPerHospital: 3,
                    storageGb: 5,
                  }
                : code === "STANDARD"
                  ? {
                      maxAppointments: 2000,
                      maxPatients: 10000,
                      maxDoctorsPerHospital: 20,
                      storageGb: 100,
                    }
                  : {
                      // PREMIUM — many “unlimited” (null)
                      maxAppointments: null,
                      maxPatients: null,
                      maxDoctorsPerHospital: null,
                      storageGb: 500,
                    },
          },
        },
      })
    )
  );
}

// --------- queries & mutations
export async function getAllPlansWithStats() {
  const session = await getServerSession(authOptions);
  assertSuper(session);

  await ensurePlanConfigs();

  const configs = await prisma.planConfig.findMany({
    include: { limits: true },
    orderBy: { code: "asc" },
  });

  const subs = await prisma.subscription.groupBy({
    by: ["plan"],
    _count: { _all: true },
  });

  const [docCounts, hospCounts] = await Promise.all([
    prisma.subscription.groupBy({
      by: ["plan"],
      where: { doctorId: { not: null } },
      _count: { _all: true },
    }),
    prisma.subscription.groupBy({
      by: ["plan"],
      where: { hospitalId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const docMap = Object.fromEntries(
    docCounts.map((d) => [d.plan, d._count._all])
  );
  const hospMap = Object.fromEntries(
    hospCounts.map((h) => [h.plan, h._count._all])
  );

  const usage = configs.map((cfg) => {
    // Prisma.Decimal -> number
    const priceNum = Number(cfg.price);
    const subscribers = subs.find((r) => r.plan === cfg.code)?._count._all ?? 0;
    const monthlyUnit = cfg.interval === "MONTH" ? priceNum : priceNum / 12;
    const mrr = Number((subscribers * monthlyUnit).toFixed(2));

    return {
      code: cfg.code,
      cfg,
      subscribers,
      doctors: docMap[cfg.code] ?? 0,
      hospitals: hospMap[cfg.code] ?? 0,
      mrr,
    };
  });

  return usage;
}

export async function savePlanConfig(input: {
  code: SubscriptionPlan;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  isActive: boolean;
  limits: {
    maxAppointments?: number | null;
    maxPatients?: number | null;
    maxDoctorsPerHospital?: number | null;
    storageGb?: number | null;
  };
}) {
  const session = await getServerSession(authOptions);
  assertSuper(session);

  const priceStr = Number(input.price ?? 0).toFixed(2);

  await prisma.planConfig.upsert({
    where: { code: input.code },
    create: {
      code: input.code,
      name: input.name,
      description: input.description,
      price: priceStr, // Prisma accepts string for Decimal
      currency: input.currency,
      interval: input.interval,
      isActive: input.isActive,
      limits: {
        create: {
          maxAppointments: input.limits.maxAppointments ?? null,
          maxPatients: input.limits.maxPatients ?? null,
          maxDoctorsPerHospital: input.limits.maxDoctorsPerHospital ?? null,
          storageGb: input.limits.storageGb ?? null,
        },
      },
    },
    update: {
      name: input.name,
      description: input.description,
      price: priceStr,
      currency: input.currency,
      interval: input.interval,
      isActive: input.isActive,
      limits: {
        upsert: {
          create: {
            maxAppointments: input.limits.maxAppointments ?? null,
            maxPatients: input.limits.maxPatients ?? null,
            maxDoctorsPerHospital: input.limits.maxDoctorsPerHospital ?? null,
            storageGb: input.limits.storageGb ?? null,
          },
          update: {
            maxAppointments: input.limits.maxAppointments ?? null,
            maxPatients: input.limits.maxPatients ?? null,
            maxDoctorsPerHospital: input.limits.maxDoctorsPerHospital ?? null,
            storageGb: input.limits.storageGb ?? null,
          },
        },
      },
    },
  });

  revalidatePath("/dashboard/superadmin/plans");
  return { success: true };
}
