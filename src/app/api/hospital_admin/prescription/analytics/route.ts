export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Vérifier l'authentification et le rôle
        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Trouver l'hôpital de l'admin
        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
            select: { id: true },
        });

        if (!hospital) {
            return NextResponse.json(
                { error: "Hospital not found for this admin" },
                { status: 404 }
            );
        }

        // Définir le début et la fin de la journée (en UTC)
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        // Compter les prescriptions créées aujourd’hui par les médecins de cet hôpital
        const totalPrescriptionsToday = await prisma.prescription.count({
            where: {
                createdAt: {
                    gte: todayStart,
                    lte: todayEnd,
                },
                doctor: {
                    hospitalId: hospital.id,
                },
            },
        });

        return NextResponse.json({ totalPrescriptionsToday });
    } catch (error) {
        console.error("Error fetching today's prescriptions:", error);
        return NextResponse.json(
            { error: "Failed to fetch today's prescriptions" },
            { status: 500 }
        );
    }
}
