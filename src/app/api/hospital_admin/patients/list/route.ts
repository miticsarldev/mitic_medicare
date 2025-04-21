export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
            select: { id: true },
        });

        if (!hospital) {
            return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
        }

        const hospitalId = hospital.id;

        const patientsWithAppointments = await prisma.patient.findMany({
            where: {
                appointments: {
                    some: {
                        hospitalId: hospitalId,
                    },
                },
            },
            select: {
                id: true,
                allergies: true,
                medicalNotes: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        profile: {
                            select: {
                                genre: true,
                                address: true,
                                city: true,
                                state: true,
                                zipCode: true,
                            },
                        },
                    },
                },
                appointments: {
                    where: { hospitalId },
                    orderBy: { scheduledAt: "desc" },
                    select: {
                        id: true,
                        scheduledAt: true,
                        status: true,
                        reason: true,
                        doctor: {
                            select: {
                                id: true,
                                specialization: true,
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
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
            const appointments = patient.appointments.map((appt) => ({
                id: appt.id,
                scheduledAt: appt.scheduledAt,
                status: appt.status,
                reason: appt.reason,
                doctor: {
                    id: appt.doctor.id,
                    name: appt.doctor.user.name,
                    email: appt.doctor.user.email,
                    specialty: appt.doctor.specialization,
                },
            }));

            const lastAppointment = appointments[0];

            return {
                id: patient.id,
                name: patient.user.name,
                gender: patient.user.profile?.genre || "Non précisé",
                email: patient.user.email,
                phone: patient.user.phone,
                address: patient.user.profile?.address || null,
                city: patient.user.profile?.city || null,
                state: patient.user.profile?.state || null,
                zipCode: patient.user.profile?.zipCode || null,
                numberOfMedicalRecords: patient.medicalRecords.length,
                numberOfAppointments: appointments.length,
                lastAppointment: lastAppointment?.scheduledAt || null,
                appointments,
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
