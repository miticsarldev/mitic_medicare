export const dynamic = "force-dynamic" 

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    try {
        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
            select: {
                subscription: {
                    include: {
                        payments: {
                            orderBy: { paymentDate: "desc" },
                        },
                    },
                },
            },
        })

        if (!hospital?.subscription) {
            return NextResponse.json({ subscription: null })
        }

        return NextResponse.json({ subscription: hospital.subscription })
    } catch (error) {
        console.error("Erreur récupération abonnement:", error)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
