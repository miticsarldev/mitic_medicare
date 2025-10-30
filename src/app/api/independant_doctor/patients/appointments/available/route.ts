import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfDay, endOfDay } from "date-fns";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return h * 60 + (m || 0);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dateStr = req.nextUrl.searchParams.get("date"); // expected YYYY-MM-DD
  if (!dateStr) {
    return NextResponse.json(
      { error: "Paramètre 'date' requis (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const doctor = await prisma.doctor.findFirst({
    where: { userId: session.user.id },
  });
  if (!doctor)
    return NextResponse.json({ error: "Médecin non trouvé" }, { status: 404 });

  const day = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = day.getDay();

  const availabilities = await prisma.doctorAvailability.findMany({
    where: { doctorId: doctor.id, dayOfWeek, isActive: true },
    orderBy: { startTime: "asc" },
  });

  if (availabilities.length === 0) return NextResponse.json({ slots: [] });

  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      scheduledAt: { gte: dayStart, lte: dayEnd },
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
    },
    select: { scheduledAt: true },
  });

  const bookedMinutes = new Set<number>();
  for (const a of appointments) {
    const mins = a.scheduledAt.getHours() * 60 + a.scheduledAt.getMinutes();
    bookedMinutes.add(mins);
  }

  const allSlots: { label: string; iso: string }[] = [];
  for (const av of availabilities) {
    const startM = toMinutes(av.startTime);
    const endM = toMinutes(av.endTime);
    const step = av.slotDuration || 60;
    for (let m = startM; m + step <= endM; m += step) {
      if (bookedMinutes.has(m)) continue;
      const slotDate = new Date(dayStart);
      slotDate.setMinutes(m);
      allSlots.push({
        label: slotDate.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        iso: slotDate.toISOString(),
      });
    }
  }

  return NextResponse.json({ slots: allSlots });
}
