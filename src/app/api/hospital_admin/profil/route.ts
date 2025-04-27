export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Récupération des données de l'admin avec son profil
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
        });

        if (!admin) {
            return NextResponse.json({ error: "Admin not found" }, { status: 404 });
        }

        return NextResponse.json({ admin });
    } catch (error) {
        console.error("Error fetching admin profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch admin profile" },
            { status: 500 }
        );
    }
}
