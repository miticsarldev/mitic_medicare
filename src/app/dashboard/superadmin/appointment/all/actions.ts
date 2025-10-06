"use server";

import prisma from "@/lib/prisma";
import {
  format,
  startOfDay,
  endOfDay,
  parseISO,
  differenceInMinutes,
  isValid,
  isAfter,
  addDays,
  isSameDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import type {
  AppointmentsData,
  AppointmentWithRelations,
  AppointmentStats,
} from "./types";
import type { AppointmentStatus } from "@prisma/client";

type WindowParams = {
  page?: number;
  pageSize?: number;
  from?: string; // ISO string from searchParams
  to?: string; // ISO string from searchParams
};

export async function getAppointmentsData({
  page = 1,
  pageSize = 10,
  from,
  to,
}: WindowParams = {}): Promise<AppointmentsData> {
  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;

  const window =
    (fromDate && isValid(fromDate)) || (toDate && isValid(toDate))
      ? {
          gte: fromDate ? startOfDay(new Date(fromDate)) : undefined,
          lte: toDate ? endOfDay(new Date(toDate)) : undefined,
        }
      : undefined;

  const where = window ? { scheduledAt: window } : {};

  const totalAppointments = await prisma.appointment.count({ where });
  const totalPages = Math.ceil(totalAppointments / pageSize);
  const skip = (page - 1) * pageSize;

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true, hospital: true } },
    },
    orderBy: { scheduledAt: "desc" },
    skip,
    take: pageSize,
  });

  // fetch full set for stats (unpaginated)
  const allForStats = (await prisma.appointment.findMany({
    where,
    include: {
      patient: {
        include: {
          user: { select: { profile: true } },
        },
      },
      doctor: { include: { user: true, hospital: true } },
    },
  })) as AppointmentWithRelations[];

  const stats = await calculateAppointmentStats(allForStats, {
    from: window?.gte,
    to: window?.lte,
  });

  return {
    appointments: appointments as AppointmentWithRelations[],
    stats,
    pagination: { page, pageSize, totalItems: totalAppointments, totalPages },
  };
}

type Range = { from?: Date; to?: Date };

export async function calculateAppointmentStats(
  appointments: AppointmentWithRelations[],
  range: Range = {}
): Promise<AppointmentStats> {
  // ---- Totals by status (use "CANCELLED" consistently) ----
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(
    (a) => a.status === "COMPLETED"
  ).length;
  const cancelledAppointments = appointments.filter(
    (a) => a.status === "CANCELED"
  ).length; // FIX
  const pendingAppointments = appointments.filter(
    (a) => a.status === "PENDING"
  ).length;

  // Upcoming = PENDING in the future
  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (a) => a.status === "PENDING" && new Date(a.scheduledAt) > now
  ).length;

  const completionRate =
    totalAppointments > 0
      ? Math.round((completedAppointments / totalAppointments) * 100)
      : 0;
  const cancellationRate =
    totalAppointments > 0
      ? Math.round((cancelledAppointments / totalAppointments) * 100)
      : 0;

  // Average duration (scheduledAt -> endTime)
  const withDuration = appointments.filter((a) => a.endTime && a.scheduledAt);
  const totalDuration = withDuration.reduce((sum, a) => {
    return (
      sum + differenceInMinutes(new Date(a.endTime!), new Date(a.scheduledAt!))
    );
  }, 0);
  const averageDuration =
    withDuration.length > 0
      ? Math.round(totalDuration / withDuration.length)
      : 0;

  // ---- By day of week ----
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  const dayCount = new Map<string, number>(days.map((d) => [d, 0]));
  appointments.forEach((a) => {
    const d = new Date(a.scheduledAt);
    dayCount.set(days[d.getDay()], (dayCount.get(days[d.getDay()]) || 0) + 1);
  });
  const appointmentsByDay = days.map((day) => ({
    day,
    count: dayCount.get(day) || 0,
  }));
  const mostActiveDay =
    appointmentsByDay.reduce(
      (max, cur) => (cur.count > max.count ? cur : max),
      { day: "", count: 0 }
    ).day || "—";

  // ---- By hour ----
  const hourCount = new Map<number, number>(
    Array.from({ length: 24 }, (_, h) => [h, 0])
  );
  appointments.forEach((a) => {
    const h = new Date(a.scheduledAt).getHours();
    hourCount.set(h, (hourCount.get(h) || 0) + 1);
  });
  const appointmentsByHour = Array.from(hourCount.entries()).map(
    ([hour, count]) => ({
      hour,
      count,
    })
  );
  const mostActiveHour =
    appointmentsByHour.reduce(
      (max, cur) => (cur.count > max.count ? cur : max),
      { hour: 0, count: 0 }
    ).hour ?? 0;

  // ---- By status (UI expects PENDING/COMPLETED/CANCELLED) ----
  const appointmentsByStatus = [
    {
      status: "PENDING" as AppointmentStatus,
      count: pendingAppointments,
      percentage: totalAppointments
        ? Math.round((pendingAppointments / totalAppointments) * 100)
        : 0,
    },
    {
      status: "COMPLETED" as AppointmentStatus,
      count: completedAppointments,
      percentage: totalAppointments
        ? Math.round((completedAppointments / totalAppointments) * 100)
        : 0,
    },
    {
      status: "CANCELLED" as AppointmentStatus, // FIX
      count: cancelledAppointments,
      percentage: totalAppointments
        ? Math.round((cancelledAppointments / totalAppointments) * 100)
        : 0,
    },
  ];

  // ---- Trend: respect selected range; otherwise last 30 days ----
  const from = range.from
    ? startOfDay(new Date(range.from))
    : startOfDay(addDays(new Date(), -59));
  const to = range.to ? endOfDay(new Date(range.to)) : endOfDay(new Date());

  // build daily buckets [from..to]
  const trendData: {
    date: string; // ISO yyyy-MM-dd (chart can format)
    label: string; // "dd MMM" (optional for tooltips/labels)
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
  }[] = [];

  for (
    let cursor = startOfDay(new Date(from));
    !isAfter(cursor, to);
    cursor = addDays(cursor, 1)
  ) {
    const dayApps = appointments.filter((a) =>
      isSameDay(new Date(a.scheduledAt), cursor)
    );

    const dayCompleted = dayApps.filter((a) => a.status === "COMPLETED").length;
    const dayCancelled = dayApps.filter((a) => a.status === "CANCELED").length;
    const dayPending = dayApps.filter((a) => a.status === "PENDING").length;

    trendData.push({
      date: format(cursor, "yyyy-MM-dd"), // machine-friendly
      label: format(cursor, "dd MMM", { locale: fr }), // pretty
      total: dayApps.length,
      completed: dayCompleted,
      cancelled: dayCancelled,
      pending: dayPending,
    });
  }

  // ---- Top doctors ----
  const doctorMap = new Map<
    string,
    {
      name: string;
      specialization: string;
      appointmentCount: number;
      completedCount: number;
    }
  >();
  appointments.forEach((a) => {
    const id = a.doctorId;
    const name = a.doctor.user.name;
    const specialization = a.doctor.specialization;
    const entry = doctorMap.get(id) ?? {
      name,
      specialization,
      appointmentCount: 0,
      completedCount: 0,
    };
    entry.appointmentCount += 1;
    if (a.status === "COMPLETED") entry.completedCount += 1;
    doctorMap.set(id, entry);
  });
  const topDoctors = Array.from(doctorMap.entries())
    .map(([id, d]) => ({
      id,
      name: d.name,
      specialization: d.specialization,
      appointmentCount: d.appointmentCount,
      completionRate: d.appointmentCount
        ? Math.round((d.completedCount / d.appointmentCount) * 100)
        : 0,
    }))
    .sort((a, b) => b.appointmentCount - a.appointmentCount)
    .slice(0, 5);

  // ---- Top hospitals ----
  const hospitalMap = new Map<
    string,
    { name: string; appointmentCount: number; completedCount: number }
  >();
  appointments.forEach((a) => {
    const hosp = a.doctor.hospital;
    if (!hosp) return;
    const entry = hospitalMap.get(hosp.id) ?? {
      name: hosp.name,
      appointmentCount: 0,
      completedCount: 0,
    };
    entry.appointmentCount += 1;
    if (a.status === "COMPLETED") entry.completedCount += 1;
    hospitalMap.set(hosp.id, entry);
  });
  const topHospitals = Array.from(hospitalMap.entries())
    .map(([id, h]) => ({
      id,
      name: h.name,
      appointmentCount: h.appointmentCount,
      completionRate: h.appointmentCount
        ? Math.round((h.completedCount / h.appointmentCount) * 100)
        : 0,
    }))
    .sort((a, b) => b.appointmentCount - a.appointmentCount)
    .slice(0, 5);

  return {
    totalAppointments,
    completedAppointments,
    cancelledAppointments, // FIX values
    pendingAppointments,
    upcomingAppointments,
    completionRate,
    cancellationRate,
    averageDuration,
    mostActiveDay,
    mostActiveHour,
    appointmentsByStatus,
    appointmentsByDay,
    appointmentsByHour,
    appointmentsTrend: trendData, // now ISO dates + pretty label
    topDoctors,
    topHospitals,
  };
}

export async function filterAppointments(
  status: string,
  dateFrom: string | null,
  dateTo: string | null,
  searchQuery: string,
  doctorId: string | null,
  hospitalId: string | null,
  specialization: string | null,
  page = 1,
  pageSize = 10
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    // --- Status (normaliser 'CANCELLED' -> 'CANCELED') ---
    if (status && status !== "ALL") {
      whereClause.status = status === "CANCELED" ? "CANCELED" : status;
    }

    // --- Date range ---
    if (dateFrom || dateTo) {
      whereClause.scheduledAt = {};
      if (dateFrom) whereClause.scheduledAt.gte = parseISO(dateFrom);
      if (dateTo) whereClause.scheduledAt.lte = parseISO(dateTo);
    }

    // --- Doctor ---
    if (doctorId && doctorId !== "ALL") whereClause.doctorId = doctorId;

    // --- Hospital ---
    if (hospitalId && hospitalId != "ALL") {
      whereClause.doctor = { ...(whereClause.doctor ?? {}), hospitalId };
    }

    // --- Specialization ---
    if (specialization && specialization !== "ALL") {
      whereClause.doctor = {
        ...(whereClause.doctor ?? {}),
        specialization,
      };
    }

    // --- Search by patient or doctor name (⚠️ via User) ---
    if (searchQuery) {
      whereClause.OR = [
        {
          patient: {
            user: {
              name: { contains: searchQuery, mode: "insensitive" },
            },
          },
        },
        {
          doctor: {
            user: {
              name: { contains: searchQuery, mode: "insensitive" },
            },
          },
        },
      ];
    }

    const totalItems = await prisma.appointment.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (page - 1) * pageSize;

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                profile: { select: { avatarUrl: true } },
              },
            },
          },
        },
        doctor: {
          include: {
            user: { select: { name: true, email: true } },
            hospital: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
      skip,
      take: pageSize,
    });

    return {
      appointments: appointments as AppointmentWithRelations[],
      pagination: { page, pageSize, totalItems, totalPages },
    };
  } catch (error) {
    console.error("Error filtering appointments:", error);
    throw new Error("Failed to filter appointments");
  }
}
