export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Vérification de la session
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupération de l'hôpital lié à l'admin
    const hospital = await prisma.hospital.findUnique({
      where: { adminId: session.user.id },
      select: { id: true },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    // Récupération des reviews qui ciblent cet hôpital
    const reviews = await prisma.review.findMany({
      where: {
        hospitalId: hospital.id,
        targetType: "HOSPITAL",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      title: review.title,
      content: review.content,
      rating: review.rating,
      createdAt: review.createdAt,
      status: review.status,
      isAnonymous: review.isAnonymous,
      author: review.isAnonymous
        ? { name: "Anonyme", image: null }
        : review.author,
    }));

    return NextResponse.json({ reviews: formattedReviews });
  } catch (error) {
    console.error("Erreur lors de la récupération des reviews:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des reviews" },
      { status: 500 }
    );
  }
}
