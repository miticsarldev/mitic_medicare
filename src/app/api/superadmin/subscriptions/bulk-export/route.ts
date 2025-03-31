export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST - Bulk export subscriptions
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No subscription IDs provided" },
        { status: 400 }
      );
    }

    // Fetch subscriptions with related data
    const subscriptions = await prisma.subscription.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        hospital: {
          select: {
            name: true,
            email: true,
          },
        },
        payments: {
          orderBy: {
            paymentDate: "desc",
          },
          take: 1,
        },
      },
    });

    // Format data for export
    const exportData = subscriptions.map((subscription) => {
      const subscriberName =
        subscription.subscriberType === "DOCTOR"
          ? subscription.doctor?.user?.name || "N/A"
          : subscription.hospital?.name || "N/A";

      const subscriberEmail =
        subscription.subscriberType === "DOCTOR"
          ? subscription.doctor?.user?.email || "N/A"
          : subscription.hospital?.email || "N/A";

      const lastPayment =
        subscription.payments && subscription.payments.length > 0
          ? subscription.payments[0]
          : null;

      return {
        id: subscription.id,
        subscriberType: subscription.subscriberType,
        subscriberName,
        subscriberEmail,
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate.toISOString().split("T")[0],
        endDate: subscription.endDate.toISOString().split("T")[0],
        amount: subscription.amount.toString(),
        currency: subscription.currency,
        autoRenew: subscription.autoRenew ? "Yes" : "No",
        lastPaymentDate: lastPayment
          ? lastPayment.paymentDate.toISOString().split("T")[0]
          : "N/A",
        lastPaymentStatus: lastPayment ? lastPayment.status : "N/A",
        createdAt: subscription.createdAt.toISOString().split("T")[0],
      };
    });

    return NextResponse.json({
      success: true,
      subscriptions: exportData,
    });
  } catch (error) {
    console.error("Error exporting subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to export subscriptions" },
      { status: 500 }
    );
  }
}
