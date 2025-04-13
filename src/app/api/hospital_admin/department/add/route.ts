export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        // Vérifier la session utilisateur et le rôle
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

        // Extraire les données de la requête
        const { name, description } = await req.json();

        // Vérification minimale des données
        if (!name || typeof name !== "string") {
            return NextResponse.json({ error: "Nom du département requis" }, { status: 400 });
        }

        // Créer le département (la contrainte d'unicité se trouve dans le schema Prisma)
        const newDepartment = await prisma.department.create({
            data: {
                name,
                description: description || null,
                hospital: { connect: { id: hospital.id } },
            },
        });

        return NextResponse.json({ department: newDepartment });
    } catch (error) {
        console.error("Erreur lors de la création du département :", error);
        return NextResponse.json({ error: "Erreur serveur lors de la création du département" }, { status: 500 });
    }
}
