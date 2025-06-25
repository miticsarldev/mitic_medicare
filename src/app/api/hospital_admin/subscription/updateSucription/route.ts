export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SubscriptionPlan } from "@prisma/client";


export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { plan, months, amount } = body;

        // Validation des données
        if (!plan || !Object.values(SubscriptionPlan).includes(plan)) {
            return NextResponse.json(
                { error: "Invalid or missing plan" },
                { status: 400 }
            );
        }

        if (!months || isNaN(months) || months < 1) {
            return NextResponse.json(
                { error: "Invalid number of months" },
                { status: 400 }
            );
        }

        if (!amount || isNaN(amount) || amount < 0) {
            return NextResponse.json(
                { error: "Invalid amount" },
                { status: 400 }
            );
        }

        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
            include: { subscription: true },
        });

        if (!hospital) {
            return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + months);

        let subscription;

        if (hospital.subscription) {
            // Mise à jour de la souscription existante
            subscription = await prisma.subscription.update({
                where: { hospitalId: hospital.id },
                data: {
                    plan,
                    status: "ACTIVE",
                    startDate,
                    endDate,
                    amount: amount,
                    currency: "XOF",
                    autoRenew: false, // Ou true selon votre logique métier
                },
            });
        } else {
            // Création d'une nouvelle souscription
            subscription = await prisma.subscription.create({
                data: {
                    subscriberType: "HOSPITAL",
                    hospitalId: hospital.id,
                    plan,
                    status: "ACTIVE",
                    startDate,
                    endDate,
                    amount: amount,
                    currency: "XOF",
                    autoRenew: false,
                },
            });
        }

        return NextResponse.json(subscription);
    } catch (error) {
        console.error("Error updating subscription:", error);
        return NextResponse.json(
            { error: "Failed to update subscription" },
            { status: 500 }
        );
    }
}
