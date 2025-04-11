export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

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

        const data = await req.json();
        const {
            name,
            email,
            phone,
            password,
            specialization,
            licenseNumber,
            education,
            experience,
            consultationFee,
            departmentId,
            address,
            city,
            state,
            zipCode,
            country,
            bio,
            avatarUrl,
            genre
        } = data;

        if (!name || !email || !phone || !password || !specialization || !licenseNumber) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                role: "HOSPITAL_DOCTOR",
            },
        });

        // 2. Créer le profil utilisateur
        await prisma.userProfile.create({
            data: {
                userId: user.id,
                address,
                city,
                state,
                zipCode,
                country,
                bio,
                avatarUrl,
                genre,
            },
        });

        // 3. Créer le médecin
        const doctor = await prisma.doctor.create({
            data: {
                userId: user.id,
                hospitalId: hospital.id,
                departmentId: departmentId || null,
                specialization,
                licenseNumber,
                education,
                experience,
                consultationFee,
            },
        });

        return NextResponse.json({ doctor }, { status: 201 });
    } catch (error) {
        console.error("Erreur lors de la création du médecin :", error);
        return NextResponse.json({ error: "Server error while creating doctor" }, { status: 500 });
    }
}
