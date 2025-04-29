export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
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
            patientId,
            title,
            condition,
            diagnosedDate,
            status,
            details,
        } = await request.json();

        if (!patientId || !title || !condition || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const patientExists = await prisma.patient.findUnique({ where: { id: patientId } });

        if (!patientExists) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        const medicalHistory = await prisma.medicalHistory.create({
            data: {
                patientId,
                title,
                condition,
                diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : undefined,
                status,
                details,
                createdBy: session.user.id,
            },
        });

        // Retourner l'objet sous la bonne forme
        return NextResponse.json(
            {
                medicalHistorie: {
                    id: medicalHistory.id,
                    title: medicalHistory.title,
                    condition: medicalHistory.condition,
                    diagnosedDate: medicalHistory.diagnosedDate ?? null,
                    status: medicalHistory.status,
                    details: medicalHistory.details ?? null,
                    createdBy: medicalHistory.createdBy,
                    createdAt: medicalHistory.createdAt,
                    updatedAt: medicalHistory.updatedAt,
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating medical history:", error);
        return NextResponse.json(
            { error: "Failed to create medical history" },
            { status: 500 }
        );
    }
}
