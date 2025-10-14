import prisma from "@/lib/prisma";
import {
  BillingInterval,
  PlanConfig,
  PlanLimits,
  SubscriberType,
  SubscriptionPlan,
} from "@prisma/client";

export async function getUnitPriceXOF(opts: {
  plan: SubscriptionPlan;
  subscriberType: SubscriberType;
  interval?: BillingInterval; // default MONTH
}) {
  const interval = opts.interval ?? "MONTH";
  // Try PlanPrice first (authoritative per subscriber)
  const pp = await prisma.planPrice.findFirst({
    where: {
      isActive: true,
      subscriberType: opts.subscriberType,
      interval,
      plan: { code: opts.plan },
    },
    orderBy: { updatedAt: "desc" },
  });
  if (pp) {
    return {
      amount: Number(pp.amount),
      currency: (pp.currency || "XOF").toUpperCase(),
    };
  }
  // Fallback: PlanConfig
  const cfg = await prisma.planConfig.findUnique({
    where: { code: opts.plan },
  });
  return {
    amount: Number(cfg?.price ?? 0),
    currency: (cfg?.currency || "XOF").toUpperCase(),
  };
}

export async function getActivePlansWithLimits() {
  // for UI cards
  const plans = await prisma.planConfig.findMany({
    where: { isActive: true },
    include: { limits: true },
    orderBy: { price: "desc" },
  });
  return plans as (PlanConfig & { limits: PlanLimits | null })[];
}
