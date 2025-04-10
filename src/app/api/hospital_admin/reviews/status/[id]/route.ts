export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        // Vérifier la session utilisateur
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Récupérer l'hôpital de l'utilisateur
        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
            select: { id: true },
        });

        if (!hospital) {
            return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
        }

        // Vérifier l'existence de l'avis
        const review = await prisma.review.findUnique({
            where: { id: params.id },
        });

        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        // Vérifier que l'avis cible bien l'hôpital de l'utilisateur
        if (review.hospitalId !== hospital.id) {
            return NextResponse.json({ error: "Review does not target your hospital" }, { status: 400 });
        }

        // Extraire les données de la requête
        const { status } = await req.json();

        // Vérifier que le statut est valide
        if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // Mettre à jour le statut de l'avis
        const updatedReview = await prisma.review.update({
            where: { id: params.id },
            data: { status: status },
        });

        return NextResponse.json({ updatedReview });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut de l'avis :", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la mise à jour du statut" },
            { status: 500 }
        );
    }
}
