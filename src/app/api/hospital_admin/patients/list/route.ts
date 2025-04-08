export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Récupérer l’hôpital de l’admin connecté
        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
            select: { id: true },
        });

        if (!hospital) {
            return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
        }

        const hospitalId = hospital.id;

        // Récupérer les patients avec au moins un rendez-vous dans l'hôpital
        const patientsWithAppointments = await prisma.patient.findMany({
            where: {
                appointments: {
                    some: {
                        hospitalId: hospitalId,
                    },
                },
            },
            include: {
                user: {
                    select: {
                        name: true,
                        profile: {
                            select: {
                                genre: true,
                            },
                        },
                    },
                },
                appointments: {
                    where: { hospitalId },
                    orderBy: { scheduledAt: "desc" },
                    select: {
                        scheduledAt: true,
                        id: true,
                    },
                },
                medicalRecords: {
                    where: { hospitalId },
                    select: {
                        id: true,
                        diagnosis: true,
                        treatment: true,
                        createdAt: true,
                    },
                },
            },
        });

        const patientsFormatted = patientsWithAppointments.map((patient) => {
            const lastAppointment = patient.appointments[0]; // déjà trié par scheduledAt desc

            return {
                id: patient.id,
                name: patient.user.name,
                gender: patient.user.profile?.genre || "Non précisé",
                dateOfBirth: patient.dateOfBirth,
                numberOfAppointments: patient.appointments.length,
                lastAppointment: lastAppointment?.scheduledAt || null,
                medicalRecords: patient.medicalRecords,
                healthStatus: {
                    allergies: patient.allergies || null,
                    notes: patient.medicalNotes || null,
                },
            };
        });

        return NextResponse.json({ patients: patientsFormatted });
    } catch (error) {
        console.error("Error fetching patients:", error);
        return NextResponse.json(
            { error: "Failed to fetch patients with appointments" },
            { status: 500 }
        );
    }
}
