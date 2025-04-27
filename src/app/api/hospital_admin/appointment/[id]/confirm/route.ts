import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const appointment = await prisma.appointment.update({
            where: { id: params.id },
            data: { status: "CONFIRMED" },
        })

        return NextResponse.json({ success: true, appointment })
    } catch (error) {
        console.error("Erreur confirmation rendez-vous:", error)
        return NextResponse.json({ error: "Erreur lors de la confirmation" }, { status: 500 })
    }
}
