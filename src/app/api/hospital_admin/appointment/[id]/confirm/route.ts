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

        const updated = await prisma.appointment.update({
            where: { id },
            data: { status: "CONFIRMED" },
        });

        return NextResponse.json({ success: true, appointment: updated });
    } catch (error) {
        console.error("Error validating appointment:", error);
        return NextResponse.json({ error: "Failed to validate appointment" }, { status: 500 });
    }
}
