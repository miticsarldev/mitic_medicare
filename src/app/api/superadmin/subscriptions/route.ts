// export const dynamic = "force-dynamic";
// import { NextRequest, NextResponse } from "next/server";
// import {
//   SubscriptionStatus,
//   SubscriptionPlan,
//   SubscriberType,
// } from "@prisma/client";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";
// import prisma from "@/lib/prisma";

// // GET - Fetch all subscriptions with filtering, sorting, and pagination
// export async function GET(request: NextRequest) {
//   try {
//     // Check authentication and authorization
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "SUPER_ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Parse query parameters
//     const searchParams = request.nextUrl.searchParams;
//     const search = searchParams.get("search") || "";
//     const status = searchParams.get("status") || "all";
//     const subscriberType = searchParams.get("subscriberType") || "all";
//     const plan = searchParams.get("plan") || "all";
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "10");
//     const sortBy = searchParams.get("sortBy") || "startDate";
//     const sortOrder = searchParams.get("sortOrder") || "desc";

//     // Calculate pagination
//     const skip = (page - 1) * limit;

//     // Build filter conditions
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const where: any = {};

//     // Status filter
//     if (status !== "all") {
//       where.status = status as SubscriptionStatus;
//     }

//     // Subscriber type filter
//     if (subscriberType !== "all") {
//       where.subscriberType = subscriberType as SubscriberType;
//     }

//     // Plan filter
//     if (plan !== "all") {
//       where.plan = plan as SubscriptionPlan;
//     }

//     // Search filter (search in doctor or hospital names)
//     if (search) {
//       where.OR = [
//         {
//           doctor: {
//             user: {
//               name: {
//                 contains: search,
//                 mode: "insensitive",
//               },
//             },
//           },
//         },
//         {
//           hospital: {
//             name: {
//               contains: search,
//               mode: "insensitive",
//             },
//           },
//         },
//         {
//           doctor: {
//             user: {
//               email: {
//                 contains: search,
//                 mode: "insensitive",
//               },
//             },
//           },
//         },
//         {
//           hospital: {
//             email: {
//               contains: search,
//               mode: "insensitive",
//             },
//           },
//         },
//         {
//           id: {
//             contains: search,
//             mode: "insensitive",
//           },
//         },
//       ];
//     }

//     // Count total subscriptions for pagination
//     const totalSubscriptions = await prisma.subscription.count({ where });

//     // Build sort object
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const orderBy: any = {};
//     orderBy[sortBy] = sortOrder;

//     // Fetch subscriptions with related data
//     const subscriptions = await prisma.subscription.findMany({
//       where,
//       skip,
//       take: limit,
//       orderBy,
//       include: {
//         doctor: {
//           include: {
//             user: {
//               include: {
//                 profile: true,
//               },
//             },
//           },
//         },
//         hospital: true,
//         payments: {
//           orderBy: {
//             paymentDate: "desc",
//           },
//           take: 5, // Limit to the 5 most recent payments
//         },
//       },
//     });

//     // Calculate total pages
//     const totalPages = Math.ceil(totalSubscriptions / limit);

//     return NextResponse.json({
//       subscriptions,
//       pagination: {
//         total: totalSubscriptions,
//         totalPages,
//         currentPage: page,
//         limit,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching subscriptions:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch subscriptions" },
//       { status: 500 }
//     );
//   }
// }

// // POST - Create a new subscription
// export async function POST(request: NextRequest) {
//   try {
//     // Check authentication and authorization
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "SUPER_ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Parse request body
//     const body = await request.json();

//     // Validate required fields
//     if (!body.subscriberType) {
//       return NextResponse.json(
//         { error: "Subscriber type is required" },
//         { status: 400 }
//       );
//     }

//     if (body.subscriberType === "DOCTOR" && !body.doctorId) {
//       return NextResponse.json(
//         { error: "Doctor ID is required for doctor subscriptions" },
//         { status: 400 }
//       );
//     }

//     if (body.subscriberType === "HOSPITAL" && !body.hospitalId) {
//       return NextResponse.json(
//         { error: "Hospital ID is required for hospital subscriptions" },
//         { status: 400 }
//       );
//     }

//     // Check if doctor or hospital already has an active subscription
//     if (body.subscriberType === "DOCTOR") {
//       const existingSubscription = await prisma.subscription.findFirst({
//         where: {
//           doctorId: body.doctorId,
//           status: { in: ["ACTIVE", "TRIAL"] },
//         },
//       });

//       if (existingSubscription) {
//         return NextResponse.json(
//           { error: "Doctor already has an active subscription" },
//           { status: 400 }
//         );
//       }
//     } else if (body.subscriberType === "HOSPITAL") {
//       const existingSubscription = await prisma.subscription.findFirst({
//         where: {
//           hospitalId: body.hospitalId,
//           status: { in: ["ACTIVE", "TRIAL"] },
//         },
//       });

//       if (existingSubscription) {
//         return NextResponse.json(
//           { error: "Hospital already has an active subscription" },
//           { status: 400 }
//         );
//       }
//     }

//     // Create subscription
//     const subscription = await prisma.subscription.create({
//       data: {
//         subscriberType: body.subscriberType as SubscriberType,
//         doctorId: body.subscriberType === "DOCTOR" ? body.doctorId : null,
//         hospitalId: body.subscriberType === "HOSPITAL" ? body.hospitalId : null,
//         plan: body.plan as SubscriptionPlan,
//         status: body.status as SubscriptionStatus,
//         startDate: new Date(body.startDate),
//         endDate: new Date(body.endDate),
//         amount: body.amount,
//         currency: body.currency || "XOF",
//         autoRenew: body.autoRenew || false,
//       },
//     });

//     // Create initial payment record
//     await prisma.subscriptionPayment.create({
//       data: {
//         subscriptionId: subscription.id,
//         amount: body.amount,
//         currency: body.currency || "XOF",
//         paymentMethod: "CREDIT_CARD", // Default payment method
//         status: "COMPLETED",
//         paymentDate: new Date(),
//       },
//     });

//     return NextResponse.json(subscription, { status: 201 });
//   } catch (error) {
//     console.error("Error creating subscription:", error);
//     return NextResponse.json(
//       { error: "Failed to create subscription" },
//       { status: 500 }
//     );
//   }
// }

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
