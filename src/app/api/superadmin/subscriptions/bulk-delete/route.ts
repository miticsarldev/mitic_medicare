export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST - Bulk delete subscriptions
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

    // Delete related payments first
    await prisma.subscriptionPayment.deleteMany({
      where: {
        subscriptionId: {
          in: ids,
        },
      },
    });

    // Delete subscriptions
    const result = await prisma.subscription.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    console.error("Error bulk deleting subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to delete subscriptions" },
      { status: 500 }
    );
  }
}
