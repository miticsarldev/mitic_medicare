import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  HospitalStatus,
  Prisma,
  SubscriberType,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const locations = searchParams.getAll("location");
    const statuses = searchParams.getAll("status");
    const subscriptions = searchParams.getAll("subscription");

    const skip = (page - 1) * limit;

    const where: Prisma.HospitalWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    if (statuses.length > 0) {
      where.status = {
        in: statuses.map((s) => s.toUpperCase()) as HospitalStatus[],
      };
    }

    if (locations.length > 0) {
      where.city = { in: locations };
    }

    if (subscriptions.length > 0) {
      where.subscription = {
        plan: { in: subscriptions as SubscriptionPlan[] },
      };
    }

    let orderBy: Prisma.HospitalOrderByWithRelationInput = {
      createdAt: sortOrder === "asc" ? "asc" : "desc",
    };

    if (sortBy === "name") {
      orderBy = { name: sortOrder === "asc" ? "asc" : "desc" };
    } else if (sortBy === "location") {
      orderBy = { city: sortOrder === "asc" ? "asc" : "desc" };
    } else if (sortBy === "doctors") {
      orderBy = { doctors: { _count: sortOrder === "asc" ? "asc" : "desc" } };
    }

    const hospitals = await prisma.hospital.findMany({
      where,
      include: {
        admin: {
          select: {
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
                avatarUrl: true,
              },
            },
          },
        },
        subscription: true,
        _count: {
          select: {
            doctors: true,
          },
        },
        doctors: {
          take: 5,
          select: {
            id: true,
            user: {
              select: {
                name: true,
                profile: {
                  select: {
                    avatarUrl: true,
                  },
                },
              },
            },
            specialization: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy,
    });

    const ratings = await prisma.review.groupBy({
      by: ["hospitalId"],
      where: {
        hospitalId: {
          in: hospitals.map((h) => h.id),
        },
      },
      _avg: {
        rating: true,
      },
    });

    const hospitalRatingsMap = Object.fromEntries(
      ratings.map((r) => [
        r.hospitalId,
        parseFloat((r._avg.rating ?? 0).toFixed(1)),
      ])
    );

    return NextResponse.json({
      hospitals: hospitals.map((h) => ({
        ...h,
        rating: hospitalRatingsMap[h.id] || 0,
        doctorsCount: h._count.doctors,
        topDoctors: h.doctors.map((doctor) => ({
          id: doctor.id,
          name: doctor.user.name,
          specialty: doctor.specialization,
          image:
            doctor.user.profile?.avatarUrl ||
            "/placeholder.svg?height=40&width=40",
        })),
      })),
      pagination: {
        total: await prisma.hospital.count({ where }),
        page,
        limit,
        totalPages: Math.ceil((await prisma.hospital.count({ where })) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospitals" },
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

    // Create hospital
    const hospital = await prisma.hospital.create({
      data: {
        name: data.name,
        adminId: data.adminId,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phone: data.phone,
        email: data.email,
        website: data.website,
        description: data.description,
        logoUrl: data.logoUrl,
        isVerified: data.verified || false,
      },
    });

    await prisma.subscription.create({
      data: {
        subscriberType: SubscriberType.HOSPITAL,
        hospitalId: hospital.id,
        plan: data.subscriptionPlan || ("FREE" as SubscriptionPlan),
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        amount: 0,
      },
    });

    return NextResponse.json({ success: true, hospitalId: hospital.id });
  } catch (error) {
    console.error("Error creating hospital:", error);
    return NextResponse.json(
      { error: "Failed to create hospital" },
      { status: 500 }
    );
  }
}
