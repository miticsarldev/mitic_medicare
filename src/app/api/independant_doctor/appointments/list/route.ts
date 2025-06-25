export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AppointmentStatus, Prisma } from "@prisma/client";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "INDEPENDENT_DOCTOR") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // On récupère le doctor lié à l'utilisateur connecté
        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        // Optional: filtre par status si fourni
        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get("status") as AppointmentStatus | null;

        const whereConditions: Prisma.AppointmentWhereInput = {
            doctorId: doctor.id,
            ...(statusFilter ? { status: statusFilter } : {}),
        };

        const appointments = await prisma.appointment.findMany({
            where: whereConditions,
            orderBy: { scheduledAt: "desc" },
            select: {
                id: true,
                scheduledAt: true,
                status: true,
                type: true,
                reason: true,
                doctor: {
                    select: {
                        id: true,
                        user: { select: { name: true } },
                        specialization: true,
                        department: { select: { name: true } },
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
                                profile: { select: { genre: true } },
                            },
                        },
                    },
                },
                medicalRecord: {
                    select: {
                        id: true,
                        diagnosis: true,
                        treatment: true,
                        notes: true,
                        followUpNeeded: true,
                        followUpDate: true,
                        createdAt: true,
                        updatedAt: true,
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
                        prescription: {
                            select: {
                                id: true,
                                medicationName: true,
                                dosage: true,
                                frequency: true,
                                duration: true,
                                instructions: true,
                                isActive: true,
                                startDate: true,
                                endDate: true,
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
            medicalRecord: apt.medicalRecord
                ? {
                    id: apt.medicalRecord.id,
                    diagnosis: apt.medicalRecord.diagnosis,
                    treatment: apt.medicalRecord.treatment,
                    notes: apt.medicalRecord.notes,
                    followUpNeeded: apt.medicalRecord.followUpNeeded,
                    followUpDate: apt.medicalRecord.followUpDate,
                    createdAt: apt.medicalRecord.createdAt,
                    updatedAt: apt.medicalRecord.updatedAt,
                    attachments: apt.medicalRecord.attachments.map((att) => ({
                        id: att.id,
                        fileName: att.fileName,
                        fileType: att.fileType,
                        fileUrl: att.fileUrl,
                        fileSize: att.fileSize,
                        uploadedAt: att.uploadedAt,
                    })),
                    prescriptions: apt.medicalRecord.prescription.map((presc) => ({
                        id: presc.id,
                        medicationName: presc.medicationName,
                        dosage: presc.dosage,
                        frequency: presc.frequency,
                        duration: presc.duration,
                        instructions: presc.instructions,
                        isActive: presc.isActive,
                        startDate: presc.startDate,
                        endDate: presc.endDate,
                    })),
                }
                : null,
        }));

        return NextResponse.json({
            appointments: formatted,
        });
    } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        return NextResponse.json(
            { error: "Failed to fetch doctor appointments" },
            { status: 500 }
        );
    }
}
