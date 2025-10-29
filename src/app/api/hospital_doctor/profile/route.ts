export const dynamic = "force-dynamic";

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

    // Récupération des données du docteur avec son profil
    const doctor = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        dateOfBirth: true,
        emailVerified: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        doctor: {
          select: {
            id: true,
            specialization: true,
            licenseNumber: true,
            education: true,
            experience: true,
            consultationFee: true,
            isVerified: true,
            hospitalId: true,
            departmentId: true,
            hospital: {
              select: {
                id: true,
                name: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        profile: {
          select: {
            address: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            bio: true,
            avatarUrl: true,
            genre: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({ doctor });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HOSPITAL_DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      name,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      country,
      bio,
      avatarUrl,
      genre,
      specialization,
      education,
      experience,
      consultationFee,
    } = body;

    // Update user fields
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });

    // Upsert profile (create if doesn't exist, update if exists)
    await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        address: address ?? null,
        city: city ?? null,
        state: state ?? null,
        zipCode: zipCode ?? null,
        country: country ?? null,
        bio: bio ?? null,
        avatarUrl: avatarUrl ?? null,
        genre: genre || null,
      },
      create: {
        userId: session.user.id,
        address: address ?? null,
        city: city ?? null,
        state: state ?? null,
        zipCode: zipCode ?? null,
        country: country ?? null,
        bio: bio ?? null,
        avatarUrl: avatarUrl ?? null,
        genre: genre || null,
      },
    });

    // Update doctor-specific fields if provided
    if (
      specialization ||
      education ||
      experience ||
      consultationFee !== undefined
    ) {
      await prisma.doctor.update({
        where: { userId: session.user.id },
        data: {
          ...(specialization && { specialization }),
          ...(education && { education }),
          ...(experience && { experience }),
          ...(consultationFee !== undefined && { consultationFee }),
        },
      });
    }

    // Re-fetch des données du docteur mises à jour
    const doctor = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        dateOfBirth: true,
        emailVerified: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        doctor: {
          select: {
            id: true,
            specialization: true,
            licenseNumber: true,
            education: true,
            experience: true,
            consultationFee: true,
            isVerified: true,
            hospitalId: true,
            departmentId: true,
            hospital: {
              select: {
                id: true,
                name: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        profile: {
          select: {
            address: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            bio: true,
            avatarUrl: true,
            genre: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found after update" },
        { status: 404 }
      );
    }

    return NextResponse.json({ doctor });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil docteur :", error);

    // Return more specific error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Échec de la mise à jour du profil";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
