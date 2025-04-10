export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

        // Vérifier l'existence du département
        const department = await prisma.department.findUnique({
            where: { id: params.id },
        });
        if (!department) {
            return NextResponse.json({ error: "Department not found" }, { status: 404 });
        }

        // Vérifier que le département appartient à cet hôpital
        if (department.hospitalId !== hospital.id) {
            return NextResponse.json({ error: "This department does not belong to your hospital" }, { status: 400 });
        }

        // Extraire les données de la requête
        const { name, description } = await req.json();

        // Mise à jour du département (le nom est généralement requis)
        const updatedDepartment = await prisma.department.update({
            where: { id: params.id },
            data: {
                name: name || department.name,
                description: typeof description === "string" ? description : department.description,
            },
        });

        return NextResponse.json({ department: updatedDepartment });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du département :", error);
        return NextResponse.json({ error: "Erreur serveur lors de la mise à jour du département" }, { status: 500 });
    }
}
