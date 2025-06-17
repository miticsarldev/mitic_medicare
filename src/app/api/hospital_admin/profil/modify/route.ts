export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()

        const {
            name,
            phone,
            dateOfBirth,
            address,
            city,
            state,
            zipCode,
            country,
            bio,
            avatarUrl,
            genre,
        } = body

        // Mise à jour des données de l'admin
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                phone,
                dateOfBirth,
                profile: {
                    update: {
                        address,
                        city,
                        state,
                        zipCode,
                        country,
                        bio,
                        avatarUrl,
                        genre,
                    },
                },
            },
        })

        // Re-fetch des données de l'admin mises à jour (même format que GET)
        const admin = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                dateOfBirth : true,
                emailVerified: true,
                isApproved: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                profile: {
                    select: {
                        address: true,
                        city: true,
                        state: true,
                        zipCode: true,
                        country: true,
                        bio: true,
                        avatarUrl: true,
                        genre: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        })

        return NextResponse.json({ admin })
    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil admin :", error)
        return NextResponse.json(
            { error: "Échec de la mise à jour du profil" },
            { status: 500 }
        )
    }
}
