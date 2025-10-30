export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });

    if (!doctor) {
      return NextResponse.json(
        { message: "Médecin non trouvé" },
        { status: 404 }
      );
    }

    const doctorId = doctor.id;

    // Range parsing (from, to) with default to current month
    const url = new URL(req.url);
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultTo = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    const rangeFrom = fromParam ? new Date(fromParam) : defaultFrom;
    const rangeTo = toParam ? new Date(toParam) : defaultTo;
    const startOfDay = new Date(rangeFrom);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(rangeTo);
    endOfDay.setHours(23, 59, 59, 999);

    // KPIs over the selected range
    const [
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      canceledAppointments,
      noShowAppointments,
    ] = await Promise.all([
      prisma.appointment.count({
        where: { doctorId, scheduledAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.appointment.count({
        where: {
          doctorId,
          status: "PENDING",
          scheduledAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.appointment.count({
        where: {
          doctorId,
          status: "CONFIRMED",
          scheduledAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.appointment.count({
        where: {
          doctorId,
          status: "COMPLETED",
          scheduledAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.appointment.count({
        where: {
          doctorId,
          status: "CANCELED",
          scheduledAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.appointment.count({
        where: {
          doctorId,
          status: "NO_SHOW",
          scheduledAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ]);

    // Build day series between rangeFrom and rangeTo
    const daysSpan = Math.max(
      1,
      Math.ceil(
        (endOfDay.getTime() - startOfDay.getTime()) / (24 * 60 * 60 * 1000)
      ) + 1
    );
    const allDays = Array.from({ length: daysSpan }, (_, i) => {
      const d = new Date(startOfDay);
      d.setDate(startOfDay.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const dailyAppointmentsData = await prisma.$queryRawUnsafe<
      {
        day: Date;
        total: number;
        confirmed: number;
        completed: number;
      }[]
    >(
      `SELECT DATE_TRUNC('day', "scheduledAt") as day,
              COUNT(*)::int as total,
              COUNT(*) FILTER (WHERE status = 'CONFIRMED')::int as confirmed,
              COUNT(*) FILTER (WHERE status = 'COMPLETED')::int as completed
       FROM "Appointment"
       WHERE "scheduledAt" >= $1 AND "scheduledAt" <= $2 AND "doctorId" = $3
       GROUP BY DATE_TRUNC('day', "scheduledAt")
       ORDER BY day ASC`,
      startOfDay,
      endOfDay,
      doctorId
    );

    const mapByDay = new Map<
      string,
      { total: number; confirmed: number; completed: number }
    >();
    for (const row of dailyAppointmentsData) {
      const key = row.day.toISOString().split("T")[0];
      mapByDay.set(key, {
        total: row.total,
        confirmed: row.confirmed,
        completed: row.completed,
      });
    }
    const seriesByDay = allDays.map((d) => {
      const k = d.toISOString().split("T")[0];
      const v = mapByDay.get(k) ?? { total: 0, confirmed: 0, completed: 0 };
      return { date: k, ...v };
    });

    // Données hebdomadaires (patients)
    // Group by type within range
    const appointmentsByType = await prisma.appointment.groupBy({
      by: ["type"],
      where: { doctorId, scheduledAt: { gte: startOfDay, lte: endOfDay } },
      _count: { type: true },
    });
    const byType = appointmentsByType.map((r) => ({
      type: r.type ?? "Non spécifié",
      count: r._count.type,
    }));

    // Rendez-vous en attente
    const pendingAppointmentsList = await prisma.appointment.findMany({
      where: { doctorId: doctorId, status: "PENDING" },
      include: {
        patient: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Avis du médecin
    // Reviews omitted in this response to streamline payload

    // Availability vs appointments per day of week
    const dowLabels = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
    const apptByDOW = await prisma.$queryRawUnsafe<
      { dow: number; count: number }[]
    >(
      `SELECT EXTRACT(DOW FROM "scheduledAt")::int as dow, COUNT(*)::int as count
       FROM "Appointment"
       WHERE "doctorId" = $1 AND "scheduledAt" >= $2 AND "scheduledAt" <= $3
       GROUP BY EXTRACT(DOW FROM "scheduledAt")`,
      doctorId,
      startOfDay,
      endOfDay
    );
    const mapAppt = new Map<number, number>();
    apptByDOW.forEach((r) => mapAppt.set(r.dow, r.count));
    const availabilities = await prisma.doctorAvailability.groupBy({
      by: ["dayOfWeek"],
      where: { doctorId, isActive: true },
      _count: { dayOfWeek: true },
    });
    const mapAvail = new Map<number, number>();
    availabilities.forEach((r) =>
      mapAvail.set(r.dayOfWeek, r._count.dayOfWeek)
    );
    const availabilityVsAppointments = Array.from({ length: 7 }, (_, dow) => ({
      dow,
      label: dowLabels[dow],
      availability: mapAvail.get(dow) ?? 0,
      appointments: mapAppt.get(dow) ?? 0,
    }));

    // Actionable (pending) and upcoming (future confirmed/pending) within range
    const [, /*actionable*/ upcoming] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          doctorId,
          status: "PENDING",
          scheduledAt: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { scheduledAt: "asc" },
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          notes: true,
          patient: {
            select: { user: { select: { name: true, phone: true } } },
          },
        },
      }),
      prisma.appointment.findMany({
        where: {
          doctorId,
          status: { in: ["CONFIRMED", "PENDING"] },
          scheduledAt: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { scheduledAt: "asc" },
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          notes: true,
          patient: {
            select: { user: { select: { name: true, phone: true } } },
          },
        },
      }),
    ]);

    return NextResponse.json({
      range: { from: startOfDay.toISOString(), to: endOfDay.toISOString() },
      doctor: { id: doctorId, name: session.user.name ?? "" },
      kpis: {
        total: totalAppointments,
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        canceled: canceledAppointments,
        noShow: noShowAppointments,
      },
      series: {
        byDay: seriesByDay,
        byType,
        availabilityVsAppointments,
      },
      actionable: pendingAppointmentsList.map((a) => ({
        id: a.id,
        scheduledAt: a.scheduledAt.toISOString(),
        status: "PENDING" as const,
        notes: a.notes ?? null,
        patientName: a.patient.user.name,
        patientPhone: undefined,
      })),
      upcoming: upcoming.map((a) => ({
        id: a.id,
        scheduledAt: a.scheduledAt.toISOString(),
        status: a.status,
        notes: a.notes ?? null,
        patientName: a.patient.user.name,
        patientPhone: a.patient.user.phone ?? null,
      })),
    });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
