export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ReviewStatus, ReviewTargetType, Prisma } from "@prisma/client";

const DEFAULT_PAGE_SIZE = 10;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || DEFAULT_PAGE_SIZE.toString(), 10);
    const targetType = searchParams.get("targetType") as ReviewTargetType | null;
    const statusFilter = searchParams.get("status") as ReviewStatus | null;
    const minRating = parseInt(searchParams.get("minRating") || "0", 10);

    if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1 || isNaN(minRating)) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { adminId: session.user.id },
      select: { id: true },
    });

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const skip = (page - 1) * pageSize;

    // Préparation des conditions de filtrage
    const whereConditions: Prisma.ReviewWhereInput = {
      rating: { gte: minRating },
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(targetType === "HOSPITAL"
        ? { targetType: "HOSPITAL", hospitalId: hospital.id }
        : targetType === "DOCTOR"
        ? {
            targetType: "DOCTOR",
            doctor: { hospitalId: hospital.id },
          }
        : {
            OR: [
              { targetType: "HOSPITAL", hospitalId: hospital.id },
              { targetType: "DOCTOR", doctor: { hospitalId: hospital.id } },
            ],
          }),
    };

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: whereConditions,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          title: true,
          content: true,
          rating: true,
          status: true,
          targetType: true,
          isAnonymous: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              user: { select: { name: true } },
              specialization: true,
            },
          },
          hospital: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.review.count({ where: whereConditions }),
    ]);

    const formatted = reviews.map((review) => ({
      id: review.id,
      title: review.title,
      content: review.content,
      rating: review.rating,
      status: review.status,
      targetType: review.targetType,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      author: review.isAnonymous
        ? { name: "Anonyme" }
        : {
            id: review.author.id,
            name: review.author.name,
            email: review.author.email,
            phone: review.author.phone,
          },
      doctor:
        review.targetType === "DOCTOR" && review.doctor
          ? {
              id: review.doctor.id,
              name: review.doctor.user.name,
              specialization: review.doctor.specialization,
            }
          : null,
      hospital:
        review.targetType === "HOSPITAL" && review.hospital
          ? {
              id: review.hospital.id,
              name: review.hospital.name,
            }
          : null,
    }));

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      reviews: formatted,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
