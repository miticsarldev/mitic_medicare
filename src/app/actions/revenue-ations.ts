/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type {
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriberType,
} from "@prisma/client";

function assertSuper(session: Session | null) {
  if (!session || session.user?.role !== "SUPER_ADMIN")
    throw new Error("Unauthorized");
}

export type RevenueFilters = {
  dateFrom: string; // yyyy-mm-dd (inclusive)
  dateTo: string; // yyyy-mm-dd (inclusive)
  plan: SubscriptionPlan | "ALL";
  status: SubscriptionStatus | "ALL";
  type: SubscriberType | "ALL";
};

export type RevenueSeriesPoint = {
  date: string;
  amount: number;
  currency: string;
};

export type RevenueStats = {
  filters: RevenueFilters;
  // Payments (actual cash)
  totalPayments: { amount: number; currency: string }[]; // per currency
  paymentsSeries: RevenueSeriesPoint[]; // daily sum (mixed currencies => one entry per currency per day)

  // Subscription-based metrics (estimates)
  activeSubs: number;
  newSubs: number; // started inside window
  churnedSubs: number; // expired inside window
  mrrRunRate: { amount: number; currency: string }[]; // based on current plan price * active subscribers (normalized to monthly)
  arrRunRate: { amount: number; currency: string }[];

  byPlan: Array<{
    plan: SubscriptionPlan;
    subscribers: number;
    payments: { amount: number; currency: string }[];
  }>;
};

function toDayStart(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDayEnd(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getRevenueStats(
  filters: RevenueFilters
): Promise<RevenueStats> {
  const session = await getServerSession(authOptions);
  assertSuper(session);

  const from = toDayStart(new Date(filters.dateFrom));
  const to = toDayEnd(new Date(filters.dateTo));

  // ---- WHERE helpers
  const subWhere: any = {
    startDate: { lte: to },
    endDate: { gte: from }, // any overlap in range
  };
  if (filters.plan !== "ALL") subWhere.plan = filters.plan;
  if (filters.status !== "ALL") subWhere.status = filters.status;
  if (filters.type !== "ALL") subWhere.subscriberType = filters.type;

  const payWhere: any = {
    paymentDate: { gte: from, lte: to },
  };

  // Join through subscription for filters
  if (
    filters.plan !== "ALL" ||
    filters.status !== "ALL" ||
    filters.type !== "ALL"
  ) {
    payWhere.subscription = {} as any;
    if (filters.plan !== "ALL")
      (payWhere.subscription as any).plan = filters.plan;
    if (filters.status !== "ALL")
      (payWhere.subscription as any).status = filters.status;
    if (filters.type !== "ALL")
      (payWhere.subscription as any).subscriberType = filters.type;
  }

  // ----- Actual payments in range
  const payments = await prisma.subscriptionPayment.findMany({
    where: payWhere,
    select: { amount: true, currency: true, paymentDate: true },
    orderBy: { paymentDate: "asc" },
  });

  // Sum by currency
  const totalByCurrency = new Map<string, number>();
  const series: RevenueSeriesPoint[] = [];
  const dayCurrencyMap = new Map<string, number>(); // key: yyyy-mm-dd::CUR

  for (const p of payments) {
    const cur = (p.currency || "XOF").toUpperCase();
    const amt = Number(p.amount);
    totalByCurrency.set(cur, (totalByCurrency.get(cur) || 0) + amt);

    const keyDate = new Date(p.paymentDate).toISOString().slice(0, 10);
    const key = `${keyDate}::${cur}`;
    dayCurrencyMap.set(key, (dayCurrencyMap.get(key) || 0) + amt);
  }

  for (const [key, amount] of Array.from(dayCurrencyMap.entries())) {
    const [date, currency] = key.split("::");
    series.push({ date, amount: Number(amount.toFixed(2)), currency });
  }

  // ----- Subscriptions
  // Active inside the window (overlap rule) and status ACTIVE/TRIAL unless status filter says otherwise
  const activeStatus: SubscriptionStatus[] = ["ACTIVE", "TRIAL"];
  const activeWhere = { ...subWhere } as any;
  if (filters.status === "ALL") activeWhere.status = { in: activeStatus };

  const [subs, actives, newInWindow, expiredInWindow, planCfgs] =
    await Promise.all([
      prisma.subscription.findMany({
        where: subWhere,
        select: { plan: true, status: true },
      }),
      prisma.subscription.count({ where: activeWhere }),
      prisma.subscription.count({
        where: { ...subWhere, startDate: { gte: from, lte: to } },
      }),
      prisma.subscription.count({
        where: {
          ...subWhere,
          status: "EXPIRED",
          endDate: { gte: from, lte: to },
        },
      }),
      prisma.planConfig.findMany({ include: { limits: true } }),
    ]);

  const byPlanMap = new Map<
    SubscriptionPlan,
    { subscribers: number; payments: Map<string, number> }
  >();
  for (const s of subs) {
    const entry = byPlanMap.get(s.plan) || {
      subscribers: 0,
      payments: new Map(),
    };
    entry.subscribers += 1;
    byPlanMap.set(s.plan, entry);
  }

  // Compute MRR/ARR run-rate: active subs * plan monthly unit
  const mrrByCurrency = new Map<string, number>();
  const currencyByPlan = new Map<SubscriptionPlan, string>();
  const priceByPlanMonthly = new Map<SubscriptionPlan, number>();

  for (const cfg of planCfgs) {
    const monthly =
      cfg.interval === "YEAR" ? Number(cfg.price) / 12 : Number(cfg.price);
    priceByPlanMonthly.set(cfg.code, monthly);
    currencyByPlan.set(
      cfg.code as SubscriptionPlan,
      (cfg.currency || "XOF").toUpperCase()
    );
  }

  // Count active subs by plan
  const activesByPlan = await prisma.subscription.groupBy({
    by: ["plan"],
    where: activeWhere,
    _count: { _all: true },
  });

  for (const row of activesByPlan) {
    const monthly = priceByPlanMonthly.get(row.plan as SubscriptionPlan) || 0;
    const cur = (
      currencyByPlan.get(row.plan as SubscriptionPlan) || "XOF"
    ).toUpperCase();
    const add = monthly * row._count._all;
    mrrByCurrency.set(cur, (mrrByCurrency.get(cur) || 0) + add);
  }

  const arrByCurrency = new Map<string, number>();
  for (const [cur, mrr] of Array.from(mrrByCurrency.entries())) {
    arrByCurrency.set(cur, mrr * 12);
  }

  // Convert maps to arrays
  const totalPayments = Array.from(totalByCurrency.entries()).map(
    ([currency, amount]) => ({ currency, amount: Number(amount.toFixed(2)) })
  );
  const mrrRunRate = Array.from(mrrByCurrency.entries()).map(
    ([currency, amount]) => ({ currency, amount: Number(amount.toFixed(2)) })
  );
  const arrRunRate = Array.from(arrByCurrency.entries()).map(
    ([currency, amount]) => ({ currency, amount: Number(amount.toFixed(2)) })
  );

  return {
    filters,
    totalPayments,
    paymentsSeries: series.sort((a, b) => a.date.localeCompare(b.date)),
    activeSubs: actives,
    newSubs: newInWindow,
    churnedSubs: expiredInWindow,
    mrrRunRate,
    arrRunRate,
    byPlan: Array.from(byPlanMap.entries()).map(([plan, data]) => ({
      plan,
      subscribers: data.subscribers,
      payments: [], // optional per-plan payments; see note above
    })),
  };
}
