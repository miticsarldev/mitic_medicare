export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
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

        // Récupérer les départements de l'hôpital avec le nombre de médecins assignés
        const departments = await prisma.department.findMany({
            where: { hospitalId: hospital.id },
            select: {
                id: true,
                name: true,
                description: true,
                _count: {
                    select: { doctors: true }, // Compter le nombre de médecins dans chaque département
                },
            },
        });

        const formattedDepartments = departments.map((department) => ({
            id: department.id,
            name: department.name,
            description: department.description || "No description",
            doctorCount: department._count.doctors,
        }));

        return NextResponse.json({ departments: formattedDepartments });
    } catch (error) {
        console.error("Error fetching departments:", error);
        return NextResponse.json(
            { error: "Failed to fetch departments" },
            { status: 500 }
        );
    }
}
