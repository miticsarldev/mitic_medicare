export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
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

        const prescriptions = await prisma.prescription.findMany({
            where: {
                doctor: {
                    hospitalId: hospital.id,
                },
            },
            orderBy: {
                startDate: "desc",
            },
            select: {
                id: true,
                medicationName: true,
                dosage: true,
                startDate: true,
                endDate: true,
                isActive: true,
                patient: {
                    select: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        const formatted = prescriptions.map((p) => ({
            id: p.id,
            patient: p.patient.user.name,
            medication: p.medicationName,
            dosage: p.dosage,
            period: {
                start: p.startDate,
                end: p.endDate,
            },
            status: p.isActive ? "Active" : "Inactive",
        }));

        return NextResponse.json({ prescriptions: formatted });
    } catch (error) {
        console.error("Error fetching prescriptions:", error);
        return NextResponse.json(
            { error: "Failed to fetch prescriptions" },
            { status: 500 }
        );
    }
}
