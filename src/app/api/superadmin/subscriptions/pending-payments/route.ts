
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { SubscriberType, SubscriptionPlan, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Define allowed sort fields for Subscription
type SortField = "id" | "startDate" | "endDate" | "amount" | "paymentDate";

// GET - Fetch subscriptions with pending payments
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const subscriberType = searchParams.get("subscriberType") || "all";
    const plan = searchParams.get("plan") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = (searchParams.get("sortBy") || "startDate") as SortField;
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    // Validate sortBy
    const validSortFields: SortField[] = ["id", "startDate", "endDate", "amount", "paymentDate"];
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: "Invalid sortBy field" },
        { status: 400 }
      );
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: Prisma.SubscriptionWhereInput = {
      payments: {
        some: {
          status: "PENDING", // Filter for subscriptions with pending payments
        },
      },
    };

    // Subscriber type filter
    if (subscriberType !== "all") {
      where.subscriberType = subscriberType as SubscriberType;
    }

    // Plan filter
    if (plan !== "all") {
      where.plan = plan as SubscriptionPlan;
    }

    // Search filter (search in doctor or hospital names/emails or subscription ID)
    if (search) {
      where.OR = [
        {
          doctor: {
            user: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          hospital: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          doctor: {
            user: {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          hospital: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          id: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Count total subscriptions with pending payments
    const totalSubscriptions = await prisma.subscription.count({ where });

    // Build sort object
    const orderBy: Prisma.SubscriptionOrderByWithRelationInput = {};
    if (sortBy === "paymentDate") {
      // When sorting by paymentDate, use startDate as a fallback for the Subscription model
      orderBy.startDate = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Fetch subscriptions with pending payments
    const subscriptions = await prisma.subscription.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        doctor: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        hospital: true,
        payments: {
          where: {
            status: "PENDING",
          },
          orderBy: {
            paymentDate: "desc",
          },
          take: 5,
        },
      },
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalSubscriptions / limit);

    return NextResponse.json({
      subscriptions,
      pagination: {
        total: totalSubscriptions,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching subscriptions with pending payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions with pending payments" },
      { status: 500 }
    );
  }
}