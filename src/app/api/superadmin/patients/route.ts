export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Calculate pagination
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {
      user: {
        role: "PATIENT",
        isActive: status === "all" ? undefined : status === "active",
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { id: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
    };

    // Get total count for pagination
    const totalPatients = await prisma.patient.count({ where });

    // Build orderBy object based on sortBy field
    let orderBy: Prisma.PatientOrderByWithRelationInput = {
      createdAt: sortOrder as Prisma.SortOrder,
    };

    if (sortBy === "name") {
      orderBy = { user: { name: sortOrder === "asc" ? "asc" : "desc" } };
    } else if (sortBy === "email") {
      orderBy = { user: { email: sortOrder === "asc" ? "asc" : "desc" } };
    } else if (sortBy === "registrationDate") {
      orderBy = { user: { createdAt: sortOrder === "asc" ? "asc" : "desc" } };
    } else if (sortBy === "lastLogin") {
      orderBy = { user: { updatedAt: sortOrder === "asc" ? "asc" : "desc" } };
    } else {
      // Default to createdAt
      orderBy = { createdAt: sortOrder === "asc" ? "asc" : "desc" };
    }

    // Get patients with pagination, sorting, and filtering
    const patients = await prisma.patient.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            emailVerified: true,
            isApproved: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            profile: {
              select: {
                address: true,
                city: true,
                state: true,
                country: true,
                zipCode: true,
                bio: true,
                genre: true,
                avatarUrl: true,
                createdAt: true,
              },
            },
          },
        },
        appointments: {
          select: {
            id: true,
          },
        },
        medicalRecords: {
          select: {
            id: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy,
    });

    return NextResponse.json({
      patients: patients.map((patient) => ({
        ...patient,
        appointmentsCount: patient.appointments.length,
        medicalRecordsCount: patient.medicalRecords.length,
        allergies: patient.allergies ? patient.allergies.split(",") : [],
        chronicConditions: patient.medicalNotes
          ? patient.medicalNotes.split(",")
          : [],
      })),
      pagination: {
        total: totalPatients,
        page,
        limit,
        totalPages: Math.ceil(totalPatients / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const patientUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "PATIENT",
        emailVerified: new Date(),
        isApproved: true,
        isActive: true,
        profile: {
          create: {
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
            bio: data.bio,
            genre: data.genre,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: patientUser,
    });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Failed to create patient" },
      { status: 500 }
    );
  }
}
