"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type {
  Prisma,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";

import type { Session } from "next-auth";

function assertSuper(session: Session | null) {
  if (!session || session.user?.role !== "SUPER_ADMIN")
    throw new Error("Unauthorized");
}

export type SubscriptionFilters = {
  q?: string; // search doctor/hospital/user/hospital email
  plan?: SubscriptionPlan | "ALL";
  status?: SubscriptionStatus | "ALL";
  type?: "ALL" | "DOCTOR" | "HOSPITAL";
  expiringInDays?: number | null; // e.g. 30
};

export async function fetchSubscriptions(filters: SubscriptionFilters) {
  const session = await getServerSession(authOptions);
  assertSuper(session);

  const where: Prisma.SubscriptionWhereInput = {};

  if (filters?.plan && filters.plan !== "ALL") where.plan = filters.plan;
  if (filters?.status && filters.status !== "ALL")
    where.status = filters.status;
  if (filters?.type && filters.type !== "ALL") {
    if (filters.type === "DOCTOR") {
      where.doctorId = { not: null };
    } else {
      where.hospitalId = { not: null };
    }
  }
  if (filters?.expiringInDays && filters.expiringInDays > 0) {
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + filters.expiringInDays);
    where.endDate = { lte: end, gte: now };
  }

  // free-text search across names/emails
  if (filters?.q && filters.q.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { doctor: { user: { name: { contains: q, mode: "insensitive" } } } },
      { doctor: { user: { email: { contains: q, mode: "insensitive" } } } },
      { hospital: { name: { contains: q, mode: "insensitive" } } },
      { hospital: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [items, plans, counts] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: {
        doctor: { include: { user: true } },
        hospital: true,
      },
      orderBy: [{ endDate: "asc" }],
    }),
    prisma.planConfig.findMany({
      include: { limits: true },
      orderBy: { code: "asc" },
    }),
    prisma.subscription.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  // Aggregate MRR from active subs using plan price at their interval
  let mrr = 0;
  const planMap = new Map(plans.map((p) => [p.code, p]));
  for (const s of items) {
    const cfg = planMap.get(s.plan);
    if (!cfg) continue;
    if (s.status !== "ACTIVE") continue;
    const price = Number(cfg.price);
    const monthly = cfg.interval === "YEAR" ? price / 12 : price;
    mrr += monthly;
  }

  return {
    plans,
    items,
    mrr: Number(mrr.toFixed(2)),
    counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])),
  };
}

export async function updateSubscription(input: {
  id: string;
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  startDate?: string; // ISO
  endDate?: string; // ISO
  amount?: number | null;
  currency?: string;
  autoRenew?: boolean;
}) {
  const session = await getServerSession(authOptions);
  assertSuper(session);

  const data: Prisma.SubscriptionUpdateInput = {};
  if (input.plan) data.plan = input.plan;
  if (input.status) data.status = input.status;
  if (input.currency) data.currency = input.currency;
  if (typeof input.autoRenew === "boolean") data.autoRenew = input.autoRenew;
  if (typeof input.amount !== "undefined") {
    if (input.amount !== null) {
      data.amount = Number(input.amount).toFixed(2);
    }
  }
  if (input.startDate) data.startDate = new Date(input.startDate);
  if (input.endDate) data.endDate = new Date(input.endDate);

  await prisma.subscription.update({
    where: { id: input.id },
    data,
  });

  revalidatePath("/dashboard/superadmin/subscriptions");
  return { success: true };
}

export async function applyPlanPriceToSub(id: string) {
  const session = await getServerSession(authOptions);
  assertSuper(session);

  const s = await prisma.subscription.findUnique({ where: { id: id } });
  if (!s) throw new Error("Subscription not found");

  const cfg = await prisma.planConfig.findUnique({ where: { code: s.plan } });
  if (!cfg) throw new Error("Plan config missing");

  await prisma.subscription.update({
    where: { id },
    data: { amount: cfg.price, currency: cfg.currency },
  });

  revalidatePath("/dashboard/superadmin/subscriptions");
  return { success: true };
}

export async function applyPlanPriceBulk(plan: SubscriptionPlan) {
  const session = await getServerSession(authOptions);
  assertSuper(session);

  const cfg = await prisma.planConfig.findUnique({ where: { code: plan } });
  if (!cfg) throw new Error("Plan config missing");

  const { count } = await prisma.subscription.updateMany({
    where: { plan },
    data: { amount: cfg.price, currency: cfg.currency },
  });

  revalidatePath("/dashboard/superadmin/subscriptions");
  return { success: true, updated: count };
}
