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

        const appointments = await prisma.appointment.findMany({
            where: {
                hospitalId: hospital.id,
            },
            orderBy: {
                scheduledAt: "desc",
            },
            select: {
                id: true,
                scheduledAt: true,
                status: true,
                type: true,
                reason: true,
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
                patient: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                name: true,
                                profile: {
                                    select: { genre: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        const formatted = appointments.map((apt) => ({
            id: apt.id,
            scheduledAt: apt.scheduledAt,
            status: apt.status,
            type: apt.type,
            reason: apt.reason,
            doctor: {
                id: apt.doctor.id,
                name: apt.doctor.user.name,
                specialization: apt.doctor.specialization,
            },
            patient: {
                id: apt.patient.id,
                name: apt.patient.user.name,
                gender: apt.patient.user.profile?.genre || "Non précisé",
            },
        }));

        return NextResponse.json({ appointments: formatted });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json(
            { error: "Failed to fetch appointments" },
            { status: 500 }
        );
    }
}
