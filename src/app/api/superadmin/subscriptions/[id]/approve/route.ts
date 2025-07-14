// app/api/subscriptions/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const subscriptionId = params.id;
        const now = new Date();

        // Calculate end date (1 month from now)
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const subscription = await prisma.subscription.update({
            where: {
                id: subscriptionId,
                status: "PENDING", // Only allow approval if currently pending
            },
            data: {
                status: "ACTIVE",
                startDate: now,
                endDate: endDate,
                updatedAt: now,
            },
            include: {
                doctor: {
                    include: {
                        user: true,
                    },
                },
                hospital: {
                    include: {
                        admin: true,
                    },
                },
            },
        });

        if (!subscription) {
            return NextResponse.json(
                { error: "Subscription not found or already processed" },
                { status: 404 }
            );
        }

        // If this is a doctor subscription, update the doctor's verification status
        if (subscription.doctor) {
            await prisma.doctor.update({
                where: {
                    id: subscription.doctor.id,
                },
                data: {
                    isVerified: true,
                },
            });
        }

        // If this is a hospital subscription, update the hospital's verification status
        if (subscription.hospital) {
            await prisma.hospital.update({
                where: {
                    id: subscription.hospital.id,
                },
                data: {
                    isVerified: true,
                },
            });
        }

        return NextResponse.json({ success: true, subscription });
    } catch (error) {
        console.error("Error approving subscription:", error);
        return NextResponse.json(
            { error: "Failed to approve subscription" },
            { status: 500 }
        );
    }
}