export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SubscriptionPlan } from "@prisma/client";

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

    const hospitalId = params.id;

    // Get hospital details
    const hospital = await prisma.hospital.findUnique({
      where: {
        id: hospitalId,
      },
      include: {
        admin: true,
        _count: {
          select: {
            doctors: true,
          },
        },
        doctors: {
          take: 10,
          select: {
            id: true,
            specialization: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profile: {
                  select: {
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        subscription: true,
      },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    // Get average rating from Review model
    const reviewAvg = await prisma.review.aggregate({
      where: { hospitalId },
      _avg: { rating: true },
    });

    const averageRating = parseFloat((reviewAvg._avg.rating ?? 0).toFixed(1));

    return NextResponse.json({
      ...hospital,
      averageRating,
    });
  } catch (error) {
    console.error("Error fetching hospital details:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospital details" },
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
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hospitalId = params.id;
    const data = await request.json();

    // 1) Update hospital fields
    await prisma.hospital.update({
      where: { id: hospitalId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        status: data.status,
        isVerified: data.isVerified ?? data.verified, // accept either key
        description: data.description,
        logoUrl: data.logoUrl,
        website: data.website,
      },
    });

    // 2) Update/Upsert subscription plan if sent
    if (data.subscription) {
      await prisma.subscription.upsert({
        where: { hospitalId: hospitalId }, // requires a unique constraint on hospitalId in your Subscription model
        update: {
          plan: data.subscription as SubscriptionPlan,
        },
        create: {
          hospitalId,
          subscriberType: "HOSPITAL",
          plan: data.subscription as SubscriptionPlan,
          status: "ACTIVE",
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
          amount: 0,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating hospital:", error);
    return NextResponse.json(
      { error: "Failed to update hospital" },
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

    const hospitalId = params.id;

    // Delete the hospital
    await prisma.hospital.delete({
      where: {
        id: hospitalId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hospital:", error);
    return NextResponse.json(
      { error: "Failed to delete hospital" },
      { status: 500 }
    );
  }
}
