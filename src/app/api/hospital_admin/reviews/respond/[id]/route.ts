export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérification de la session utilisateur
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupération de l'hôpital de l'utilisateur
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

    // Vérification de l'existence de l'avis
    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Vérification que l'avis cible bien l'hôpital de l'utilisateur
    if (review.hospitalId !== hospital.id) {
      return NextResponse.json(
        { error: "Review does not target your hospital" },
        { status: 400 }
      );
    }

    // Extraction des données de la requête
    const { content } = await req.json();

    // Création de la réponse officielle
    const response = await prisma.review.create({
      data: {
        id: params.id,
        content: content,
        authorId: session.user.id,
        title: "Default Title", // Replace with appropriate title
        rating: 5, // Replace with appropriate rating
        targetType: "HOSPITAL", // Replace with appropriate target type
      },
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Erreur lors de la création de la réponse :", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création de la réponse" },
      { status: 500 }
    );
  }
}
