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
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";

/** Resolve a relative or explicit date window from query params */
function resolveWindow(params: URLSearchParams): { start?: Date; end?: Date } {
  const now = new Date();
  const toParam = params.get("to");
  const fromParam = params.get("from");

  if (fromParam || toParam) {
    return {
      start: fromParam ? new Date(fromParam) : undefined,
      end: toParam ? new Date(toParam) : now,
    };
  }

  const w = (params.get("window") || "").toLowerCase();
  switch (w) {
    case "all":
    case "alltime":
    case "all-time":
    case "tout":
      return {}; // no date filter

    case "1d":
    case "day":
    case "oneday":
      return { start: subDays(now, 1), end: now };

    case "3d":
      return { start: subDays(now, 3), end: now };

    case "1w":
    case "week":
      return { start: subWeeks(now, 1), end: now };

    case "1m":
    case "month":
      return { start: subMonths(now, 1), end: now };

    case "2m":
      return { start: subMonths(now, 2), end: now };

    case "3m":
    case "trimestre":
    case "trimester":
    case "quarter":
      return { start: subMonths(now, 3), end: now };

    case "6m":
      return { start: subMonths(now, 6), end: now };

    case "1y":
    case "year":
      return { start: subMonths(now, 12), end: now };

    default:
      // default to last 6 months if window not provided
      return { start: subMonths(now, 6), end: now };
  }
}

/** Build a Prisma where snippet for date fields */
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

    const type = request.nextUrl.searchParams.get("type") || "doctorStats";
    const subType =
      request.nextUrl.searchParams.get("subType") || "statusDistribution";
    const { start, end } = resolveWindow(request.nextUrl.searchParams);

    // 🟦 1) Doctor stats (count of doctors created in buckets)
    if (type === "doctorStats") {
      const bucket = request.nextUrl.searchParams.get("range") || "monthly";
      const now = new Date();
      const startBound =
        start ?? new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const endBound = end ?? endOfMonth(now);

      let intervals: Date[] = [];
      let formatLabel: (date: Date) => string;

      if (bucket === "daily") {
        intervals = eachDayOfInterval({ start: startBound, end: endBound });
        formatLabel = (date) => format(date, "d MMM", { locale: fr });
      } else if (bucket === "weekly") {
        intervals = eachWeekOfInterval({ start: startBound, end: endBound });
        formatLabel = (date) => `Semaine ${format(date, "w", { locale: fr })}`;
      } else {
        intervals = eachMonthOfInterval({ start: startBound, end: endBound });
        formatLabel = (date) => format(date, "MMMM", { locale: fr });
      }

      const results = await Promise.all(
        intervals.map(async (date) => {
          let from: Date, to: Date;
          if (bucket === "daily") {
            from = startOfDay(date);
            to = endOfDay(date);
          } else if (bucket === "weekly") {
            from = startOfWeek(date, { weekStartsOn: 1 });
            to = endOfWeek(date, { weekStartsOn: 1 });
          } else {
            from = startOfMonth(date);
            to = endOfMonth(date);
          }

          const count = await prisma.doctor.count({
            where: {
              hospitalId: hospital.id,
              user: {
                role: "HOSPITAL_DOCTOR",
              },
              ...withDate("createdAt", from, to),
            },
          });

          return { month: formatLabel(date), value: count };
        })
      );

      return NextResponse.json(results);
    }

    // 🟩 2) Patients by department (unique patients per department) within window
    if (type === "patientsByDepartment") {
      const appts = await prisma.appointment.findMany({
        where: {
          hospitalId: hospital.id,
          ...withDate("scheduledAt", start, end),
        },
        select: {
          patientId: true,
          doctor: {
            select: { department: { select: { id: true, name: true } } },
          },
        },
      });

      const map = new Map<string, { name: string; set: Set<string> }>();
      for (const a of appts) {
        const dept = a.doctor?.department;
        if (!dept) continue;
        if (!map.has(dept.id))
          map.set(dept.id, { name: dept.name, set: new Set() });
        map.get(dept.id)!.set.add(a.patientId);
      }

      const departmentData = Array.from(map.values())
        .map((v) => ({ name: v.name, value: v.set.size }))
        .filter((d) => d.value > 0);

      return NextResponse.json(departmentData);
    }

    // 🟨 3) Appointments analytics (status / timeSeries / topDoctors / cancellations)
    if (type === "appointments") {
      const bucket = request.nextUrl.searchParams.get("range") || "monthly";
      const now = new Date();
      const startBound = start ?? subMonths(now, 6);
      const endBound = end ?? now;

      // 3.1 Status distribution (in window)
      if (subType === "statusDistribution") {
        const statusCounts = await prisma.appointment.groupBy({
          by: ["status"],
          _count: { _all: true },
          where: {
            hospitalId: hospital.id,
            ...withDate("scheduledAt", startBound, endBound),
          },
        });

        return NextResponse.json(
          statusCounts.map(({ status, _count }) => ({
            name: status,
            value: _count._all,
          }))
        );
      }

      // 3.2 Time series (bucketed within window)
      if (subType === "timeSeries") {
        let intervals: Date[] = [];
        let formatLabel: (date: Date) => string;

        if (bucket === "daily") {
          intervals = eachDayOfInterval({ start: startBound, end: endBound });
          formatLabel = (date) => format(date, "d MMM", { locale: fr });
        } else if (bucket === "weekly") {
          intervals = eachWeekOfInterval({ start: startBound, end: endBound });
          formatLabel = (date) =>
            `Semaine ${format(date, "w", { locale: fr })}`;
        } else {
          intervals = eachMonthOfInterval({ start: startBound, end: endBound });
          formatLabel = (date) => format(date, "MMMM", { locale: fr });
        }

        const results = await Promise.all(
          intervals.map(async (date) => {
            let from: Date, to: Date;
            if (bucket === "daily") {
              from = startOfDay(date);
              to = endOfDay(date);
            } else if (bucket === "weekly") {
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
                status: "COMPLETED",
              },
            });

            return { period: formatLabel(date), appointments: count };
          })
        );

        return NextResponse.json(results);
      }

      // 3.3 Top doctors (ONLY doctors of this hospital) in window
      if (subType === "topDoctors") {
        const grouped = await prisma.appointment.groupBy({
          by: ["doctorId"],
          _count: { _all: true },
          where: {
            hospitalId: hospital.id,
            ...withDate("scheduledAt", startBound, endBound),
          },
        });

        const sorted = grouped.sort((a, b) => b._count._all - a._count._all);
        const topIds = sorted.slice(0, 12).map((g) => g.doctorId);

        const docs = await prisma.doctor.findMany({
          where: {
            id: { in: topIds },
            hospitalId: hospital.id,
            user: { role: "HOSPITAL_DOCTOR" },
          },
          select: {
            id: true,
            specialization: true,
            user: { select: { name: true } },
          },
        });
        const docMap = new Map(docs.map((d) => [d.id, d]));

        const final = sorted
          .filter((g) => docMap.has(g.doctorId))
          .slice(0, 5)
          .map((g) => {
            const d = docMap.get(g.doctorId)!;
            return {
              name: d.user.name || "Médecin inconnu",
              specialization: d.specialization,
              appointments: g._count._all,
            };
          });

        return NextResponse.json(final);
      }

      // 3.4 Cancellation rate (in window)
      if (subType === "cancellationRate") {
        const [total, cancelled] = await Promise.all([
          prisma.appointment.count({
            where: {
              hospitalId: hospital.id,
              ...withDate("scheduledAt", startBound, endBound),
            },
          }),
          prisma.appointment.count({
            where: {
              hospitalId: hospital.id,
              status: "CANCELED",
              ...withDate("scheduledAt", startBound, endBound),
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

    return NextResponse.json(
      { error: "Invalid type parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
