export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

const DEFAULT_PAGE_SIZE = 10;

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Récupérer les paramètres de requête
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE.toString(), 10);
        const statusFilter = searchParams.get('status') || undefined;

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

        const skip = (page - 1) * pageSize;

        // Construire les conditions de filtre
        const whereConditions = {
            hospitalId: hospital.id,
            ...(statusFilter && { status: statusFilter as AppointmentStatus })
        };

        // Récupérer les données avec pagination et filtres
        const [appointments, totalCount] = await Promise.all([
            prisma.appointment.findMany({
                where: whereConditions,
                orderBy: {
                    scheduledAt: "desc",
                },
                skip,
                take: pageSize,
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
                            department: {
                                select: {
                                    name: true,
                                },
                            }
                        },
                    },
                    patient: {
                        select: {
                            id: true,
                            bloodType: true,
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
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
            prisma.appointment.count({
                where: whereConditions,
            }),
        ]);

        // Formater les données de réponse
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
                department: apt.doctor.department?.name || "Non précisé",
            },
            patient: {
                id: apt.patient.id,
                name: apt.patient.user.name,
                gender: apt.patient.user.profile?.genre || "Non précisé",
                email: apt.patient.user.email,
                phone: apt.patient.user.phone,
                bloodType: apt.patient.bloodType || "Non précisé",
                allergies: apt.patient.allergies || "Non précisé",
                medicalNotes: apt.patient.medicalNotes || "Non précisé",
            },
        }));

        // Calculer les métadonnées de pagination
        const totalPages = Math.ceil(totalCount / pageSize);

        return NextResponse.json({ 
            appointments: formatted,
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
        console.error("Error fetching appointments:", error);
        return NextResponse.json(
            { error: "Failed to fetch appointments" },
            { status: 500 }
        );
    }
}