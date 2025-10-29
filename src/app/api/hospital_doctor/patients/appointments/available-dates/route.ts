import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfDay, endOfDay, addDays, format } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const doctor = await prisma.doctor.findFirst({
    where: { userId: session.user.id },
  });
  if (!doctor)
    return NextResponse.json({ error: "Médecin non trouvé" }, { status: 404 });

  // Get doctor's availability for the next 3 months
  const startDate = startOfDay(new Date());
  const endDate = endOfDay(addDays(new Date(), 90));

  const availabilities = await prisma.doctorAvailability.findMany({
    where: {
      doctorId: doctor.id,
      isActive: true,
    },
    orderBy: { dayOfWeek: "asc" },
  });

  if (availabilities.length === 0) {
    return NextResponse.json({ availableDates: [] });
  }

  // Generate available dates based on doctor's weekly schedule
  const availableDates: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const hasAvailability = availabilities.some(
      (avail) => avail.dayOfWeek === dayOfWeek
    );

    if (hasAvailability) {
      // Check if there are any available slots for this day
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);

      const appointments = await prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          scheduledAt: { gte: dayStart, lte: dayEnd },
          status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        },
      });

      // Get total available slots for this day
      const dayAvailabilities = availabilities.filter(
        (avail) => avail.dayOfWeek === dayOfWeek
      );
      const totalSlots = dayAvailabilities.reduce((total, avail) => {
        const start = parseInt(avail.startTime.split(":")[0]);
        const end = parseInt(avail.endTime.split(":")[0]);
        const slotDuration = avail.slotDuration || 60;
        return total + ((end - start) * 60) / slotDuration;
      }, 0);

      // If there are available slots, add this date
      if (totalSlots > appointments) {
        availableDates.push(format(currentDate, "yyyy-MM-dd"));
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return NextResponse.json({ availableDates });
}
