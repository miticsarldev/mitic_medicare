export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctorId = params.id;

    // Get doctor details
    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            isApproved: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            profile: {
              select: {
                address: true,
                city: true,
                state: true,
                zipCode: true,
                country: true,
                avatarUrl: true,
                genre: true,
                bio: true,
              },
            },
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
            city: true,
            subscription: {
              select: {
                plan: true,
              },
            },
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        subscription: {
          select: {
            plan: true,
            subscriberType: true,
          },
        },
        _count: {
          select: {
            appointments: true,
            availabilities: true,
          },
        },
        appointments: {
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            patient: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Calculate rating from reviews
    const reviews = await prisma.review.findMany({
      where: { doctorId },
      select: {
        rating: true,
      },
    });

    const avgRating =
      reviews.length > 0
        ? parseFloat(
            (
              reviews.reduce((acc, review) => acc + review.rating, 0) /
              reviews.length
            ).toFixed(1)
          )
        : 0;

    return NextResponse.json({
      ...doctor,
      avgRating,
    });
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctorId = params.id;
    const data = await request.json();

    // Get doctor record
    const doctor = await prisma.doctor.findFirst({
      where: {
        user: {
          id: doctorId,
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const password = data.password || "defaultPassword123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user data
    await prisma.user.update({
      where: {
        id: doctorId,
      },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role as UserRole,
        password: hashedPassword,
        isActive: data.status === 'active',
        isApproved: data.isApproved || false,
      },
    });

    // Update or create user profile
    await prisma.userProfile.upsert({
      where: {
        userId: doctorId,
      },
      update: {
        address: data.address,
        city: data.location,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        genre: data.genre,
      },
      create: {
        userId: doctorId,
        address: data.address,
        city: data.location,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        genre: data.genre,
      },
    });

    // Update doctor data
    await prisma.doctor.update({
      where: {
        id: doctor.id,
      },
      data: {
        specialization: data.specialization,
        hospitalId: data.hospital?.id || null,
        licenseNumber: data.licenseNumber,
        departmentId: data.department?.id || null,
        education: data.education,
        experience: data.experience,
        consultationFee: data.consultationFee,
        isIndependent: data.isIndependent,
        isVerified: data.isVerified,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return NextResponse.json(
      { error: "Failed to update doctor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctorId = params.id;

    // Find the doctor record
    const doctor = await prisma.doctor.findFirst({
      where: {
        user: {
          id: doctorId,
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Delete the doctor and related data
    // Note: This assumes you have proper cascading deletes set up in your schema
    await prisma.user.delete({
      where: {
        id: doctorId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json(
      { error: "Failed to delete doctor" },
      { status: 500 }
    );
  }
}
