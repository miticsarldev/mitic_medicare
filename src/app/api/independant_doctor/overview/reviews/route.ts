// app/api/reviews/respond/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  try {
    const { reviewId, content } = await req.json();

    // Validation
    if (!reviewId || !content) {
      return NextResponse.json(
        { message: "Données manquantes" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est un médecin
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });

    if (!doctor) {
      return NextResponse.json(
        { message: "Réservé aux médecins" },
        { status: 403 }
      );
    }

    // Vérifier que l'avis concerne ce médecin - Utilisation de DoctorReview
    const doctorReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!doctorReview || doctorReview.doctorId !== doctor.id) {
      return NextResponse.json(
        { message: "Avis non trouvé ou non autorisé" },
        { status: 403 }
      );
    }

    // Créer la réponse dans ReviewResponse
    const response = await prisma.review.create({
      data: {
        id: reviewId, // Associez l'avis via une relation
        content,
        authorId: session.user.id,
        rating: 5,
        title: "Default Title", // Provide a default or dynamic title
        targetType: "DOCTOR", // Provide a default or dynamic targetType
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: response.id,
      content: response.content,
      author: {
        name: response.author.name,
      },
      createdAt: response.createdAt,
    });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
