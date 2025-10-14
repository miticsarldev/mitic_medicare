export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatAvailabilities(
  availabilities: {
    doctorId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }[]
) {
  const groupedByDay: Record<string, string[]> = {};

  for (const availability of availabilities) {
    if (!availability.isActive) continue;

    const day = dayNames[availability.dayOfWeek];
    if (!groupedByDay[day]) groupedByDay[day] = [];

    const [startHour, startMinute] = availability.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = availability.endTime.split(":").map(Number);

    let current = new Date();
    current.setHours(startHour, startMinute, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    while (current < end) {
      const next = new Date(current.getTime() + 60 * 60 * 1000); // +1 heure
      if (next > end) break;

      const startStr = `${current.getHours().toString().padStart(2, "0")}:${current.getMinutes().toString().padStart(2, "0")}`;
      const endStr = `${next.getHours().toString().padStart(2, "0")}:${next.getMinutes().toString().padStart(2, "0")}`;

      groupedByDay[day].push(`${startStr} - ${endStr}`);
      current = next;
    }
  }

  return Object.entries(groupedByDay).map(([day, slots]) => ({
    day,
    slots,
  }));
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { adminId: session.user.id },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const skip = (page - 1) * limit;

    const specialization = searchParams.get("specialization");
    const isVerified = searchParams.get("isVerified");
    const isAvailable = searchParams.get("isAvailable");
    const search = searchParams.get("search");

    const userFilter: Prisma.UserWhereInput = {
      role: "HOSPITAL_DOCTOR", // <-- always enforce role
      ...(search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {}),
    };

    const filters: Prisma.DoctorWhereInput = {
      hospitalId: hospital.id,
      user: userFilter,
      ...(specialization && { specialization }),
      ...(isVerified !== null && { isVerified: isVerified === "true" }),
      ...(isAvailable !== null && { availableForChat: isAvailable === "true" }),
    };

    const doctors = await prisma.doctor.findMany({
      where: filters,
      skip,
      take: limit,
      select: {
        id: true,
        specialization: true,
        licenseNumber: true,
        education: true,
        experience: true,
        consultationFee: true,
        isVerified: true,
        isIndependent: true,
        availableForChat: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            isActive: true,
            profile: {
              select: {
                bio: true,
                avatarUrl: true,
                address: true,
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        appointments: {
          select: { id: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    const doctorIds = doctors.map((d) => d.id);

    const allAvailabilities = await prisma.doctorAvailability.findMany({
      where: {
        doctorId: { in: doctorIds },
        isActive: true,
      },
      select: {
        doctorId: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        isActive: true,
      },
    });

    const totalDoctors = await prisma.doctor.count({ where: filters });

    const doctorsWithDetails = doctors.map((doctor) => {
      const totalRatings = doctor.reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = doctor.reviews.length
        ? totalRatings / doctor.reviews.length
        : 0;

      const doctorAvailabilities = allAvailabilities.filter(
        (a) => a.doctorId === doctor.id
      );

      const formattedSchedule = formatAvailabilities(doctorAvailabilities);

      return {
        id: doctor.id,
        name: doctor.user.name,
        email: doctor.user.email,
        phone: doctor.user.phone,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        education: doctor.education,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        isVerified: doctor.isVerified,
        isActive: doctor.user.isActive,
        isIndependent: doctor.isIndependent,
        availableForChat: doctor.availableForChat,
        createdAt: doctor.createdAt,
        avatarUrl: doctor.user.profile?.avatarUrl,
        bio: doctor.user.profile?.bio,
        address: doctor.user.profile?.address,
        city: doctor.user.profile?.city,
        state: doctor.user.profile?.state,
        country: doctor.user.profile?.country,
        department: doctor.department,
        patientsCount: doctor.appointments.length,
        averageRating,
        reviewsCount: doctor.reviews.length,
        schedule: formattedSchedule,
      };
    });

    return NextResponse.json({
      doctors: doctorsWithDetails,
      totalDoctors,
      page,
      totalPages: Math.ceil(totalDoctors / limit),
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
