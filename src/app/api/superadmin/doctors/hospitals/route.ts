import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sp = request.nextUrl.searchParams;
    const limit = Math.max(
      1,
      Math.min(500, parseInt(sp.get("limit") ?? "100", 10))
    );
    const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10));
    const search = (sp.get("search") ?? "").trim();
    const cities = sp
      .getAll("city")
      .map((c) => c.trim())
      .filter(Boolean);
    const skip = (page - 1) * limit;

    const where: Prisma.HospitalWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (cities.length > 0) {
      where.city = { in: cities };
    }

    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        select: { id: true, name: true, city: true },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.hospital.count({ where }),
    ]);

    return NextResponse.json({
      hospitals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching hospitals:", err);
    return NextResponse.json(
      { error: "Failed to fetch hospitals" },
      { status: 500 }
    );
  }
}
