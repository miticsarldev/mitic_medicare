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
        if (!session || !["HOSPITAL_DOCTOR", "INDEPENDENT_DOCTOR"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
            select: { id: true, hospitalId: true },
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        const type = request.nextUrl.searchParams.get("type") || "availability";
        const range = request.nextUrl.searchParams.get("range") || "weekly";
        const period = request.nextUrl.searchParams.get("period") || "current"; // current | past

        const now = new Date();
        let startDate: Date, endDate: Date;

        // Définir la période demandée
        if (period === "past") {
            startDate = subMonths(now, 6);
            endDate = now;
        } else {
            // Période courante (semaine/mois en cours)
            if (range === "daily") {
                startDate = startOfDay(now);
                endDate = endOfDay(now);
            } else if (range === "weekly") {
                startDate = startOfWeek(now, { weekStartsOn: 1 });
                endDate = endOfWeek(now, { weekStartsOn: 1 });
            } else {
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
            }
        }

        // 🟦 1. Créneaux disponibles vs réservés (stacked bar chart)
        if (type === "availability") {
            // Récupérer les disponibilités du médecin
            const availabilities = await prisma.doctorAvailability.findMany({
                where: { doctorId: doctor.id, isActive: true },
                orderBy: { dayOfWeek: "asc" },
            });

            // Récupérer les rendez-vous pour la période
            const appointments = await prisma.appointment.findMany({
                where: {
                    doctorId: doctor.id,
                    scheduledAt: { gte: startDate, lte: endDate },
                },
                select: { scheduledAt: true, status: true },
            });

            // Formater les données pour le graphique
            const daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

            const availabilityData = daysOfWeek.map((dayName, dayIndex) => {
                const dayAvailabilities = availabilities.filter(avail => avail.dayOfWeek === dayIndex);
                
                if (dayAvailabilities.length === 0) {
                    return {
                        day: dayName,
                        available: 0,
                        booked: 0,
                        total: 0
                    };
                }

                // Calculer le nombre total de créneaux disponibles
                const totalSlots = dayAvailabilities.reduce((total, avail) => {
                    const start = parseInt(avail.startTime.split(":")[0]);
                    const end = parseInt(avail.endTime.split(":")[0]);
                    const slotDuration = avail.slotDuration || 60; // en minutes
                    return total + ((end - start) * 60 / slotDuration);
                }, 0);

                // Compter les rendez-vous pour ce jour
                const dayAppointments = appointments.filter(appt => {
                    const apptDay = appt.scheduledAt.getDay();
                    return apptDay === dayIndex;
                });

                return {
                    day: dayName,
                    available: totalSlots - dayAppointments.length,
                    booked: dayAppointments.length,
                    total: totalSlots
                };
            });

            return NextResponse.json(availabilityData.filter(day => day.total > 0));
        }

        // 🟩 2. Nombre de consultations par jour/semaine/mois (bar chart)
        if (type === "appointments") {
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
                            doctorId: doctor.id,
                            scheduledAt: { gte: from, lte: to },
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

        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}