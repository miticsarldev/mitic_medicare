import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatAvailabilities(availabilities: any[]) {
    const groupedByDay = availabilities.reduce((acc, curr) => {
        if (!curr.isActive) return acc;
        const day = dayNames[curr.dayOfWeek];
        if (!acc[day]) acc[day] = [];
        acc[day].push(`${curr.startTime} - ${curr.endTime}`);
        return acc;
    }, {} as Record<string, string[]>);

    return Object.entries(groupedByDay).map(([day, slots]) => ({
        day,
        slots,
    }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { id: params.id },
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
                        id: true,
                        name: true,
                    },
                },
                appointments: {
                    select: {
                        id: true,
                        scheduledAt: true,
                        status: true,
                        reason: true,
                        notes: true,
                        startTime: true,
                        endTime: true,
                        createdAt: true,
                        updatedAt: true,
                        patient: {
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                        phone: true,
                                        profile: {
                                            select: {
                                                avatarUrl: true,
                                                address: true,
                                                city: true,
                                                state: true,
                                                country: true,
                                                bio: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                reviews: {
                    select: { rating: true },
                },
            },
        });

        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        const availabilities = await prisma.doctorAvailability.findMany({
            where: { doctorId: doctor.id, isActive: true },
            select: {
                dayOfWeek: true,
                startTime: true,
                endTime: true,
                isActive: true,
            },
        });

        const totalRatings = doctor.reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = doctor.reviews.length
            ? totalRatings / doctor.reviews.length
            : 0;

        const formattedSchedule = formatAvailabilities(availabilities);

        const fullDoctor = {
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
            department: doctor.department,
            averageRating,
            reviewsCount: doctor.reviews.length,
            schedule: formattedSchedule,
            appointments: doctor.appointments,
        };

        return NextResponse.json(fullDoctor);
    } catch (error) {
        console.error("Error fetching doctor details:", error);
        return NextResponse.json({ error: "Failed to fetch doctor" }, { status: 500 });
    }
}
