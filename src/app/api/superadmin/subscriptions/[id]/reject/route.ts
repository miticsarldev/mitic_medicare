// app/api/subscriptions/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionId = params.id;
    const now = new Date();

    const subscription = await prisma.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status: "INACTIVE",
        updatedAt: now,
        autoRenew: false, // Also disable auto-renewal
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        hospital: {
          include: {
            admin: true,
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

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("Error rejecting subscription:", error);
    return NextResponse.json(
      { error: "Failed to reject subscription" },
      { status: 500 }
    );
  }
}