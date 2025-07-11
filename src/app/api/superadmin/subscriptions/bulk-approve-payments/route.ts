export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid or empty subscription IDs" }, { status: 400 });
    }

    // Update all pending payments for the given subscription IDs to COMPLETED
    const updatedPayments = await prisma.subscriptionPayment.updateMany({
      where: {
        subscriptionId: {
          in: ids,
        },
        status: "PENDING",
      },
      data: {
        status: "COMPLETED",
        paymentDate: new Date(), // Update payment date to now
      },
    });

    // Optionally, update the subscription status to ACTIVE
    await prisma.subscription.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status: "ACTIVE", // Set subscription to ACTIVE after payment approval
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Extend subscription for one year
      },
    });

    return NextResponse.json({
      message: `${updatedPayments.count} payments approved successfully`,
    });
  } catch (error) {
    console.error("Error approving payments:", error);
    return NextResponse.json(
      { error: "Failed to approve payments" },
      { status: 500 }
    );
  }
}