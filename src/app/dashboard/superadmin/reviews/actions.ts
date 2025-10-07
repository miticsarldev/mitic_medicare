"use server";

import { revalidatePath } from "next/cache";
import { ReviewStatus, type ReviewTargetType } from "@prisma/client";
import { parseISO } from "date-fns";
import { startOfDay, endOfDay } from "date-fns";
import type {
  ReviewsData,
  ReviewWithRelations,
  PaginationOptions,
} from "./types";
import prisma from "@/lib/prisma";

type GetReviewsArgs = {
  status?: ReviewStatus | "ALL";
  targetType?: "ALL" | ReviewTargetType;
  search?: string;
  ratingMin?: number;
  ratingMax?: number;
  from?: string | null; // ISO yyyy-MM-dd
  to?: string | null; // ISO yyyy-MM-dd
  doctorId?: string | null;
  hospitalId?: string | null;
  page?: number;
  pageSize?: number;
};

export async function getReviewsData(
  args: GetReviewsArgs = {}
): Promise<ReviewsData> {
  const {
    status = "ALL",
    targetType = "ALL",
    search = "",
    ratingMin,
    ratingMax,
    from,
    to,
    doctorId,
    hospitalId,
    page = 1,
    pageSize = 10,
  } = args;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (status !== "ALL") where.status = status;
  if (targetType !== "ALL") where.targetType = targetType;

  if (typeof ratingMin === "number")
    where.rating = { ...(where.rating ?? {}), gte: ratingMin };
  if (typeof ratingMax === "number")
    where.rating = { ...(where.rating ?? {}), lte: ratingMax };

  if (from || to) {
    const gte = from ? startOfDay(parseISO(from)) : undefined;
    const lte = to ? endOfDay(parseISO(to)) : undefined;
    where.createdAt = { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
  }

  if (doctorId) where.doctorId = doctorId;
  if (hospitalId) where.hospitalId = hospitalId;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
      { author: { name: { contains: search, mode: "insensitive" } } },
      { doctor: { user: { name: { contains: search, mode: "insensitive" } } } },
      { hospital: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const totalItems = await prisma.review.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const skip = (page - 1) * pageSize;

  const reviews = (await prisma.review.findMany({
    where,
    include: {
      author: { include: { profile: true } },
      doctor: { include: { user: true } },
      hospital: true,
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
  })) as ReviewWithRelations[];

  const [pending, approved, rejected, ratingAgg] = await Promise.all([
    prisma.review.count({ where: { ...where, status: "PENDING" } }),
    prisma.review.count({ where: { ...where, status: "APPROVED" } }),
    prisma.review.count({ where: { ...where, status: "REJECTED" } }),
    prisma.review.aggregate({ where, _avg: { rating: true } }),
  ]);

  const pagination: PaginationOptions = {
    page,
    pageSize,
    totalItems,
    totalPages,
  };
  const stats = {
    total: totalItems,
    pending,
    approved,
    rejected,
    avgRating: Math.round(((ratingAgg._avg.rating ?? 0) as number) * 10) / 10,
  };

  return { reviews, pagination, stats };
}

export async function updateReviewStatus(id: string, status: ReviewStatus) {
  await prisma.review.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/superadmin/reviews");
}

export async function toggleFeatured(id: string, featured: boolean) {
  await prisma.review.update({ where: { id }, data: { isFeatured: featured } });
  revalidatePath("/dashboard/superadmin/reviews");
}

export async function deleteReview(id: string) {
  await prisma.review.delete({ where: { id } });
  revalidatePath("/dashboard/superadmin/reviews");
}
