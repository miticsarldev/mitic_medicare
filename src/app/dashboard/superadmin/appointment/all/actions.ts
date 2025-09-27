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

interface PaginationOptions {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

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

// async function calculateAppointmentStats(
//   appointments: AppointmentWithRelations[]
// ): Promise<AppointmentStats> {
//   // Total appointments
//   const totalAppointments = appointments.length;

//   // Appointments by status
//   const completedAppointments = appointments.filter(
//     (appointment) => appointment.status === "COMPLETED"
//   ).length;
//   const cancelledAppointments = appointments.filter(
//     (appointment) => appointment.status === "CANCELED"
//   ).length;
//   const pendingAppointments = appointments.filter(
//     (appointment) => appointment.status === "PENDING"
//   ).length;

//   // Upcoming appointments (scheduled in the future with status PENDING)
//   const now = new Date();
//   const upcomingAppointments = appointments.filter(
//     (appointment) =>
//       appointment.status === "PENDING" &&
//       new Date(appointment.scheduledAt) > now
//   ).length;

//   // Completion and cancellation rates
//   const completionRate =
//     totalAppointments > 0
//       ? Math.round((completedAppointments / totalAppointments) * 100)
//       : 0;
//   const cancellationRate =
//     totalAppointments > 0
//       ? Math.round((cancelledAppointments / totalAppointments) * 100)
//       : 0;

//   // Average duration
//   const appointmentsWithDuration = appointments.filter(
//     (appointment) => appointment.endTime && appointment.scheduledAt
//   );

//   const totalDuration = appointmentsWithDuration.reduce((sum, appointment) => {
//     const start = new Date(appointment.scheduledAt!);
//     const end = new Date(appointment.endTime!);
//     return sum + differenceInMinutes(end, start);
//   }, 0);

//   const averageDuration =
//     appointmentsWithDuration.length > 0
//       ? Math.round(totalDuration / appointmentsWithDuration.length)
//       : 0;

//   // Appointments by day of week
//   const dayCount = new Map<string, number>();
//   const days = [
//     "Dimanche",
//     "Lundi",
//     "Mardi",
//     "Mercredi",
//     "Jeudi",
//     "Vendredi",
//     "Samedi",
//   ];

//   days.forEach((day) => dayCount.set(day, 0));

//   appointments.forEach((appointment) => {
//     const date = new Date(appointment.scheduledAt);
//     const day = days[date.getDay()];
//     dayCount.set(day, (dayCount.get(day) || 0) + 1);
//   });

//   const appointmentsByDay = Array.from(dayCount.entries()).map(
//     ([day, count]) => ({
//       day,
//       count,
//     })
//   );

//   // Find most active day
//   const mostActiveDay = appointmentsByDay.reduce(
//     (max, current) => (current.count > max.count ? current : max),
//     {
//       day: "",
//       count: 0,
//     }
//   ).day;

//   // Appointments by hour
//   const hourCount = new Map<number, number>();

//   for (let i = 0; i < 24; i++) {
//     hourCount.set(i, 0);
//   }

//   appointments.forEach((appointment) => {
//     const date = new Date(appointment.scheduledAt);
//     const hour = date.getHours();
//     hourCount.set(hour, (hourCount.get(hour) || 0) + 1);
//   });

//   const appointmentsByHour = Array.from(hourCount.entries()).map(
//     ([hour, count]) => ({
//       hour,
//       count,
//     })
//   );

//   // Find most active hour
//   const mostActiveHour = appointmentsByHour.reduce(
//     (max, current) => (current.count > max.count ? current : max),
//     {
//       hour: 0,
//       count: 0,
//     }
//   ).hour;

//   // Appointments by status
//   const statusCount = [
//     {
//       status: "PENDING" as AppointmentStatus,
//       count: pendingAppointments,
//       percentage:
//         totalAppointments > 0
//           ? Math.round((pendingAppointments / totalAppointments) * 100)
//           : 0,
//     },
//     {
//       status: "COMPLETED" as AppointmentStatus,
//       count: completedAppointments,
//       percentage:
//         totalAppointments > 0
//           ? Math.round((completedAppointments / totalAppointments) * 100)
//           : 0,
//     },
//     {
//       status: "CANCELLED" as AppointmentStatus,
//       count: cancelledAppointments,
//       percentage:
//         totalAppointments > 0
//           ? Math.round((cancelledAppointments / totalAppointments) * 100)
//           : 0,
//     },
//   ];

//   // Appointments trend (last 30 days)
//   const trendData: {
//     date: string;
//     total: number;
//     completed: number;
//     cancelled: number;
//     pending: number;
//   }[] = [];
//   const today = new Date();

//   for (let i = 29; i >= 0; i--) {
//     const date = subDays(today, i);
//     const dateStr = format(date, "dd MMM", { locale: fr });
//     const start = startOfDay(date);
//     const end = endOfDay(date);

//     const dayAppointments = appointments.filter((appointment) => {
//       const appointmentDate = new Date(appointment.scheduledAt);
//       return appointmentDate >= start && appointmentDate <= end;
//     });

//     const dayCompleted = dayAppointments.filter(
//       (appointment) => appointment.status === "COMPLETED"
//     ).length;

//     const dayCancelled = dayAppointments.filter(
//       (appointment) => appointment.status === "CANCELED"
//     ).length;

//     const dayPending = dayAppointments.filter(
//       (appointment) => appointment.status === "PENDING"
//     ).length;

//     trendData.push({
//       date: dateStr,
//       total: dayAppointments.length,
//       completed: dayCompleted,
//       cancelled: dayCancelled,
//       pending: dayPending,
//     });
//   }

//   // Top doctors
//   const doctorMap = new Map<
//     string,
//     {
//       name: string;
//       specialization: string;
//       appointmentCount: number;
//       completedCount: number;
//     }
//   >();

//   appointments.forEach((appointment) => {
//     const doctorId = appointment.doctorId;
//     const doctorName = appointment.doctor.user.name;
//     const specialization = appointment.doctor.specialization;

//     if (!doctorMap.has(doctorId)) {
//       doctorMap.set(doctorId, {
//         name: doctorName,
//         specialization,
//         appointmentCount: 0,
//         completedCount: 0,
//       });
//     }

//     const doctorData = doctorMap.get(doctorId)!;
//     doctorData.appointmentCount++;

//     if (appointment.status === "COMPLETED") {
//       doctorData.completedCount++;
//     }
//   });

//   const topDoctors = Array.from(doctorMap.entries())
//     .map(([id, data]) => ({
//       id,
//       name: data.name,
//       specialization: data.specialization,
//       appointmentCount: data.appointmentCount,
//       completionRate:
//         data.appointmentCount > 0
//           ? Math.round((data.completedCount / data.appointmentCount) * 100)
//           : 0,
//     }))
//     .sort((a, b) => b.appointmentCount - a.appointmentCount)
//     .slice(0, 5);

//   // Top hospitals
//   const hospitalMap = new Map<
//     string,
//     {
//       name: string;
//       appointmentCount: number;
//       completedCount: number;
//     }
//   >();

//   appointments.forEach((appointment) => {
//     if (!appointment.doctor.hospital) return;

//     const hospitalId = appointment.doctor.hospital.id;
//     const hospitalName = appointment.doctor.hospital.name;

//     if (!hospitalMap.has(hospitalId)) {
//       hospitalMap.set(hospitalId, {
//         name: hospitalName,
//         appointmentCount: 0,
//         completedCount: 0,
//       });
//     }

//     const hospitalData = hospitalMap.get(hospitalId)!;
//     hospitalData.appointmentCount++;

//     if (appointment.status === "COMPLETED") {
//       hospitalData.completedCount++;
//     }
//   });

//   const topHospitals = Array.from(hospitalMap.entries())
//     .map(([id, data]) => ({
//       id,
//       name: data.name,
//       appointmentCount: data.appointmentCount,
//       completionRate:
//         data.appointmentCount > 0
//           ? Math.round((data.completedCount / data.appointmentCount) * 100)
//           : 0,
//     }))
//     .sort((a, b) => b.appointmentCount - a.appointmentCount)
//     .slice(0, 5);

//   return {
//     totalAppointments,
//     completedAppointments,
//     cancelledAppointments,
//     pendingAppointments,
//     upcomingAppointments,
//     completionRate,
//     cancellationRate,
//     averageDuration,
//     mostActiveDay,
//     mostActiveHour,
//     appointmentsByStatus: statusCount,
//     appointmentsByDay,
//     appointmentsByHour,
//     appointmentsTrend: trendData,
//     topDoctors,
//     topHospitals,
//   };
// }

// Update the filterAppointments function to support pagination
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
): Promise<{
  appointments: AppointmentWithRelations[];
  pagination: PaginationOptions;
}> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    // Filter by status
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      whereClause.scheduledAt = {};

      if (dateFrom) {
        whereClause.scheduledAt.gte = parseISO(dateFrom);
      }

      if (dateTo) {
        whereClause.scheduledAt.lte = parseISO(dateTo);
      }
    }

    // Filter by doctor
    if (doctorId) {
      whereClause.doctorId = doctorId;
    }

    // Filter by hospital
    if (hospitalId) {
      whereClause.doctor = {
        hospitalId,
      };
    }

    // Filter by specialization
    if (specialization) {
      if (!whereClause.doctor) {
        whereClause.doctor = {};
      }
      whereClause.doctor.specialization = specialization;
    }

    // Search by patient or doctor name
    if (searchQuery) {
      whereClause.OR = [
        {
          patient: {
            name: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          doctor: {
            user: {
              name: {
                contains: searchQuery,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    // Get total count for pagination
    const totalItems = await prisma.appointment.count({
      where: whereClause,
    });

    // Calculate pagination values
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (page - 1) * pageSize;

    // Get filtered appointments with pagination
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          include: {
            user: {
              select: {
                profile: true,
              },
            },
          },
        },
        doctor: {
          include: {
            user: true,
            hospital: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
      skip,
      take: pageSize,
    });

    return {
      appointments: appointments as AppointmentWithRelations[],
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error filtering appointments:", error);
    throw new Error("Failed to filter appointments");
  }
}
