export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  startOfDay,
  endOfDay,
  getDay,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";

/** helpers */
function resolveWindow(params: URLSearchParams): {
  start?: Date;
  end?: Date;
  isToday?: boolean;
} {
  const now = new Date();
  const toParam = params.get("to");
  const fromParam = params.get("from");

  if (fromParam || toParam) {
    return {
      start: fromParam ? new Date(fromParam) : undefined,
      end: toParam ? new Date(toParam) : now,
      isToday: false,
    };
  }

  const w = (params.get("window") || "").toLowerCase();
  switch (w) {
    case "":
      return { start: startOfDay(now), end: endOfDay(now), isToday: true }; // default: today
    case "all":
    case "alltime":
    case "all-time":
    case "tout":
      return { isToday: false };
    case "1d":
    case "day":
    case "oneday":
      return { start: startOfDay(now), end: endOfDay(now), isToday: true };
    case "3d":
      return { start: subDays(now, 3), end: now, isToday: false };
    case "1w":
    case "week":
      return { start: subWeeks(now, 1), end: now, isToday: false };
    case "1m":
    case "month":
      return { start: subMonths(now, 1), end: now, isToday: false };
    case "2m":
      return { start: subMonths(now, 2), end: now, isToday: false };
    case "3m":
    case "trimestre":
    case "trimester":
    case "quarter":
      return { start: subMonths(now, 3), end: now, isToday: false };
    case "6m":
      return { start: subMonths(now, 6), end: now, isToday: false };
    case "1y":
    case "year":
      return { start: subMonths(now, 12), end: now, isToday: false };
    default:
      return { start: startOfDay(now), end: endOfDay(now), isToday: true };
  }
}

function withDate(
  field: "scheduledAt" | "createdAt",
  start?: Date,
  end?: Date
) {
  if (!start && !end) return {};
  return {
    [field]: {
      ...(start ? { gte: start } : {}),
      ...(end ? { lte: end } : {}),
    },
  };
}

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
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    const hospitalId = hospital.id;
    const { start, end, isToday } = resolveWindow(request.nextUrl.searchParams);

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const todayDayOfWeek = getDay(today);

    // 🔧 FIX: build a valid date filter for appointments
    const apptDateWhere = isToday
      ? { scheduledAt: { gte: todayStart, lte: todayEnd } }
      : withDate("scheduledAt", start, end); // returns { scheduledAt: {...} } or {}

    const [
      totalDoctors,
      totalPatients,
      totalPrescriptions,
      totalAppointments,
      doctorsList,
    ] = await Promise.all([
      prisma.doctor.count({
        where: { hospitalId, user: { role: "HOSPITAL_DOCTOR" } },
      }),
      prisma.patient.count({
        where: { appointments: { some: { hospitalId } } },
      }),
      prisma.prescription.count({
        where: {
          doctor: { hospitalId },
          ...withDate("createdAt", start, end),
        },
      }),
      prisma.appointment.count({
        where: {
          hospitalId,
          ...withDate("scheduledAt", start, end),
        },
      }),
      prisma.doctor.findMany({
        where: { hospitalId, user: { role: "HOSPITAL_DOCTOR" } },
        select: {
          id: true,
          specialization: true,
          user: { select: { name: true } },
          department: { select: { name: true } },
          // availability is still “today”-based (UX choice)
          availabilities: {
            where: { dayOfWeek: todayDayOfWeek, isActive: true },
          },
          _count: {
            select: {
              appointments: {
                where: {
                  hospitalId,
                  // 🔧 FIX: spread the valid object that INCLUDES the scheduledAt key
                  ...apptDateWhere,
                },
              },
            },
          },
        },
        take: 50,
      }),
    ]);

    const doctors = doctorsList
      .map((doc) => ({
        id: doc.id,
        name: doc.user?.name || "—",
        specialization: doc.specialization,
        department: doc.department?.name || "Non assigné",
        availableToday: doc.availabilities.length > 0,
        patientsToday: doc._count.appointments,
      }))
      .sort((a, b) => b.patientsToday - a.patientsToday)
      .slice(0, 10);

    return NextResponse.json({
      stats: {
        totalDoctors,
        totalPatients,
        totalPrescriptionsToday: totalPrescriptions,
        totalAppointmentsToday: totalAppointments,
      },
      doctors,
      date: today.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching hospital dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospital dashboard data" },
      { status: 500 }
    );
  }
}
