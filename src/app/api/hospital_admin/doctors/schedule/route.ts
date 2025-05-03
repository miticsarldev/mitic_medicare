import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { format, getWeek, getYear } from "date-fns";


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

        const doctors = await prisma.doctor.findMany({
            where: { hospitalId: hospital.id },
            select: {
                id: true,
                specialization: true,
                user: { select: { name: true } },
                appointments: {
                    select: {
                        id: true,
                        scheduledAt: true,
                        status: true,
                        patient: {
                            select: {
                                id: true,
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

        // Fonction pour grouper les rendez-vous par semaine
        const groupAppointmentsByWeek = (appointments: any[]) => {
            const weeks: Record<string, any[]> = {};

            for (const apt of appointments) {
                const weekKey = `${getYear(apt.scheduledAt)}-S${getWeek(apt.scheduledAt)}`;

                if (!weeks[weekKey]) {
                    weeks[weekKey] = [];
                }

                weeks[weekKey].push({
                    id: apt.id,
                    scheduledAt: apt.scheduledAt,
                    status: apt.status,
                    patientId: apt.patient.id,
                    patientName: apt.patient.user.name,
                    day: apt.scheduledAt.toLocaleDateString("fr-FR", { weekday: "long" }),
                });
            }

            return weeks;
        };

        const formatted = doctors.map((doc) => ({
            id: doc.id,
            name: doc.user.name,
            specialization: doc.specialization,
            weeklyAppointments: groupAppointmentsByWeek(doc.appointments),
        }));

        return NextResponse.json({ doctors: formatted });
    } catch (error) {
        console.error("Error fetching full schedule:", error);
        return NextResponse.json({ error: "Failed to fetch full schedule" }, { status: 500 });
    }
}
