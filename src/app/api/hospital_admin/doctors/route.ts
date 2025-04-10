export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
        });

        if (!hospital) {
            return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") ?? "1", 10);
        const limit = parseInt(searchParams.get("limit") ?? "10", 10);
        const skip = (page - 1) * limit;

        const specialization = searchParams.get("specialization");
        const isVerified = searchParams.get("isVerified");
        const isAvailable = searchParams.get("isAvailable");

        const filters = {
            hospitalId: hospital.id,
            ...(specialization && { specialization }),
            ...(isVerified !== undefined && { isVerified: isVerified === "true" }),
            ...(isAvailable !== undefined && { availableForChat: isAvailable === "true" }),
        };

        const doctors = await prisma.doctor.findMany({
            where: filters,
            skip,
            take: limit,
            select: {
                id: true,
                user: {
                    select: { name: true },
                },
                specialization: true,
                isVerified: true,
                availableForChat: true,
                doctorReviews: {
                    select: { rating: true },
                },
                department: {
                    select: { name: true },
                },
                appointments: {
                    select: { id: true },
                },
            },
        });

        const totalDoctors = await prisma.doctor.count({
            where: filters,
        });

        const doctorsWithAverageRating = doctors.map((doctor) => {
            const totalRatings = doctor.doctorReviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = doctor.doctorReviews.length
                ? totalRatings / doctor.doctorReviews.length
                : 0;

            return {
                id: doctor.id,
                name: doctor.user.name,
                specialization: doctor.specialization,
                isVerified: doctor.isVerified,
                availableForChat: doctor.availableForChat,
                averageRating,
                patientsCount: doctor.appointments.length,
                department: doctor.department?.name,
            };
        });

        return NextResponse.json({
            doctors: doctorsWithAverageRating,
            totalDoctors,
            page,
            totalPages: Math.ceil(totalDoctors / limit),
        });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return NextResponse.json(
            { error: "Failed to fetch doctors" },
            { status: 500 }
        );
    }
}
