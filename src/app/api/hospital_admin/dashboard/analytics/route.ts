export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { startOfDay, endOfDay, getDay } from "date-fns";

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

        const hospitalId = hospital.id;
        const today = new Date();
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);
        const todayDayOfWeek = getDay(today); // 0 (dimanche) à 6 (samedi)

        const [
            totalDoctors,
            totalPatients,
            totalPrescriptionsToday,
            totalAppointmentsToday,
            doctorsList
        ] = await Promise.all([
            // Compte tous les médecins de l'hôpital
            prisma.doctor.count({ where: { hospitalId } }),
            
            // Compte les patients qui ont pris au moins un RDV dans cet hôpital
            prisma.patient.count({
                where: {
                    appointments: {
                        some: {
                            hospitalId: hospitalId
                        }
                    }
                }
            }),
            
            // Compte les prescriptions faites aujourd'hui par les médecins de cet hôpital
            prisma.prescription.count({
                where: {
                    createdAt: { gte: todayStart, lte: todayEnd },
                    doctor: { hospitalId: hospitalId },
                },
            }),
            
            // Compte les rendez-vous d'aujourd'hui pour cet hôpital
            prisma.appointment.count({
                where: {
                    hospitalId: hospitalId,
                    scheduledAt: { gte: todayStart, lte: todayEnd },
                },
            }),
            
            // Liste des médecins avec leurs stats
            prisma.doctor.findMany({
                where: { hospitalId },
                select: {
                    id: true,
                    specialization: true,
                    user: { select: { name: true } },
                    department: { select: { name: true } },
                    availabilities: {
                        where: { 
                            dayOfWeek: todayDayOfWeek,
                            isActive: true 
                        }
                    },
                    _count: {
                        select: {
                            appointments: {
                                where: {
                                    scheduledAt: { gte: todayStart, lte: todayEnd },
                                    hospitalId: hospitalId
                                }
                            }
                        }
                    }
                },
                take: 10
            })
        ]);

        const doctors = doctorsList.map((doc) => ({
            id: doc.id,
            name: doc.user.name,
            specialization: doc.specialization,
            department: doc.department?.name || "Non assigné",
            availableToday: doc.availabilities.length > 0,
            patientsToday: doc._count.appointments,
        }));

        return NextResponse.json({
            stats: {
                totalDoctors,
                totalPatients,
                totalPrescriptionsToday,
                totalAppointmentsToday,
            },
            doctors,
            date: today.toISOString()
        });

    } catch (error) {
        console.error("Error fetching hospital dashboard data:", error);
        return NextResponse.json(
            { error: "Failed to fetch hospital dashboard data" },
            { status: 500 }
        );
    }
}