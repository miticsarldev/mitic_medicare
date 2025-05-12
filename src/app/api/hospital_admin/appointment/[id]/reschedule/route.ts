import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    try {
      const { id } = params;
      const { newDate } = await req.json();
  
      if (!newDate) {
        return NextResponse.json({ error: "Missing new date" }, { status: 400 });
      }
  
      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          scheduledAt: new Date(newDate),
          status: "PENDING",
        },
      });
  
      return NextResponse.json({ success: true, appointment: updated });
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      return NextResponse.json({ error: "Failed to reschedule appointment" }, { status: 500 });
    }
  }
  