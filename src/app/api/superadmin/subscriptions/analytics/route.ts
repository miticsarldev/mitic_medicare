export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch subscription analytics
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total subscriptions
    const totalSubscriptions = await prisma.subscription.count();

    // Get active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: "ACTIVE" },
    });

    // Get doctor subscriptions
    const doctorSubscriptions = await prisma.subscription.count({
      where: { subscriberType: "DOCTOR" },
    });

    // Get hospital subscriptions
    const hospitalSubscriptions = await prisma.subscription.count({
      where: { subscriberType: "HOSPITAL" },
    });

    // Get new subscriptions in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newSubscriptions = await prisma.subscription.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get subscriptions by plan
    const subscriptionsByPlan = await prisma.$queryRaw`
      SELECT "plan", COUNT(*) as count
      FROM "Subscription"
      GROUP BY "plan"
      ORDER BY count DESC
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptionsByPlanFormatted = (subscriptionsByPlan as any[]).map(
      (row) => ({
        ...row,
        count: Number(row.count),
      })
    );

    // Get revenue by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "paymentDate"), 'Mon YYYY') as month,
        SUM(amount) as amount
      FROM "SubscriptionPayment"
      WHERE "paymentDate" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "paymentDate")
      ORDER BY DATE_TRUNC('month', "paymentDate") ASC
    `;

    // Get total revenue
    const totalRevenue = await prisma.subscriptionPayment.aggregate({
      _sum: {
        amount: true,
      },
    });

    // Get average subscription value
    const totalRevenueAmount = totalRevenue._sum.amount ?? 0;
    const avgSubscriptionValue =
      activeSubscriptions > 0
        ? Number(totalRevenueAmount) / activeSubscriptions
        : 0;

    return NextResponse.json({
      totalSubscriptions,
      activeSubscriptions,
      doctorSubscriptions,
      hospitalSubscriptions,
      newSubscriptions,
      subscriptionsByPlan: subscriptionsByPlanFormatted,
      revenueByMonth,
      totalRevenue: totalRevenue._sum.amount || 0,
      avgSubscriptionValue,
    });
  } catch (error) {
    console.error("Error fetching subscription analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription analytics" },
      { status: 500 }
    );
  }
}
