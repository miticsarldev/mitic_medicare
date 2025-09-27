// export const dynamic = "force-dynamic";

// import { type NextRequest, NextResponse } from "next/server";
// import {
//   type SubscriptionStatus,
//   type SubscriptionPlan,
//   type SubscriberType,
// } from "@prisma/client";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";
// import prisma from "@/lib/prisma";

// // GET - Fetch a single subscription by ID
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // Check authentication and authorization
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "SUPER_ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const id = params.id;

//     // Fetch subscription with related data
//     const subscription = await prisma.subscription.findUnique({
//       where: { id },
//       include: {
//         doctor: {
//           include: {
//             user: {
//               include: {
//                 profile: true,
//               },
//             },
//             hospital: {
//               select: {
//                 id: true,
//                 name: true,
//                 city: true,
//                 country: true,
//               },
//             },
//             department: {
//               select: {
//                 id: true,
//                 name: true,
//               },
//             },
//           },
//         },
//         hospital: {
//           include: {
//             admin: {
//               select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 phone: true,
//                 role: true,
//                 isActive: true,
//               },
//             },
//           },
//         },
//         payments: {
//           orderBy: {
//             paymentDate: "desc",
//           },
//         },
//       },
//     });

//     if (!subscription) {
//       return NextResponse.json(
//         { error: "Subscription not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(subscription);
//   } catch (error) {
//     console.error("Error fetching subscription:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch subscription" },
//       { status: 500 }
//     );
//   }
// }

// // PUT - Update an existing subscription
// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // Check authentication and authorization
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "SUPER_ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const id = params.id;
//     const body = await request.json();

//     // Check if subscription exists
//     const existingSubscription = await prisma.subscription.findUnique({
//       where: { id },
//     });

//     if (!existingSubscription) {
//       return NextResponse.json(
//         { error: "Subscription not found" },
//         { status: 404 }
//       );
//     }

//     // Update subscription
//     const updatedSubscription = await prisma.subscription.update({
//       where: { id },
//       data: {
//         subscriberType: body.subscriberType as SubscriberType,
//         doctorId: body.subscriberType === "DOCTOR" ? body.doctorId : null,
//         hospitalId: body.subscriberType === "HOSPITAL" ? body.hospitalId : null,
//         plan: body.plan as SubscriptionPlan,
//         status: body.status as SubscriptionStatus,
//         startDate: new Date(body.startDate),
//         endDate: new Date(body.endDate),
//         amount: body.amount,
//         currency: body.currency,
//         autoRenew: body.autoRenew,
//       },
//     });

//     return NextResponse.json(updatedSubscription);
//   } catch (error) {
//     console.error("Error updating subscription:", error);
//     return NextResponse.json(
//       { error: "Failed to update subscription" },
//       { status: 500 }
//     );
//   }
// }

// // DELETE - Delete a subscription
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // Check authentication and authorization
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "SUPER_ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const id = params.id;

//     // Check if subscription exists
//     const existingSubscription = await prisma.subscription.findUnique({
//       where: { id },
//     });

//     if (!existingSubscription) {
//       return NextResponse.json(
//         { error: "Subscription not found" },
//         { status: 404 }
//       );
//     }

//     // Delete related payments first
//     await prisma.subscriptionPayment.deleteMany({
//       where: { subscriptionId: id },
//     });

//     // Delete subscription
//     await prisma.subscription.delete({
//       where: { id },
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error deleting subscription:", error);
//     return NextResponse.json(
//       { error: "Failed to delete subscription" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const s = await getServerSession(authOptions);
  if (!s || s.user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sub = await prisma.subscription.findUnique({
    where: { id: params.id },
    include: {
      hospital: true,
      doctor: { include: { user: true, hospital: true } },
      payments: true,
    },
  });
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sub);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const s = await getServerSession(authOptions);
  if (!s || s.user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    await prisma.subscription.update({
      where: { id: params.id },
      data: {
        plan: body.plan,
        status: body.status,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        amount:
          body.amount !== undefined
            ? new Prisma.Decimal(body.amount)
            : undefined,
        currency: body.currency,
        autoRenew: body.autoRenew,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const s = await getServerSession(authOptions);
  if (!s || s.user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.subscription.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
