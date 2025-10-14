export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getISOWeek, getISOWeekYear, format } from "date-fns";
import { fr } from "date-fns/locale";

type AppointmentWithPatient = {
  id: string;
  scheduledAt: Date;
  status: string;
  patient: { id: string; user: { name: string } };
};

type FormattedAppointment = {
  id: string;
  scheduledAt: string; // ← on renvoie en ISO (string)
  status: string;
  patientId: string;
  patientName: string;
  day: string; // lundi, mardi, ...
};

const weekKeyOf = (d: Date) =>
  `${getISOWeekYear(d)}-S${String(getISOWeek(d)).padStart(2, "0")}`;

const groupAppointmentsByWeek = (appointments: AppointmentWithPatient[]) => {
  const weeks: Record<string, FormattedAppointment[]> = {};
  for (const apt of appointments) {
    const wk = weekKeyOf(apt.scheduledAt);
    (weeks[wk] ||= []).push({
      id: apt.id,
      scheduledAt: apt.scheduledAt.toISOString(),
      status: apt.status,
      patientId: apt.patient.id,
      patientName: apt.patient.user.name,
      day: format(apt.scheduledAt, "EEEE", { locale: fr }).toLowerCase(), // cohérent avec le front
    });
  }
  return weeks;
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const includeInactive = url.searchParams.get("includeInactive") === "true";

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

    const doctors = await prisma.doctor.findMany({
      where: {
        hospitalId: hospital.id,
        user: {
          role: "HOSPITAL_DOCTOR",
          ...(includeInactive ? {} : { isActive: true }),
        },
      },
      select: {
        id: true,
        specialization: true,
        user: { select: { name: true, isActive: true } },
        appointments: {
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            patient: { select: { id: true, user: { select: { name: true } } } },
          },
          orderBy: { scheduledAt: "asc" },
        },
      },
    });

    const formatted = doctors.map((doc) => ({
      id: doc.id,
      name: doc.user.name,
      isActive: doc.user.isActive, // ← NOUVEAU
      specialization: doc.specialization,
      weeklyAppointments: groupAppointmentsByWeek(doc.appointments),
    }));

    return NextResponse.json({ doctors: formatted });
  } catch (error) {
    console.error("Error fetching full schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch full schedule" },
      { status: 500 }
    );
  }
}
