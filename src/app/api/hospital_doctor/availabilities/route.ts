import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HOSPITAL_DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const availabilities = await prisma.doctorAvailability.findMany({
      where: { doctorId: doctor.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(availabilities);
  } catch (error) {
    console.error("[GET AVAILABILITIES]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HOSPITAL_DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      dayOfWeek,
      startTime,
      endTime,
      slotDuration,
      isActive,
    } = body;

    // Validate time range
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "L'heure de début doit être antérieure à l'heure de fin" },
        { status: 400 }
      );
    }

    // Check for overlapping availabilities
    const overlapping = await prisma.doctorAvailability.findFirst({
      where: {
        doctorId: doctor.id,
        dayOfWeek,
        isActive: true,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        {
          error:
            "Cette plage horaire chevauche avec une disponibilité existante",
        },
        { status: 400 }
      );
    }

    const availability = await prisma.doctorAvailability.create({
      data: {
        doctorId: doctor.id,
        dayOfWeek,
        startTime,
        endTime,
        slotDuration,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(availability, { status: 201 });
  } catch (error) {
    console.error("[CREATE AVAILABILITY]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
