import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { endOfDay, startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Médecin (hôpital) courant
  const doctor = await prisma.doctor.findFirst({
    where: { userId: session.user.id, isIndependent: false },
  });

  if (!doctor)
    return NextResponse.json({ error: "Médecin non trouvé" }, { status: 404 });

  // Hopital
  if (!doctor.hospitalId)
    return NextResponse.json(
      { error: "Médecin sans hôpital" },
      { status: 404 }
    );

  const hospital = await prisma.hospital.findUnique({
    where: { id: doctor.hospitalId },
    select: { id: true, name: true },
  });
  if (!hospital)
    return NextResponse.json(
      { error: "Hôpital non trouvé pour ce médecin" },
      { status: 404 }
    );

  const { searchParams } = new URL(req.url);
  const from = new Date(searchParams.get("from") || new Date().toISOString());
  const to = new Date(searchParams.get("to") || new Date().toISOString());

  // RDV de la plage
  const appts = await prisma.appointment.findMany({
    where: { doctorId: doctor.id, scheduledAt: { gte: from, lte: to } },
    include: { patient: { include: { user: true } } },
    orderBy: { scheduledAt: "asc" },
  });

  // KPIs
  const countBy = (s) => appts.filter((a) => a.status === s).length;
  const total = appts.length;
  const pending = countBy("PENDING");
  const confirmed = countBy("CONFIRMED");
  const completed = countBy("COMPLETED");
  const canceled = countBy("CANCELED");
  const noShow = countBy("NO_SHOW");

  let revenueXOF = "0";
  try {
    if (doctor.consultationFee) {
      const fee = Number(doctor.consultationFee);
      revenueXOF = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        minimumFractionDigits: 0,
      }).format(fee * completed);
    }
  } catch {}

  // Série par jour
  const daily = new Map<
    string,
    { date: string; total: number; confirmed: number; completed: number }
  >();
  for (const a of appts) {
    const key = startOfDay(a.scheduledAt).toISOString();
    const row = daily.get(key) ?? {
      date: key,
      total: 0,
      confirmed: 0,
      completed: 0,
    };
    row.total += 1;
    if (a.status === "CONFIRMED") row.confirmed += 1;
    if (a.status === "COMPLETED") row.completed += 1;
    daily.set(key, row);
  }
  const byDay = Array.from(daily.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Répartition par type
  const typeMap = new Map<string, number>();
  for (const a of appts)
    typeMap.set(a.type ?? "Autre", (typeMap.get(a.type ?? "Autre") ?? 0) + 1);
  const byType = Array.from(typeMap.entries()).map(([type, count]) => ({
    type,
    count,
  }));

  // Prochains / Actionnables
  const now = new Date();
  const upcoming = appts
    .filter((a) => a.scheduledAt >= now)
    .slice(0, 20)
    .map((a) => ({
      id: a.id,
      scheduledAt: a.scheduledAt.toISOString(),
      status: a.status,
      type: a.type,
      notes: a.notes,
      patientName: a.patient.user.name,
      patientPhone: a.patient.user.phone ?? null,
    }));

  const actionable = appts
    .filter((a) => a.status === "PENDING")
    .slice(0, 15)
    .map((a) => ({
      id: a.id,
      scheduledAt: a.scheduledAt.toISOString(),
      status: a.status,
      type: a.type,
      notes: a.notes,
      patientName: a.patient.user.name,
      patientPhone: a.patient.user.phone ?? null,
    }));

  // --- Disponibilités vs RDV par jour de semaine (0=dim..6=sam) ---
  const availabilities = await prisma.doctorAvailability.findMany({
    where: { doctorId: doctor.id, isActive: true },
  });

  const frShort = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const minutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
    return h * 60 + (m || 0);
  };
  const datesInRange = (from: Date, to: Date) => {
    const out: Date[] = [];
    for (
      let d = new Date(startOfDay(from));
      d <= endOfDay(to);
      d = new Date(d.getTime() + 86400000)
    ) {
      out.push(d);
    }
    return out;
  };

  const availabilityCountByDow = new Array(7).fill(0);
  for (const d of datesInRange(from, to)) {
    const dow = d.getDay();
    for (const a of availabilities) {
      if (a.dayOfWeek !== dow) continue;
      const dur = minutes(a.endTime) - minutes(a.startTime);
      if (dur > 0 && a.slotDuration > 0) {
        availabilityCountByDow[dow] += Math.floor(dur / a.slotDuration);
      }
    }
  }

  const apptCountByDow = new Array(7).fill(0);
  for (const a of appts) apptCountByDow[new Date(a.scheduledAt).getDay()] += 1;

  // Ordre Lun→Dim
  const order = [1, 2, 3, 4, 5, 6, 0];
  const availabilityVsAppointments = order.map((dow) => ({
    dow,
    label: frShort[dow],
    availability: availabilityCountByDow[dow] ?? 0,
    appointments: apptCountByDow[dow] ?? 0,
  }));

  return NextResponse.json({
    range: { from: from.toISOString(), to: to.toISOString() },
    hospital,
    doctor: {
      id: doctor.id,
      name: session.user.name || "",
    },
    kpis: {
      total,
      pending,
      confirmed,
      completed,
      canceled,
      noShow,
      revenueXOF,
    },
    series: { byDay, byType, availabilityVsAppointments },
    upcoming,
    actionable,
  });
}
