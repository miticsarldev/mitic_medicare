import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Prisma,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriberType,
} from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const q = sp.get("search") ?? "";
  const page = parseInt(sp.get("page") ?? "1");
  const limit = parseInt(sp.get("limit") ?? "10");
  const plan = sp.get("plan") as SubscriptionPlan | null;
  const status = sp.get("status") as SubscriptionStatus | null;
  const type = sp.get("type") as SubscriberType | null;
  const from = sp.get("from");
  const to = sp.get("to");

  const where: Prisma.SubscriptionWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { hospital: { name: { contains: q, mode: "insensitive" } } },
              {
                doctor: {
                  user: { name: { contains: q, mode: "insensitive" } },
                },
              },
            ],
          }
        : {},
      plan ? { plan } : {},
      status ? { status } : {},
      type ? { subscriberType: type } : {},
      from || to
        ? {
            startDate: {
              gte: from ? startOfDay(new Date(from)) : undefined,
            },
            endDate: {
              lte: to ? endOfDay(new Date(to)) : undefined,
            },
          }
        : {},
    ],
  };

  const total = await prisma.subscription.count({ where });
  const data = await prisma.subscription.findMany({
    where,
    include: {
      hospital: { select: { id: true, name: true, city: true } },
      doctor: {
        select: {
          id: true,
          specialization: true,
          isIndependent: true,
          user: { select: { name: true } },
          hospital: { select: { id: true, name: true } },
        },
      },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({
    subscriptions: data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    // body: { subscriberType, doctorId?, hospitalId?, plan, status, startDate, endDate, amount, currency, autoRenew }
    const created = await prisma.subscription.create({
      data: {
        subscriberType: body.subscriberType,
        doctorId: body.subscriberType === "DOCTOR" ? body.doctorId : null,
        hospitalId: body.subscriberType === "HOSPITAL" ? body.hospitalId : null,
        plan: body.plan,
        status: body.status,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        amount: new Prisma.Decimal(body.amount ?? 0),
        currency: body.currency ?? "USD",
        autoRenew: body.autoRenew ?? true,
      },
    });
    return NextResponse.json({ success: true, id: created.id });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // handle unique constraint nicely
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "This subscriber already has a subscription." },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
