import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if availability exists and belongs to doctor
    const existingAvailability = await prisma.doctorAvailability.findFirst({
      where: {
        id: params.id,
        doctorId: doctor.id,
      },
    });

    if (!existingAvailability) {
      return NextResponse.json(
        { error: "Availability not found" },
        { status: 404 }
      );
    }

    // Validate time range
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "L'heure de début doit être antérieure à l'heure de fin" },
        { status: 400 }
      );
    }

    // Check for overlapping availabilities (excluding current one)
    const overlapping = await prisma.doctorAvailability.findFirst({
      where: {
        doctorId: doctor.id,
        dayOfWeek,
        isActive: true,
        id: { not: params.id },
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

    const updatedAvailability = await prisma.doctorAvailability.update({
      where: { id: params.id },
      data: {
        dayOfWeek,
        startTime,
        endTime,
        slotDuration,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(updatedAvailability);
  } catch (error) {
    console.error("[UPDATE AVAILABILITY]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const { isActive } = body;

    // Check if availability exists and belongs to doctor
    const existingAvailability = await prisma.doctorAvailability.findFirst({
      where: {
        id: params.id,
        doctorId: doctor.id,
      },
    });

    if (!existingAvailability) {
      return NextResponse.json(
        { error: "Availability not found" },
        { status: 404 }
      );
    }

    const updatedAvailability = await prisma.doctorAvailability.update({
      where: { id: params.id },
      data: { isActive },
    });

    return NextResponse.json(updatedAvailability);
  } catch (error) {
    console.error("[TOGGLE AVAILABILITY]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if availability exists and belongs to doctor
    const existingAvailability = await prisma.doctorAvailability.findFirst({
      where: {
        id: params.id,
        doctorId: doctor.id,
      },
    });

    if (!existingAvailability) {
      return NextResponse.json(
        { error: "Availability not found" },
        { status: 404 }
      );
    }

    await prisma.doctorAvailability.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Availability deleted successfully" });
  } catch (error) {
    console.error("[DELETE AVAILABILITY]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
