export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ReviewStatus } from "@prisma/client";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const { status } = await request.json();

        if (!Object.values(ReviewStatus).includes(status)) {
            return NextResponse.json(
                { error: "Invalid status value" },
                { status: 400 }
            );
        }

        // Vérifier que l'avis appartient bien à l'hôpital de l'admin
        const review = await prisma.review.findUnique({
            where: { id },
            include: {
                doctor: { select: { hospitalId: true } },
                hospital: { select: { id: true } },
            },
        });

        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
            select: { id: true },
        });

        if (!hospital) {
            return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
        }

        // Vérifier que l'avis concerne bien cet hôpital
        const isHospitalReview = review.hospital?.id === hospital.id;
        const isDoctorReview = review.doctor?.hospitalId === hospital.id;

        if (!isHospitalReview && !isDoctorReview) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Mettre à jour le statut
        const updatedReview = await prisma.review.update({
            where: { id },
            data: { status },
            select: {
                id: true,
                title: true,
                status: true,
                targetType: true,
                doctor: review.targetType === "DOCTOR" ? {
                    select: {
                        id: true,
                        specialization: true,
                        user: { select: { name: true } },
                    },
                } : undefined,
                hospital: review.targetType === "HOSPITAL" ? {
                    select: {
                        id: true,
                        name: true,
                    },
                } : undefined,
            },
        });

        return NextResponse.json({
            message: "Review status updated successfully",
            review: updatedReview,
        });
    } catch (error) {
        console.error("Error updating review status:", error);
        return NextResponse.json(
            { error: "Failed to update review status" },
            { status: 500 }
        );
    }
}