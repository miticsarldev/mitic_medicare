export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
    eachDayOfInterval,
    eachWeekOfInterval,
    eachMonthOfInterval,
    format,
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";

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

        const type = request.nextUrl.searchParams.get("type") || "doctorStats";
        const subType = request.nextUrl.searchParams.get("subType") || "statusDistribution";

        // 🟦 Logique 1 : Stats mensuelles / hebdos / journalières sur les médecins
        if (type === "doctorStats") {
            const range = request.nextUrl.searchParams.get("range") || "monthly";
            const now = new Date();
            const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1); // 6 mois en arrière
            const endDate = endOfMonth(now);

            let intervals: Date[] = [];
            let formatLabel: (date: Date) => string;

            if (range === "daily") {
                intervals = eachDayOfInterval({ start: startDate, end: endDate });
                formatLabel = (date) => format(date, "d MMM", { locale: fr });
            } else if (range === "weekly") {
                intervals = eachWeekOfInterval({ start: startDate, end: endDate });
                formatLabel = (date) => `Semaine ${format(date, "w", { locale: fr })}`;
            } else {
                intervals = eachMonthOfInterval({ start: startDate, end: endDate });
                formatLabel = (date) => format(date, "MMMM", { locale: fr });
            }

            const results = await Promise.all(
                intervals.map(async (date) => {
                    let from: Date, to: Date;

                    if (range === "daily") {
                        from = startOfDay(date);
                        to = endOfDay(date);
                    } else if (range === "weekly") {
                        from = startOfWeek(date, { weekStartsOn: 1 });
                        to = endOfWeek(date, { weekStartsOn: 1 });
                    } else {
                        from = startOfMonth(date);
                        to = endOfMonth(date);
                    }

                    const count = await prisma.doctor.count({
                        where: {
                            hospitalId: hospital.id,
                            createdAt: {
                                gte: from,
                                lte: to,
                            },
                        },
                    });

                    return {
                        month: formatLabel(date),
                        value: count,
                    };
                })
            );

            return NextResponse.json(results);
        }

        // 🟩 Logique 2 : Répartition des patients par département
        if (type === "patientsByDepartment") {
            const departments = await prisma.department.findMany({
                where: { hospitalId: hospital.id },
                include: {
                    doctors: {
                        include: {
                            appointments: {
                                select: { patientId: true },
                            },
                        },
                    },
                },
            });

            const departmentData = departments
                .map((department) => {
                    const patientIds = new Set<string>();
                    department.doctors.forEach((doctor) => {
                        doctor.appointments.forEach((appt) => {
                            if (appt.patientId) patientIds.add(appt.patientId);
                        });
                    });

                    return {
                        name: department.name,
                        value: patientIds.size,
                    };
                })
                .filter((dept) => dept.value > 0);

            return NextResponse.json(departmentData);
        }

        // 🟨 Logique 3 : Rendez-vous & Consultations (remplace consultationTypesAllTime)
        if (type === "appointments") {
            const range = request.nextUrl.searchParams.get("range") || "monthly";
            const now = new Date();
            const startDate = subMonths(now, 6); // 6 mois en arrière
            const endDate = now;

            // Sous-type 1 : Répartition par statut
            if (subType === "statusDistribution") {
                const statusCounts = await prisma.appointment.groupBy({
                    by: ['status'],
                    _count: { _all: true },
                    where: {
                        hospitalId: hospital.id,
                        scheduledAt: { gte: startDate, lte: endDate }
                    },
                });

                return NextResponse.json(
                    statusCounts.map(({ status, _count }) => ({
                        name: status,
                        value: _count._all,
                    }))
                );
            }

            // Sous-type 2 : Évolution temporelle
            if (subType === "timeSeries") {
                let intervals: Date[] = [];
                let formatLabel: (date: Date) => string;

                if (range === "daily") {
                    intervals = eachDayOfInterval({ start: startDate, end: endDate });
                    formatLabel = (date) => format(date, "d MMM", { locale: fr });
                } else if (range === "weekly") {
                    intervals = eachWeekOfInterval({ start: startDate, end: endDate });
                    formatLabel = (date) => `Semaine ${format(date, "w", { locale: fr })}`;
                } else {
                    intervals = eachMonthOfInterval({ start: startDate, end: endDate });
                    formatLabel = (date) => format(date, "MMMM", { locale: fr });
                }

                const results = await Promise.all(
                    intervals.map(async (date) => {
                        let from: Date, to: Date;

                        if (range === "daily") {
                            from = startOfDay(date);
                            to = endOfDay(date);
                        } else if (range === "weekly") {
                            from = startOfWeek(date, { weekStartsOn: 1 });
                            to = endOfWeek(date, { weekStartsOn: 1 });
                        } else {
                            from = startOfMonth(date);
                            to = endOfMonth(date);
                        }

                        const count = await prisma.appointment.count({
                            where: {
                                hospitalId: hospital.id,
                                scheduledAt: { gte: from, lte: to },
                                status: "COMPLETED", // On peut filtrer par statut si besoin
                            },
                        });

                        return {
                            period: formatLabel(date),
                            appointments: count,
                        };
                    })
                );

                return NextResponse.json(results);
            }

            // Sous-type 3 : Médecins les plus sollicités
            if (subType === "topDoctors") {
                const topDoctors = await prisma.appointment.groupBy({
                    by: ['doctorId'],
                    _count: { _all: true },
                    where: {
                        hospitalId: hospital.id,
                        scheduledAt: { gte: startDate, lte: endDate }
                    },
                    orderBy: { _count: { doctorId: "desc" } },
                    take: 5,
                });

                // Récupérer les noms des médecins
                const doctorsWithNames = await Promise.all(
                    topDoctors.map(async ({ doctorId, _count }) => {
                        const doctor = await prisma.doctor.findUnique({
                            where: { id: doctorId },
                            select: {
                                user: { select: { name: true } },
                                specialization: true
                            },
                        });
                        return {
                            name: doctor?.user.name || "Médecin inconnu",
                            specialization: doctor?.specialization,
                            appointments: _count._all,
                        };
                    })
                );

                return NextResponse.json(doctorsWithNames);
            }

            // Sous-type 4 : Taux d'annulation
            if (subType === "cancellationRate") {
                const [total, cancelled] = await Promise.all([
                    prisma.appointment.count({
                        where: {
                            hospitalId: hospital.id,
                            scheduledAt: { gte: startDate, lte: endDate }
                        },
                    }),
                    prisma.appointment.count({
                        where: {
                            hospitalId: hospital.id,
                            status: "CANCELED",
                            scheduledAt: { gte: startDate, lte: endDate }
                        },
                    }),
                ]);

                return NextResponse.json({
                    totalAppointments: total,
                    cancelledAppointments: cancelled,
                    cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
                });
            }
        }

        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
