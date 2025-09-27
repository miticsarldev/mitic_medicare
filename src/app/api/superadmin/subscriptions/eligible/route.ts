import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const s = await getServerSession(authOptions);
  if (!s || s.user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const type = sp.get("type"); // "DOCTOR" | "HOSPITAL"
  const q = sp.get("search") ?? "";

  if (type === "DOCTOR") {
    const doctors = await prisma.doctor.findMany({
      where: {
        isIndependent: true,
        user: { name: { contains: q, mode: "insensitive" } },
      },
      select: {
        id: true,
        specialization: true,
        user: { select: { name: true, email: true } },
        subscription: { select: { id: true } },
      },
      take: 20,
    });
    return NextResponse.json(doctors);
  }

  if (type === "HOSPITAL") {
    const hospitals = await prisma.hospital.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        city: true,
        email: true,
        subscription: { select: { id: true } },
      },
      take: 20,
    });
    return NextResponse.json(hospitals);
  }

  return NextResponse.json({ error: "Bad type" }, { status: 400 });
}
