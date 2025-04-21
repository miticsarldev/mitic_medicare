import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { newDate } = body

    if (!newDate) {
      return NextResponse.json({ error: "Nouvelle date manquante" }, { status: 400 })
    }

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        scheduledAt: new Date(newDate),
        status: "CONFIRMED",
      },
    })

    return NextResponse.json({ success: true, appointment })
  } catch (error) {
    console.error("Erreur reprogrammation:", error)
    return NextResponse.json({ error: "Erreur lors de la reprogrammation" }, { status: 500 })
  }
}
