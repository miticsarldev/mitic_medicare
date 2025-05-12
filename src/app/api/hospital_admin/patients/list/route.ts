export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 10;

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Récupérer les paramètres de pagination
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE.toString(), 10);

        // Valider les paramètres
        if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1) {
            return NextResponse.json(
                { error: "Invalid pagination parameters" },
                { status: 400 }
            );
        }

        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
            select: { id: true },
        });

        if (!hospital) {
            return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
        }

        const hospitalId = hospital.id;
        const skip = (page - 1) * pageSize;

        // Récupérer les données avec pagination
        const [patientsWithAppointments, totalCount] = await Promise.all([
            prisma.patient.findMany({
                where: {
                    appointments: {
                        some: {
                            hospitalId: hospitalId,
                        },
                    },
                },
                skip,
                take: pageSize,
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
            }),
            prisma.patient.count({
                where: {
                    appointments: {
                        some: {
                            hospitalId: hospitalId,
                        },
                    },
                },
            }),
        ]);

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

        // Calculer les métadonnées de pagination
        const totalPages = Math.ceil(totalCount / pageSize);

        return NextResponse.json({
            patients: patientsFormatted,
            pagination: {
                currentPage: page,
                pageSize: pageSize,
                totalItems: totalCount,
                totalPages: totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            }
        });
    } catch (error) {
        console.error("Error fetching patients:", error);
        return NextResponse.json(
            { error: "Failed to fetch patients with appointments" },
            { status: 500 }
        );
    }
}