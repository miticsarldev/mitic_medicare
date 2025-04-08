export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
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

        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        const [
            totalDoctors,
            totalPatients,
            totalPrescriptionsToday,
            totalAppointmentsToday,
            doctorsList
        ] = await Promise.all([
            prisma.doctor.count({
                where: { hospitalId },
            }),
            prisma.patient.count({
                where: {
                    user: {
                        hospital: { id: hospitalId },
                    },
                },
            }),
            prisma.prescription.count({
                where: {
                    createdAt: { gte: todayStart, lte: todayEnd },
                    doctor: { hospitalId },
                },
            }),
            prisma.appointment.count({
                where: {
                    hospitalId,
                    scheduledAt: { gte: todayStart, lte: todayEnd },
                },
            }),
            prisma.doctor.findMany({
                where: { hospitalId },
                select: {
                    id: true,
                    specialization: true,
                    user: {
                        select: {
                            name: true,
                        },
                    },
                    department: {
                        select: {
                            name: true,
                        },
                    },
                    availabilities: {
                        where: {
                            createdAt: {
                                gte: todayStart,
                                lte: todayEnd
                            }

                        }
                    },
                    appointments: {
                        where: {
                            scheduledAt: {
                                gte: todayStart,
                                lte: todayEnd,
                            },
                        },
                        select: {
                            id: true,
                        },
                    }
                },
            })
        ]);

        const doctors = doctorsList.map((doc) => ({
            id: doc.id,
            name: doc.user.name,
            specialization: doc.specialization,
            department: doc.department?.name || "Non assigné",
            patientsToday: doc.appointments.length,
        }));

        return NextResponse.json({
            totalDoctors,
            totalPatients,
            totalPrescriptionsToday,
            totalAppointmentsToday,
            doctors, // liste des médecins avec leur état du jour
        });

    } catch (error) {
        console.error("Error fetching hospital dashboard data:", error);
        return NextResponse.json(
            { error: "Failed to fetch hospital dashboard data" },
            { status: 500 }
        );
    }
}
