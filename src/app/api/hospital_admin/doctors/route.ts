export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

interface DoctorFilters extends Prisma.DoctorWhereInput { }

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
        const search = searchParams.get("search");

        const filters: DoctorFilters = {
            hospitalId: hospital.id,
            ...(specialization && { specialization }),
            ...(isVerified !== null && { isVerified: isVerified === "true" }),
            ...(isAvailable !== null && { availableForChat: isAvailable === "true" }),
            ...(search && {
                user: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            }),
        };

        const doctors = await prisma.doctor.findMany({
            where: filters,
            skip,
            take: limit,
            select: {
                id: true,
                specialization: true,
                licenseNumber: true,
                education: true,
                experience: true,
                consultationFee: true,
                isVerified: true,
                isIndependent: true,
                availableForChat: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        profile: {
                            select: {
                                bio: true,
                                avatarUrl: true,
                                address: true,
                                city: true,
                                state: true,
                                country: true,
                            },
                        },
                    },
                },
                department: {
                    select: {
                        name: true,
                    },
                },
                appointments: {
                    select: { id: true },
                },
                doctorReviews: {
                    select: { rating: true },
                },
                reviews: {
                    select: { rating: true },
                },
            },
        });

        const totalDoctors = await prisma.doctor.count({
            where: filters,
        });

        const doctorsWithDetails = doctors.map((doctor) => {
            const totalRatings = doctor.reviews.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = doctor.reviews.length
                ? totalRatings / doctor.reviews.length
                : 0;

            return {
                id: doctor.id,
                name: doctor.user.name,
                email: doctor.user.email,
                phone: doctor.user.phone,
                specialization: doctor.specialization,
                licenseNumber: doctor.licenseNumber,
                education: doctor.education,
                experience: doctor.experience,
                consultationFee: doctor.consultationFee,
                isVerified: doctor.isVerified,
                isIndependent: doctor.isIndependent,
                availableForChat: doctor.availableForChat,
                createdAt: doctor.createdAt,
                avatarUrl: doctor.user.profile?.avatarUrl,
                bio: doctor.user.profile?.bio,
                address: doctor.user.profile?.address,
                city: doctor.user.profile?.city,
                state: doctor.user.profile?.state,
                country: doctor.user.profile?.country,
                department: doctor.department?.name,
                patientsCount: doctor.appointments.length,
                averageRating,
                reviewsCount: doctor.reviews.length,
            };
        });

        return NextResponse.json({
            doctors: doctorsWithDetails,
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
