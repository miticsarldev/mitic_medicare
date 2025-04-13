"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ReviewStatus, ReviewTargetType } from "@prisma/client";
import {
  FeedbackFormData,
  ReviewFormData,
  ReviewWithRelations,
} from "@/types/patient/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getReviews(): Promise<ReviewWithRelations[]> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const reviews = await prisma.review.findMany({
    where: {
      authorId: session.user.id,
    },
    include: {
      author: true,
      doctor: {
        include: {
          user: true,
        },
      },
      hospital: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews;
}

export async function createReview(
  data: ReviewFormData
): Promise<ReviewWithRelations> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const reviewData = {
    authorId: session.user.id,
    title: data.title,
    content: data.content,
    rating: data.rating,
    targetType: data.targetType,
    status: ReviewStatus.PENDING,
    isAnonymous: data.isAnonymous,
  };

  // Add the target based on the target type
  if (data.targetType === ReviewTargetType.DOCTOR) {
    Object.assign(reviewData, { doctorId: data.targetId });
  } else if (data.targetType === ReviewTargetType.HOSPITAL) {
    Object.assign(reviewData, { hospitalId: data.targetId });
  }

  const review = await prisma.review.create({
    data: reviewData,
    include: {
      author: true,
      doctor: {
        include: {
          user: true,
        },
      },
      hospital: true,
    },
  });

  revalidatePath("/dashboard/reviews");
  return review;
}

export async function updateReview(
  id: string,
  data: ReviewFormData
): Promise<ReviewWithRelations> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check if the review belongs to the logged-in user
  const existingReview = await prisma.review.findUnique({
    where: {
      id,
    },
  });

  if (!existingReview || existingReview.authorId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const reviewData = {
    title: data.title,
    content: data.content,
    rating: data.rating,
    isAnonymous: data.isAnonymous,
    status: ReviewStatus.PENDING, // Reset status to pending after edit
    updatedAt: new Date(),
  };

  const review = await prisma.review.update({
    where: {
      id,
    },
    data: reviewData,
    include: {
      author: true,
      doctor: {
        include: {
          user: true,
        },
      },
      hospital: true,
    },
  });

  revalidatePath("/dashboard/reviews");
  return review;
}

export async function deleteReview(id: string): Promise<void> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check if the review belongs to the logged-in user
  const existingReview = await prisma.review.findUnique({
    where: {
      id,
    },
  });

  if (!existingReview || existingReview.authorId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.review.delete({
    where: {
      id,
    },
  });

  revalidatePath("/dashboard/reviews");
}

export async function submitFeedback(data: FeedbackFormData): Promise<void> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // In a real application, you might store this in a separate feedback table
  // For now, we'll create a platform review
  await prisma.review.create({
    data: {
      authorId: session.user.id,
      title: data.title,
      content: data.details,
      rating:
        data.satisfaction === "very_satisfied"
          ? 5
          : data.satisfaction === "satisfied"
            ? 4
            : data.satisfaction === "neutral"
              ? 3
              : data.satisfaction === "dissatisfied"
                ? 2
                : 1,
      targetType: ReviewTargetType.PLATFORM,
      status: ReviewStatus.PENDING,
      isAnonymous: !data.contactPermission,
    },
  });

  revalidatePath("/dashboard/reviews");
}
