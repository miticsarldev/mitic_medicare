export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

        // Vérifier que le département existe
        const department = await prisma.department.findUnique({
            where: { id: params.id },
        });

        if (!department) {
            return NextResponse.json({ error: "Department not found" }, { status: 404 });
        }

        // Vérifier que ce département appartient bien à l'hôpital de l'admin
        if (department.hospitalId !== hospital.id) {
            return NextResponse.json({ error: "This department does not belong to your hospital" }, { status: 400 });
        }

        // Suppression du département
        await prisma.department.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "Department deleted successfully" });

    } catch (error) {
        console.error("Erreur lors de la suppression du département :", error);
        return NextResponse.json({ error: "Erreur serveur lors de la suppression du département" }, { status: 500 });
    }
}
