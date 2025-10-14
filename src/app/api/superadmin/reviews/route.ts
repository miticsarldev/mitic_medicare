import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ReviewStatus, ReviewTargetType, Prisma } from "@prisma/client";

// GET - Fetch all reviews with filtering and pagination
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
    const status = searchParams.get("status")?.toUpperCase() || "";
    const targetType = searchParams.get("targetType")?.toUpperCase() || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const isFeatured = searchParams.get("isFeatured") === "true";

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: Prisma.ReviewWhereInput = {};

    // Status filter
    if (status && ["APPROVED", "PENDING", "REJECTED"].includes(status)) {
      where.status = status as ReviewStatus;
    }

    // Target type filter
    if (targetType && ["DOCTOR", "HOSPITAL", "PLATFORM"].includes(targetType)) {
      where.targetType = targetType as ReviewTargetType;
    }

    // Featured filter
    if (isFeatured) {
      where.isFeatured = true;
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { author: { name: { contains: search, mode: "insensitive" } } },
        {
          doctor: {
            user: { name: { contains: search, mode: "insensitive" } },
          },
        },
        { hospital: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Count total reviews for pagination
    const totalReviews = await prisma.review.count({ where });

    // Build sort object
    const orderBy: Prisma.ReviewOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Fetch reviews with related data
    const reviews = await prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalReviews / limit);

    return NextResponse.json({
      reviews,
      pagination: {
        total: totalReviews,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Update review details
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId, status, title, content, isFeatured } =
      await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: Prisma.ReviewUpdateInput = {};
    if (status) updateData.status = status as ReviewStatus;
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (typeof isFeatured === "boolean") updateData.isFeatured = isFeatured;

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
