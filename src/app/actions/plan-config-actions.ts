"use server";

import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma, SubscriberType, SubscriptionPlan } from "@prisma/client";

// --------- utils
function assertSuper(session: Session | null) {
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
}

const ALL_PLANS: SubscriptionPlan[] = ["FREE", "STANDARD", "PREMIUM"];

// sensible XOF demo defaults
const DEFAULT_PRICES: Record<
  SubscriptionPlan,
  { DOCTOR: number; HOSPITAL: number }
> = {
  FREE: { DOCTOR: 0, HOSPITAL: 0 },
  STANDARD: { DOCTOR: 50_000, HOSPITAL: 250_000 },
  PREMIUM: { DOCTOR: 100_000, HOSPITAL: 500_000 },
};

/** Ensure there is a PlanConfig row for each code (does not overwrite existing). */
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
          // legacy fields kept (not authoritative anymore)
          price: new Prisma.Decimal(0),
          currency: "XOF",
          interval: "MONTH",
          isActive: true,
          limits: {
            create:
              code === "FREE"
                ? {
                    maxAppointments: 20,
                    maxPatients: 50,
                    maxDoctorsPerHospital: 3,
                    storageGb: 1,
                  }
                : code === "STANDARD"
                  ? {
                      maxAppointments: 300,
                      maxPatients: 1000,
                      maxDoctorsPerHospital: 10,
                      storageGb: 10,
                    }
                  : {
                      maxAppointments: 2000,
                      maxPatients: 5000,
                      maxDoctorsPerHospital: 50,
                      storageGb: 50,
                    },
          },
        },
      })
    )
  );
}

/** Ensure per-type monthly PlanPrice exists for each plan (DOCTOR/HOSPITAL). */
async function ensurePlanPrices() {
  const configs = await prisma.planConfig.findMany({
    select: { id: true, code: true },
  });

  await prisma.$transaction(
    configs.flatMap((cfg) => {
      const d = DEFAULT_PRICES[cfg.code as SubscriptionPlan];
      return (["DOCTOR", "HOSPITAL"] as const).map((subType) =>
        prisma.planPrice.upsert({
          where: {
            planConfigId_subscriberType_interval_currency: {
              planConfigId: cfg.id,
              subscriberType: subType,
              interval: "MONTH",
              currency: "XOF",
            },
          },
          create: {
            planConfigId: cfg.id,
            subscriberType: subType,
            interval: "MONTH",
            currency: "XOF",
            amount: new Prisma.Decimal(d[subType]),
            isActive: true,
          },
          update: {}, // don't overwrite if already present
        })
      );
    })
  );
}

export async function getAllPlansWithStats() {
  const session = await getServerSession(authOptions);
  assertSuper(session);

  await ensurePlanConfigs();
  await ensurePlanPrices();

  const configs = await prisma.planConfig.findMany({
    include: { limits: true, prices: true },
    orderBy: { code: "asc" },
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
    const doctors = docMap[cfg.code] ?? 0;
    const hospitals = hospMap[cfg.code] ?? 0;
    const subscribers = doctors + hospitals;

    const docPrice = Number(
      cfg.prices.find(
        (p) =>
          p.subscriberType === "DOCTOR" && p.interval === "MONTH" && p.isActive
      )?.amount ?? 0
    );
    const hospPrice = Number(
      cfg.prices.find(
        (p) =>
          p.subscriberType === "HOSPITAL" &&
          p.interval === "MONTH" &&
          p.isActive
      )?.amount ?? 0
    );

    const mrr = doctors * docPrice + hospitals * hospPrice;

    return {
      code: cfg.code,
      cfg, // includes limits + prices
      subscribers,
      doctors,
      hospitals,
      mrr,
    };
  });

  return usage;
}

export async function savePlanConfig(input: {
  code: SubscriptionPlan;
  name: string;
  description?: string;
  isActive: boolean;
  limits: {
    maxAppointments: number | null;
    maxPatients: number | null;
    maxDoctorsPerHospital: number | null;
    storageGb: number | null;
  };
  priceDoctorMonth: number;
  priceHospitalMonth: number;
  currency?: string; // default XOF
}) {
  const session = await getServerSession(authOptions);
  assertSuper(session);

  const plan = await prisma.planConfig.upsert({
    where: { code: input.code },
    update: {
      name: input.name,
      description: input.description,
      isActive: input.isActive,
      limits: {
        upsert: {
          create: input.limits,
          update: input.limits,
        },
      },
    },
    create: {
      code: input.code,
      name: input.name,
      description: input.description,
      price: new Prisma.Decimal(0), // legacy; not used
      currency: input.currency ?? "XOF",
      interval: "MONTH",
      isActive: input.isActive,
      limits: { create: input.limits },
    },
  });

  const currency = input.currency ?? "XOF";
  const entries = [
    {
      subscriberType: "DOCTOR" as SubscriberType,
      amount: input.priceDoctorMonth,
    },
    {
      subscriberType: "HOSPITAL" as SubscriberType,
      amount: input.priceHospitalMonth,
    },
  ];

  for (const e of entries) {
    await prisma.planPrice.upsert({
      where: {
        planConfigId_subscriberType_interval_currency: {
          planConfigId: plan.id,
          subscriberType: e.subscriberType,
          interval: "MONTH",
          currency,
        },
      },
      create: {
        planConfigId: plan.id,
        subscriberType: e.subscriberType,
        interval: "MONTH",
        currency,
        amount: new Prisma.Decimal(e.amount.toFixed(2)),
        isActive: true,
      },
      update: {
        amount: new Prisma.Decimal(e.amount.toFixed(2)),
        isActive: true,
      },
    });
  }

  return { ok: true };
}
