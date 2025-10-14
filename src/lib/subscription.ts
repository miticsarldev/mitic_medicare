// lib/subscription.ts
import { differenceInCalendarDays, differenceInCalendarMonths } from "date-fns";
import prisma from "@/lib/prisma";
import {
  BillingInterval,
  SubscriberType,
  Subscription,
  SubscriptionPlan,
} from "@prisma/client";

// Normalize a DB status with date boundaries into an *effective* status.
export function computeEffectiveStatus(sub?: Subscription | null) {
  if (!sub) return "INACTIVE" as const;
  const now = new Date();

  if (sub.status === "TRIAL") {
    return sub.endDate < now ? "EXPIRED" : "TRIAL";
  }

  if (sub.status === "ACTIVE") {
    if (sub.startDate > now) return "PENDING";
    if (sub.endDate < now) return "EXPIRED";
    return "ACTIVE";
  }

  if (sub.status === "PENDING") return "PENDING";
  if (sub.status === "EXPIRED") return "EXPIRED";
  return "INACTIVE";
}

// Try to infer the billing interval from the actual window.
// 1 month → MONTH, 12 months → YEAR; else fallback to PlanPrice/PlanConfig.
export async function inferInterval(
  sub: Subscription | null,
  subscriberType: SubscriberType
): Promise<"monthly" | "yearly" | "—"> {
  if (!sub) return "—";

  // 1) Try to infer by date span
  const months = Math.max(
    1,
    differenceInCalendarMonths(sub.endDate, sub.startDate)
  );
  if (months >= 11 && months <= 13) return "yearly";
  if (months >= 1 && months <= 2) return "monthly";

  // 2) Fallback to plan-level price settings
  const cfg = await prisma.planConfig.findUnique({
    where: { code: sub.plan as SubscriptionPlan },
    include: { prices: true },
  });
  if (!cfg) return "—";
  const candidates = (cfg.prices ?? []).filter(
    (p) => p.subscriberType === subscriberType && p.isActive
  );
  const pick =
    candidates.find((c) => c.interval === "MONTH") ??
    candidates.find((c) => c.interval === "YEAR") ??
    null;
  if (!pick) return "—";
  return pick.interval === BillingInterval.MONTH ? "monthly" : "yearly";
}

// Days left / overdue and a small grace window (optional)
export function computeTimeMeta(
  endDate?: Date | null,
  graceDays = 0 // set to 0 if you want hard blocking immediately
) {
  if (!endDate)
    return {
      daysRemaining: null as number | null,
      daysOverdue: null as number | null,
      inGrace: false,
    };

  const now = new Date();
  const daysRemaining = differenceInCalendarDays(endDate, now);
  const daysOverdue = differenceInCalendarDays(now, endDate);
  const inGrace = daysOverdue > 0 && daysOverdue <= graceDays;
  return {
    daysRemaining: daysRemaining >= 0 ? daysRemaining : 0,
    daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
    inGrace,
  };
}
