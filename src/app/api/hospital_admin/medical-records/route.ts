export const dynamic = "force-dynamic";

import {  NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
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

        const medicalRecords = await prisma.medicalRecord.findMany({
            where: {
                hospitalId: hospital.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                diagnosis: true,
                treatment: true,
                createdAt: true,
                patient: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                name: true,
                            },
                        },
                        specialization: true,
                    },
                },
                attachments: {
                    select: {
                        id: true,
                        fileName: true,
                        fileType: true,
                        fileUrl: true,
                        fileSize: true,
                        uploadedAt: true,
                    },
                },
                prescriptions: {
                    select: {
                        id: true,
                        medicationName: true,
                        dosage: true,
                        frequency: true,
                        duration: true,
                        isActive: true,
                        startDate: true,
                        endDate: true,
                    },
                },
            },
        });

        const formatted = medicalRecords.map((record) => ({
            id: record.id,
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            createdAt: record.createdAt,
            patient: {
                id: record.patient.id,
                name: record.patient.user.name,
            },
            doctor: {
                id: record.doctor.id,
                name: record.doctor.user.name,
                specialization: record.doctor.specialization,
            },
            attachments: record.attachments,
            prescriptions: record.prescriptions,
        }));

        return NextResponse.json({ records: formatted });
    } catch (error) {
        console.error("Error fetching medical records:", error);
        return NextResponse.json(
            { error: "Failed to fetch medical records" },
            { status: 500 }
        );
    }
}
