"use server";

import prisma from "@/lib/prisma";
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  parseISO,
  differenceInMinutes,
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

// Update the getAppointmentsData function to support pagination
export async function getAppointmentsData(
  page = 1,
  pageSize = 10
): Promise<AppointmentsData> {
  try {
    // Get total count for pagination
    const totalAppointments = await prisma.appointment.count();

    // Calculate pagination values
    const totalPages = Math.ceil(totalAppointments / pageSize);
    const skip = (page - 1) * pageSize;

    // Get appointments with pagination
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: {
          include: {
            user: true,
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

    // Calculate statistics (this doesn't need pagination)
    const stats = await calculateAppointmentStats(
      (await prisma.appointment.findMany({
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
      })) as AppointmentWithRelations[]
    );

    return {
      appointments: appointments as AppointmentWithRelations[],
      stats,
      pagination: {
        page,
        pageSize,
        totalItems: totalAppointments,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching appointments data:", error);
    throw new Error("Failed to fetch appointments data");
  }
}

async function calculateAppointmentStats(
  appointments: AppointmentWithRelations[]
): Promise<AppointmentStats> {
  // Total appointments
  const totalAppointments = appointments.length;

  // Appointments by status
  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "COMPLETED"
  ).length;
  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === "CANCELED"
  ).length;
  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "PENDING"
  ).length;

  // Upcoming appointments (scheduled in the future with status PENDING)
  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "PENDING" &&
      new Date(appointment.scheduledAt) > now
  ).length;

  // Completion and cancellation rates
  const completionRate =
    totalAppointments > 0
      ? Math.round((completedAppointments / totalAppointments) * 100)
      : 0;
  const cancellationRate =
    totalAppointments > 0
      ? Math.round((cancelledAppointments / totalAppointments) * 100)
      : 0;

  // Average duration
  const appointmentsWithDuration = appointments.filter(
    (appointment) => appointment.endTime && appointment.scheduledAt
  );

  const totalDuration = appointmentsWithDuration.reduce((sum, appointment) => {
    const start = new Date(appointment.scheduledAt!);
    const end = new Date(appointment.endTime!);
    return sum + differenceInMinutes(end, start);
  }, 0);

  const averageDuration =
    appointmentsWithDuration.length > 0
      ? Math.round(totalDuration / appointmentsWithDuration.length)
      : 0;

  // Appointments by day of week
  const dayCount = new Map<string, number>();
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];

  days.forEach((day) => dayCount.set(day, 0));

  appointments.forEach((appointment) => {
    const date = new Date(appointment.scheduledAt);
    const day = days[date.getDay()];
    dayCount.set(day, (dayCount.get(day) || 0) + 1);
  });

  const appointmentsByDay = Array.from(dayCount.entries()).map(
    ([day, count]) => ({
      day,
      count,
    })
  );

  // Find most active day
  const mostActiveDay = appointmentsByDay.reduce(
    (max, current) => (current.count > max.count ? current : max),
    {
      day: "",
      count: 0,
    }
  ).day;

  // Appointments by hour
  const hourCount = new Map<number, number>();

  for (let i = 0; i < 24; i++) {
    hourCount.set(i, 0);
  }

  appointments.forEach((appointment) => {
    const date = new Date(appointment.scheduledAt);
    const hour = date.getHours();
    hourCount.set(hour, (hourCount.get(hour) || 0) + 1);
  });

  const appointmentsByHour = Array.from(hourCount.entries()).map(
    ([hour, count]) => ({
      hour,
      count,
    })
  );

  // Find most active hour
  const mostActiveHour = appointmentsByHour.reduce(
    (max, current) => (current.count > max.count ? current : max),
    {
      hour: 0,
      count: 0,
    }
  ).hour;

  // Appointments by status
  const statusCount = [
    {
      status: "PENDING" as AppointmentStatus,
      count: pendingAppointments,
      percentage:
        totalAppointments > 0
          ? Math.round((pendingAppointments / totalAppointments) * 100)
          : 0,
    },
    {
      status: "COMPLETED" as AppointmentStatus,
      count: completedAppointments,
      percentage:
        totalAppointments > 0
          ? Math.round((completedAppointments / totalAppointments) * 100)
          : 0,
    },
    {
      status: "CANCELLED" as AppointmentStatus,
      count: cancelledAppointments,
      percentage:
        totalAppointments > 0
          ? Math.round((cancelledAppointments / totalAppointments) * 100)
          : 0,
    },
  ];

  // Appointments trend (last 30 days)
  const trendData: {
    date: string;
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
  }[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, "dd MMM", { locale: fr });
    const start = startOfDay(date);
    const end = endOfDay(date);

    const dayAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.scheduledAt);
      return appointmentDate >= start && appointmentDate <= end;
    });

    const dayCompleted = dayAppointments.filter(
      (appointment) => appointment.status === "COMPLETED"
    ).length;

    const dayCancelled = dayAppointments.filter(
      (appointment) => appointment.status === "CANCELED"
    ).length;

    const dayPending = dayAppointments.filter(
      (appointment) => appointment.status === "PENDING"
    ).length;

    trendData.push({
      date: dateStr,
      total: dayAppointments.length,
      completed: dayCompleted,
      cancelled: dayCancelled,
      pending: dayPending,
    });
  }

  // Top doctors
  const doctorMap = new Map<
    string,
    {
      name: string;
      specialization: string;
      appointmentCount: number;
      completedCount: number;
    }
  >();

  appointments.forEach((appointment) => {
    const doctorId = appointment.doctorId;
    const doctorName = appointment.doctor.user.name;
    const specialization = appointment.doctor.specialization;

    if (!doctorMap.has(doctorId)) {
      doctorMap.set(doctorId, {
        name: doctorName,
        specialization,
        appointmentCount: 0,
        completedCount: 0,
      });
    }

    const doctorData = doctorMap.get(doctorId)!;
    doctorData.appointmentCount++;

    if (appointment.status === "COMPLETED") {
      doctorData.completedCount++;
    }
  });

  const topDoctors = Array.from(doctorMap.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      specialization: data.specialization,
      appointmentCount: data.appointmentCount,
      completionRate:
        data.appointmentCount > 0
          ? Math.round((data.completedCount / data.appointmentCount) * 100)
          : 0,
    }))
    .sort((a, b) => b.appointmentCount - a.appointmentCount)
    .slice(0, 5);

  // Top hospitals
  const hospitalMap = new Map<
    string,
    {
      name: string;
      appointmentCount: number;
      completedCount: number;
    }
  >();

  appointments.forEach((appointment) => {
    if (!appointment.doctor.hospital) return;

    const hospitalId = appointment.doctor.hospital.id;
    const hospitalName = appointment.doctor.hospital.name;

    if (!hospitalMap.has(hospitalId)) {
      hospitalMap.set(hospitalId, {
        name: hospitalName,
        appointmentCount: 0,
        completedCount: 0,
      });
    }

    const hospitalData = hospitalMap.get(hospitalId)!;
    hospitalData.appointmentCount++;

    if (appointment.status === "COMPLETED") {
      hospitalData.completedCount++;
    }
  });

  const topHospitals = Array.from(hospitalMap.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      appointmentCount: data.appointmentCount,
      completionRate:
        data.appointmentCount > 0
          ? Math.round((data.completedCount / data.appointmentCount) * 100)
          : 0,
    }))
    .sort((a, b) => b.appointmentCount - a.appointmentCount)
    .slice(0, 5);

  return {
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    pendingAppointments,
    upcomingAppointments,
    completionRate,
    cancellationRate,
    averageDuration,
    mostActiveDay,
    mostActiveHour,
    appointmentsByStatus: statusCount,
    appointmentsByDay,
    appointmentsByHour,
    appointmentsTrend: trendData,
    topDoctors,
    topHospitals,
  };
}

// Update the filterAppointments function to support pagination
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
