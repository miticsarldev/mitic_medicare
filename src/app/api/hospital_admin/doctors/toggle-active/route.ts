export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Vérifie si l'utilisateur est bien un HOSPITAL_ADMIN
        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
            select: { id: true },
        });

        if (!hospital) {
            return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
        }

        const { doctorId, isActive } = await request.json();

        if (!doctorId || typeof isActive !== "boolean") {
            return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
        }

        // Vérifie que le médecin existe et appartient bien à cet hôpital
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            include: {
                user: true, // pour accéder au user lié
            },
        });

        if (!doctor || doctor.hospitalId !== hospital.id) {
            return NextResponse.json({ error: "Doctor not found or not in your hospital" }, { status: 404 });
        }

        // Mise à jour de l'état "isActive" sur l'utilisateur du médecin
        const updatedUser = await prisma.user.update({
            where: { id: doctor.userId },
            data: { isActive },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({ user: updatedUser }, { status: 200 });

    } catch (error) {
        console.error("Error toggling doctor activation:", error);
        return NextResponse.json({ error: "Server error while updating doctor status" }, { status: 500 });
    }
}
