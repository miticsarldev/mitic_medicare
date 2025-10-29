export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
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
    } = body;

    // Mise à jour des données de l'admin
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

    // Re-fetch des données de l'admin mises à jour (même format que GET)
    const admin = await prisma.user.findUnique({
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

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found after update" },
        { status: 404 }
      );
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil admin :", error);

    // Return more specific error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Échec de la mise à jour du profil";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
