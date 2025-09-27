export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  Prisma,
  SubscriberType,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

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
    const sortOrder = (searchParams.get("sortOrder") ||
      "desc") as Prisma.SortOrder;

    const status = searchParams.getAll("status");
    const specialty = searchParams.getAll("specialty");
    const location = searchParams.getAll("location");

    // nouveaux paramètres date
    const dateField = (searchParams.get("dateField") || "joinedAt") as
      | "joinedAt"
      | "lastActive";
    const dateFrom = searchParams.get("dateFrom"); // "YYYY-MM-DD"
    const dateTo = searchParams.get("dateTo"); // "YYYY-MM-DD"

    const skip = (page - 1) * limit;

    const where: Prisma.DoctorWhereInput = {};
    const userWhere: Prisma.UserWhereInput = {}; // on compose ici

    if (search) {
      where.OR = [
        { user: { is: { name: { contains: search, mode: "insensitive" } } } },
        { user: { is: { email: { contains: search, mode: "insensitive" } } } },
        { user: { is: { id: { contains: search, mode: "insensitive" } } } },
        { specialization: { contains: search, mode: "insensitive" } },
      ];
    }

    if (specialty.length > 0) {
      where.specialization = { in: specialty };
    }

    // localisation (user.profile.city)
    if (location.length > 0) {
      userWhere.profile = { city: { in: location } };
    }

    // statut (user.isActive) — on garde la logique d’OR
    if (status.length > 0) {
      userWhere.OR = status.map((s) => ({ isActive: s === "active" }));
    }

    // filtre par date (sur user.createdAt ou user.updatedAt)
    if (dateFrom || dateTo) {
      const range: Prisma.DateTimeFilter = {};
      if (dateFrom) range.gte = new Date(`${dateFrom}T00:00:00.000Z`);
      if (dateTo) range.lte = new Date(`${dateTo}T23:59:59.999Z`);

      if (dateField === "joinedAt") {
        userWhere.createdAt = range;
      } else {
        userWhere.updatedAt = range;
      }
    }

    // n’applique userWhere que s’il y a des choses dedans
    if (Object.keys(userWhere).length > 0) {
      where.user = { is: userWhere };
    }

    // tri
    let orderBy: Prisma.DoctorOrderByWithRelationInput = {};
    switch (sortBy) {
      case "name":
        orderBy = { user: { name: sortOrder } };
        break;
      case "specialty":
        orderBy = { specialization: sortOrder };
        break;
      case "location":
        orderBy = { user: { profile: { city: sortOrder } } };
        break;
      case "joinedAt":
        orderBy = { user: { createdAt: sortOrder } };
        break;
      case "lastActive":
        orderBy = { user: { updatedAt: sortOrder } };
        break;
      default:
        orderBy = { user: { createdAt: "desc" } };
    }

    // requête
    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: { include: { profile: true } },
        hospital: { include: { subscription: true } },
        department: true,
        subscription: true,
        reviews: true,
        _count: { select: { appointments: true, reviews: true } },
      },
      skip,
      take: limit,
      orderBy,
    });

    // moyenne de rating
    const doctorsWithRating = doctors.map((doctor) => {
      let avgRating: number | null = null;
      if (doctor.reviews && doctor.reviews.length > 0) {
        const total = doctor.reviews.reduce((sum, r) => sum + r.rating, 0);
        avgRating = total / doctor.reviews.length;
      }
      return { ...doctor, avgRating };
    });

    const totalDoctors = await prisma.doctor.count({ where });

    return NextResponse.json({
      doctors: doctorsWithRating,
      pagination: {
        total: totalDoctors,
        page,
        limit,
        totalPages: Math.ceil(totalDoctors / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
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

    const password = data.password || "defaultPassword123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role as UserRole,
        emailVerified: new Date(),
        password: hashedPassword,
        isActive: false,
        isApproved: true,
        profile: {
          create: {
            address: data.address,
            city: data.location,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
            bio: data.bio,
            avatarUrl: data.avatarUrl,
            genre: data.genre,
          },
        },
      },
    });

    // Create doctor record
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        hospitalId: data.hospitalId,
        departmentId: data.departmentId,
        specialization: data.specialty,
        licenseNumber: data.licenseNumber,
        education: data.education,
        experience: data.experience,
        isVerified: data.isVerified || false,
        isIndependent: data.isIndependent || false,
        consultationFee: data.consultationFee,
      },
    });

    if (data.isIndependent) {
      await prisma.subscription.create({
        data: {
          subscriberType: SubscriberType.DOCTOR,
          doctorId: doctor.id,
          plan: data.subscription || SubscriptionPlan.FREE,
          status: data.status || SubscriptionStatus.TRIAL,
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
          currency: data.currency || "XOF",
          autoRenew: data.autoRenew || false,
          amount: data.amount || 0,
        },
      });
    }

    return NextResponse.json({ success: true, doctorId: user.id });
  } catch (error) {
    console.error("Error creating doctor:", error);
    return NextResponse.json(
      { error: "Failed to create doctor" },
      { status: 500 }
    );
  }
}
