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
            temperature,
            heartRate,
            bloodPressureSystolic,
            bloodPressureDiastolic,
            respiratoryRate,
            oxygenSaturation,
            weight,
            height,
            notes,
            recordedAt,
        } = await request.json();

        if (!patientId || !recordedAt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const patientExists = await prisma.patient.findUnique({ where: { id: patientId } });

        if (!patientExists) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        const vitalSign = await prisma.vitalSign.create({
            data: {
                patientId,
                temperature,
                heartRate,
                bloodPressureSystolic,
                bloodPressureDiastolic,
                respiratoryRate,
                oxygenSaturation,
                weight,
                height,
                notes,
                recordedAt: new Date(recordedAt), // important de convertir
            },
        });

        // Reformater la réponse sous la forme demandée
        return NextResponse.json(
            {
                vitalSigns: {
                    id: vitalSign.id,
                    temperature: vitalSign.temperature ?? null,
                    heartRate: vitalSign.heartRate ?? null,
                    bloodPressureSystolic: vitalSign.bloodPressureSystolic ?? null,
                    bloodPressureDiastolic: vitalSign.bloodPressureDiastolic ?? null,
                    respiratoryRate: vitalSign.respiratoryRate ?? null,
                    oxygenSaturation: vitalSign.oxygenSaturation ?? null,
                    weight: vitalSign.weight ?? null,
                    height: vitalSign.height ?? null,
                    notes: vitalSign.notes ?? null,
                    recordedAt: vitalSign.recordedAt,
                    createdAt: vitalSign.createdAt,
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating vital sign:", error);
        return NextResponse.json(
            { error: "Failed to create vital sign" },
            { status: 500 }
        );
    }
}
