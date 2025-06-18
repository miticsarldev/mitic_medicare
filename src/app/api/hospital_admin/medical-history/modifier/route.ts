export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
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

        const {
            id,
            title,
            condition,
            diagnosedDate,
            status,
            details,
        } = await request.json();

        if (!id || !title || !condition || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

        const updatedMedicalHistory = await prisma.medicalHistory.update({
            where: { id },
            data: {
                title,
                condition,
                diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : null,
                status,
                details,
            },
        });

        return NextResponse.json(
            {
                medicalHistorie: {
                    id: updatedMedicalHistory.id,
                    title: updatedMedicalHistory.title,
                    condition: updatedMedicalHistory.condition,
                    diagnosedDate: updatedMedicalHistory.diagnosedDate ?? null,
                    status: updatedMedicalHistory.status,
                    details: updatedMedicalHistory.details ?? null,
                    createdBy: updatedMedicalHistory.createdBy,
                    createdAt: updatedMedicalHistory.createdAt,
                    updatedAt: updatedMedicalHistory.updatedAt,
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating medical history:", error);
        return NextResponse.json(
            { error: "Failed to update medical history" },
            { status: 500 }
        );
    }
}