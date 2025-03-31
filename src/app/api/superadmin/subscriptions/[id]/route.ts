export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import {
  type SubscriptionStatus,
  type SubscriptionPlan,
  type SubscriberType,
} from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch a single subscription by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Fetch subscription with related data
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            hospital: {
              select: {
                id: true,
                name: true,
                city: true,
                country: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        hospital: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            paymentDate: "desc",
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing subscription
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        subscriberType: body.subscriberType as SubscriberType,
        doctorId: body.subscriberType === "DOCTOR" ? body.doctorId : null,
        hospitalId: body.subscriberType === "HOSPITAL" ? body.hospitalId : null,
        plan: body.plan as SubscriptionPlan,
        status: body.status as SubscriptionStatus,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        amount: body.amount,
        currency: body.currency,
        autoRenew: body.autoRenew,
      },
    });

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Delete related payments first
    await prisma.subscriptionPayment.deleteMany({
      where: { subscriptionId: id },
    });

    // Delete subscription
    await prisma.subscription.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
