import {
  PrismaClient,
  SubscriberType,
  BillingInterval,
  SubscriptionPlan,
} from "@prisma/client";
const prisma = new PrismaClient();

// DTO que l’on renvoie au composant client
export type PlanDTO = {
  code: SubscriptionPlan; // "FREE" | "STANDARD" | "PREMIUM"
  name: string;
  description: string | null;
  limits: {
    maxAppointments: number | null;
    maxPatients: number | null;
    maxDoctorsPerHospital: number | null;
    storageGb: number | null;
  } | null;
  prices: Array<{
    subscriberType: SubscriberType; // "DOCTOR" | "HOSPITAL"
    interval: BillingInterval; // "MONTH" | "YEAR"
    currency: string; // ex: "XOF"
    amount: string; // string pour conserver le Decimal
    isActive: boolean;
  }>;
};

export async function fetchPricing(): Promise<PlanDTO[]> {
  const rows = await prisma.planConfig.findMany({
    where: {
      isActive: true,
      code: { in: ["FREE", "STANDARD", "PREMIUM"] },
    },
    include: {
      limits: true,
      prices: {
        where: { isActive: true },
        orderBy: [{ subscriberType: "asc" }, { interval: "asc" }],
      },
    },
    orderBy: [{ code: "asc" }],
  });

  return rows.map((p) => ({
    code: p.code,
    name: p.name,
    description: p.description,
    limits: p.limits
      ? {
          maxAppointments: p.limits.maxAppointments,
          maxPatients: p.limits.maxPatients,
          maxDoctorsPerHospital: p.limits.maxDoctorsPerHospital,
          storageGb: p.limits.storageGb,
        }
      : null,
    prices: p.prices.map((pr) => ({
      subscriberType: pr.subscriberType,
      interval: pr.interval,
      currency: pr.currency,
      amount: pr.amount.toString(), // garder la précision Decimal
      isActive: pr.isActive,
    })),
  }));
}
