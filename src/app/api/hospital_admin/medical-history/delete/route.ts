export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
            select: { id: true },
        });

        if (!hospital) {
            return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
        }

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Medical history ID is required" }, { status: 400 });
        }

        // Vérifier que l'historique médical existe et appartient à un patient de l'hôpital
        const existingHistory = await prisma.medicalHistory.findFirst({
            where: {
                id
            }
        });

        if (!existingHistory) {
            return NextResponse.json({ error: "Medical history not found or not authorized" }, { status: 404 });
        }

        await prisma.medicalHistory.delete({
            where: { id },
        });

        return NextResponse.json(
            {
                message: "Medical history deleted successfully",
                medicalHistorie: {
                    id: existingHistory.id,
                    title: existingHistory.title,
                    condition: existingHistory.condition,
                    diagnosedDate: existingHistory.diagnosedDate ?? null,
                    status: existingHistory.status,
                    details: existingHistory.details ?? null,
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting medical history:", error);
        return NextResponse.json(
            { error: "Failed to delete medical history" },
            { status: 500 }
        );
    }
}