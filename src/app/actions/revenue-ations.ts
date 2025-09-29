/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type {
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriberType,
  PaymentMethod,
  PaymentStatus,
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
  date: string; // yyyy-mm-dd
  amount: number; // net = completed - refunded (same day & currency)
  currency: string;
};

export type CurrencyAmount = { amount: number; currency: string };

export type MethodBreakdown = {
  method: PaymentMethod;
  count: number; // all statuses in range
  completedCount: number;
  amountByCurrency: CurrencyAmount[]; // completed only
};

export type TopPayer = {
  id: string;
  name: string;
  subscriberType: SubscriberType;
  paymentsCount: number; // completed count
  amountByCurrency: CurrencyAmount[]; // completed only
};

export type PaymentCounters = {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  refunded: number;
};

export type RevenueStats = {
  filters: RevenueFilters;

  // Cash KPIs
  netCollected: CurrencyAmount[]; // completed - refunded
  totalCompleted: CurrencyAmount[]; // completed only
  totalRefunded: CurrencyAmount[]; // refunded only (positive values)
  averageTicket: CurrencyAmount[]; // completed only
  paymentCounters: PaymentCounters; // counts (all statuses)

  // Time series (net)
  paymentsSeries: RevenueSeriesPoint[];

  // Subscription dynamics (same as before)
  activeSubs: number;
  newSubs: number;
  churnedSubs: number;

  // Breakdown
  byPlan: Array<{ plan: SubscriptionPlan; subscribers: number }>;
  methodBreakdown: MethodBreakdown[];
  topPayers: TopPayer[]; // Top 5 by total completed amount (all currencies kept separate)
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

  // ---- WHERE helpers for subscriptions (window overlap)
  const subWhere: any = { startDate: { lte: to }, endDate: { gte: from } };
  if (filters.plan !== "ALL") subWhere.plan = filters.plan;
  if (filters.status !== "ALL") subWhere.status = filters.status;
  if (filters.type !== "ALL") subWhere.subscriberType = filters.type;

  // ---- WHERE helpers for payments (in window, optional join filters)
  const payWhere: any = { paymentDate: { gte: from, lte: to } };
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

  // ----- Pull payments (with who for top payers)
  const payments = await prisma.subscriptionPayment.findMany({
    where: payWhere,
    select: {
      id: true,
      amount: true,
      currency: true,
      paymentDate: true,
      status: true,
      paymentMethod: true,
      subscription: {
        select: {
          id: true,
          subscriberType: true,
          doctor: { select: { id: true, user: { select: { name: true } } } },
          hospital: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { paymentDate: "asc" },
  });

  // ----- Aggregate helpers
  const curSum = () => new Map<string, number>(); // currency -> sum
  const add = (map: Map<string, number>, currency: string, amt: number) =>
    map.set(currency, (map.get(currency) || 0) + amt);

  const totalCompleted = curSum();
  const totalRefunded = curSum(); // positive amounts for refunded rows
  const netCollected = curSum(); // completed - refunded

  const methodMap = new Map<
    PaymentMethod,
    { count: number; completedCount: number; byCur: Map<string, number> }
  >();

  const counters: PaymentCounters = {
    total: payments.length,
    completed: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
  };

  // For series (net per day+currency)
  const dayCurNet = new Map<string, number>(); // `${yyyy-mm-dd}::CUR` -> net amount

  // For average ticket (completed only)
  const completedCountByCur = new Map<string, number>();

  // For top payers (completed only)
  type PayerKey = string; // `doctor:<id>` | `hospital:<id>`
  const payerAgg = new Map<
    PayerKey,
    {
      name: string;
      type: SubscriberType;
      count: number; // completed
      byCur: Map<string, number>;
    }
  >();

  for (const p of payments) {
    const cur = (p.currency || "XOF").toUpperCase();
    const amt = Number(p.amount);
    const day = new Date(p.paymentDate).toISOString().slice(0, 10);

    // method bucket
    if (!methodMap.has(p.paymentMethod)) {
      methodMap.set(p.paymentMethod, {
        count: 0,
        completedCount: 0,
        byCur: new Map(),
      });
    }
    const m = methodMap.get(p.paymentMethod)!;
    m.count += 1;

    // status counters + aggregates
    switch (p.status as PaymentStatus) {
      case "COMPLETED": {
        counters.completed += 1;
        add(totalCompleted, cur, amt);
        add(netCollected, cur, amt);
        add(m.byCur, cur, amt);
        add(completedCountByCur, cur, 1);

        const key: PayerKey =
          p.subscription?.subscriberType === "DOCTOR"
            ? `doctor:${p.subscription?.doctor?.id ?? "?"}`
            : `hospital:${p.subscription?.hospital?.id ?? "?"}`;

        const name =
          p.subscription?.subscriberType === "DOCTOR"
            ? (p.subscription?.doctor?.user?.name ?? "Médecin")
            : (p.subscription?.hospital?.name ?? "Hôpital");

        if (!payerAgg.has(key)) {
          payerAgg.set(key, {
            name,
            type: p.subscription?.subscriberType || "DOCTOR",
            count: 0,
            byCur: new Map(),
          });
        }
        const agg = payerAgg.get(key)!;
        agg.count += 1;
        add(agg.byCur, cur, amt);

        // series net + (completed)
        const k = `${day}::${cur}`;
        dayCurNet.set(k, (dayCurNet.get(k) || 0) + amt);
        m.completedCount += 1;
        break;
      }
      case "REFUNDED": {
        counters.refunded += 1;
        add(totalRefunded, cur, amt);
        add(netCollected, cur, -amt); // subtract refunds from net

        // series net - (refunded)
        const k = `${day}::${cur}`;
        dayCurNet.set(k, (dayCurNet.get(k) || 0) - amt);
        break;
      }
      case "PENDING":
        counters.pending += 1;
        break;
      case "FAILED":
        counters.failed += 1;
        break;
      default:
        break;
    }
  }

  // Build arrays
  const toArr = (map: Map<string, number>): CurrencyAmount[] =>
    Array.from(map.entries()).map(([currency, amount]) => ({
      currency,
      amount: Number(amount.toFixed(2)),
    }));

  const paymentsSeries: RevenueSeriesPoint[] = Array.from(dayCurNet.entries())
    .map(([k, amount]) => {
      const [date, currency] = k.split("::");
      return { date, currency, amount: Number(amount.toFixed(2)) };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  // Average ticket (completed only) per currency
  const averageTicket: CurrencyAmount[] = Array.from(
    totalCompleted.entries()
  ).map(([currency, amount]) => {
    const c = completedCountByCur.get(currency) || 0;
    const avg = c > 0 ? amount / c : 0;
    return { currency, amount: Number(avg.toFixed(2)) };
  });

  // Method breakdown
  const methodBreakdown: MethodBreakdown[] = Array.from(methodMap.entries())
    .map(([method, v]) => ({
      method,
      count: v.count,
      completedCount: v.completedCount,
      amountByCurrency: toArr(v.byCur),
    }))
    .sort((a, b) => b.completedCount - a.completedCount);

  // Top payers (completed only) — top 5 by total across currencies
  const topPayers: TopPayer[] = Array.from(payerAgg.entries())
    .map(([key, v]) => {
      const total = Array.from(v.byCur.values()).reduce((s, n) => s + n, 0);
      return {
        id: key,
        name: v.name,
        subscriberType: v.type,
        paymentsCount: v.count,
        amountByCurrency: toArr(v.byCur),
        // include _total internally for sorting
        _total: total,
      } as any;
    })
    .sort((a: any, b: any) => b._total - a._total)
    .slice(0, 5)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ _total, ...rest }: any) => rest);

  // ----- Subscriptions (keep your existing logic)
  const activeStatus: SubscriptionStatus[] = ["ACTIVE", "TRIAL"];
  const activeWhere = { ...subWhere } as any;
  if (filters.status === "ALL") activeWhere.status = { in: activeStatus };

  const [subs, actives, newInWindow, expiredInWindow] = await Promise.all([
    prisma.subscription.findMany({
      where: subWhere,
      select: { plan: true },
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
  ]);

  const byPlanCount = new Map<SubscriptionPlan, number>();
  for (const s of subs) {
    byPlanCount.set(s.plan, (byPlanCount.get(s.plan) || 0) + 1);
  }

  return {
    filters,
    netCollected: toArr(netCollected),
    totalCompleted: toArr(totalCompleted),
    totalRefunded: toArr(totalRefunded),
    averageTicket,
    paymentCounters: counters,
    paymentsSeries,
    activeSubs: actives,
    newSubs: newInWindow,
    churnedSubs: expiredInWindow,
    byPlan: Array.from(byPlanCount.entries()).map(([plan, subscribers]) => ({
      plan,
      subscribers,
    })),
    methodBreakdown,
    topPayers,
  };
}
