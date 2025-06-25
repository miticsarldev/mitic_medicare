export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "INDEPENDENT_DOCTOR") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        const [total, pending, confirmed, completed, canceled] = await Promise.all([
            prisma.appointment.count({ where: { doctorId: doctor.id } }),
            prisma.appointment.count({ where: { doctorId: doctor.id, status: "PENDING" } }),
            prisma.appointment.count({ where: { doctorId: doctor.id, status: "CONFIRMED" } }),
            prisma.appointment.count({ where: { doctorId: doctor.id, status: "COMPLETED" } }),
            prisma.appointment.count({ where: { doctorId: doctor.id, status: "CANCELED" } }),
        ]);

        return NextResponse.json({
            total,
            pending,
            confirmed,
            completed,
            canceled,
        });
    } catch (error) {
        console.error("Error fetching appointment stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch appointment stats" },
            { status: 500 }
        );
    }
}