export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        // Récupérer la session utilisateur
        const session = await getServerSession(authOptions);

        // Vérification du rôle de l'utilisateur (doit être un HOSPITAL_ADMIN)
        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Récupérer l'hôpital associé à l'admin connecté
        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
            select: { id: true, name: true, city: true },
        });

        // Si l'hôpital n'est pas trouvé, renvoyer une erreur
        if (!hospital) {
            return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
        }

        // Récupérer les données envoyées dans la requête
        const {
            patientId,
            doctorId,
            scheduledAt,
            type,
            reason,
            notes,
            cancellationReason,
        } = await request.json();

        // Vérification de la validité des données
        if (!patientId || !doctorId || !scheduledAt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Vérification de l'existence du patient
        const patientExists = await prisma.patient.findUnique({ where: { id: patientId } });

        if (!patientExists) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        // Vérification de l'existence du médecin
        const doctorExists = await prisma.doctor.findUnique({ where: { id: doctorId } });

        if (!doctorExists) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        // Création du rendez-vous
        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                scheduledAt,
                type,
                reason,
                notes,
                cancellationReason,
                hospitalId: hospital.id, // Associe l'hôpital de l'admin connecté
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        specialization: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                hospital: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                    },
                },
            },
        });

        // Formatage de la réponse
        const formattedAppointment = {
            id: appointment.id,
            scheduledAt: appointment.scheduledAt,
            endTime: appointment.endTime,
            status: appointment.status,
            type: appointment.type,
            reason: appointment.reason,
            notes: appointment.notes,
            cancellationReason: appointment.cancellationReason,
            createdAt: appointment.createdAt,
            updatedAt: appointment.updatedAt,
            doctor: {
                id: appointment.doctor.id,
                specialization: appointment.doctor.specialization,
                user: {
                    id: appointment.doctor.user.id,
                    name: appointment.doctor.user.name,
                    email: appointment.doctor.user.email,
                },
            },
            hospital: appointment.hospital ? {
                id: appointment.hospital.id,
                name: appointment.hospital.name,
                city: appointment.hospital.city,
            } : undefined,
        };

        return NextResponse.json({ appointment: formattedAppointment }, { status: 201 });
    } catch (error) {
        console.error("Error creating appointment:", error);
        return NextResponse.json(
            { error: "Failed to create appointment" },
            { status: 500 }
        );
    }
}
