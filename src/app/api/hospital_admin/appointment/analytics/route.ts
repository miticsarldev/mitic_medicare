export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Vérifier si l'utilisateur est authentifié et est un SUPER_ADMIN
        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Récupérer l'ID de l'hôpital administré par l'utilisateur
        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
        });

        if (!hospital) {
            return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
        }

        // Déterminer la date d'aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Compter les rendez-vous du jour pour cet hôpital
        const totalAppointments = await prisma.appointment.count({
            where: {
                hospitalId: hospital.id,
                scheduledAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        return NextResponse.json({ totalAppointments });
    } catch (error) {
        console.error("Error fetching daily appointments:", error);
        return NextResponse.json(
            { error: "Failed to fetch daily appointments" },
            { status: 500 }
        );
    }
}
