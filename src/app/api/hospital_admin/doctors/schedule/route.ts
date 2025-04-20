
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";

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

        const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Lundi
        const endDate = endOfWeek(new Date(), { weekStartsOn: 1 });     // Dimanche

        const doctors = await prisma.doctor.findMany({
            where: { hospitalId: hospital.id },
            select: {
                id: true,
                specialization: true,
                user: { select: { name: true } },
                appointments: {
                    where: {
                        scheduledAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    select: {
                        id: true,
                        scheduledAt: true,
                        status: true,
                        patient: {
                            select: {
                                user: {
                                    select: { name: true },
                                },
                            },
                        },
                    },
                    orderBy: { scheduledAt: "asc" },
                },
            },
        });

        const formatted = doctors.map((doc) => ({
            id: doc.id,
            name: doc.user.name,
            specialization: doc.specialization,
            schedule: doc.appointments.map((apt) => ({
                id: apt.id,
                scheduledAt: apt.scheduledAt,
                status: apt.status,
                patientName: apt.patient.user.name,
                day: apt.scheduledAt.toLocaleDateString("fr-FR", { weekday: "long" }),
            })),
        }));

        return NextResponse.json({ doctors: formatted });
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
    }
}
