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

        let subscription;
        const startDate = new Date();

        if (hospital.subscription) {
            // Calcul de la nouvelle date de fin
            const currentEndDate = hospital.subscription.endDate;
            const newEndDate = new Date(currentEndDate);
            
            // Si le plan est le même, on ajoute les mois à la date de fin existante
            // Sinon, on part de la date actuelle
            const baseDate = hospital.subscription.plan === plan ? currentEndDate : startDate;
            newEndDate.setMonth(baseDate.getMonth() + months);

            // Mise à jour de la souscription existante
            subscription = await prisma.subscription.update({
                where: { hospitalId: hospital.id },
                data: {
                    plan,
                    status: "TRIAL",
                    startDate: hospital.subscription.plan === plan ? hospital.subscription.startDate : startDate,
                    endDate: newEndDate,
                    amount: amount,
                    currency: "XOF",
                    autoRenew: false,
                },
            });
        } else {
            // Création d'une nouvelle souscription
            const endDate = new Date();
            endDate.setMonth(startDate.getMonth() + months);

            subscription = await prisma.subscription.create({
                data: {
                    subscriberType: "HOSPITAL",
                    hospitalId: hospital.id,
                    plan,
                    status: "TRIAL",
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