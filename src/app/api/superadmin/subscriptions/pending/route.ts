// app/api/subscriptions/pending/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        hospital: {
          include: {
            admin: true,
          },
        },
        payments: {
          orderBy: {
            paymentDate: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pendingSubscriptions);
  } catch (error) {
    console.error("Error fetching pending subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending subscriptions" },
      { status: 500 }
    );
  }
}