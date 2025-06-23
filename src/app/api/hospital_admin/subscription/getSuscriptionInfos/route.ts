export const dynamic = "force-dynamic" 


import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Quotas de médecins par type d'abonnement
const DOCTOR_QUOTAS = {
    FREE: 10,
    BASIC: 15,
    STANDARD: 20,
    PREMIUM: 30,
    ENTERPRISE: Infinity
};

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "HOSPITAL_ADMIN") {
            return NextResponse.json(
                { error: "Accès refusé : Vous devez être administrateur d'hôpital" },
                { status: 401 }
            );
        }

        // Récupérer l'hôpital avec son abonnement et le nombre de médecins
        const hospital = await prisma.hospital.findUnique({
            where: { adminId: session.user.id },
            include: {
                subscription: true,
                _count: {
                    select: { doctors: true }
                }
            }
        });

        if (!hospital) {
            return NextResponse.json(
                { error: "Hôpital non trouvé : Aucun hôpital associé à votre compte" },
                { status: 404 }
            );
        }

        if (!hospital.subscription) {
            return NextResponse.json(
                { 
                    error: "Abonnement manquant",
                    message: "Votre hôpital n'a pas d'abonnement actif"
                },
                { status: 403 }
            );
        }

        const currentDate = new Date();
        const isSubscriptionActive = 
            hospital.subscription.endDate >= currentDate && 
            hospital.subscription.status === 'ACTIVE';

        const plan = hospital.subscription.plan;
        const maxDoctors = DOCTOR_QUOTAS[plan];
        const currentDoctors = hospital._count.doctors;

        return NextResponse.json({
            plan,
            currentDoctors,
            maxDoctors,
            isActive: isSubscriptionActive,
            endDate: hospital.subscription.endDate,
            status: hospital.subscription.status,
            canAddMoreDoctors: isSubscriptionActive && (maxDoctors === Infinity || currentDoctors < maxDoctors),
            remainingSlots: maxDoctors === Infinity ? "Illimité" : maxDoctors - currentDoctors
        });

    } catch (error) {
        console.error("Erreur lors de la récupération de l'abonnement :", error);
        return NextResponse.json(
            { error: "Erreur serveur : Impossible de récupérer les informations d'abonnement" },
            { status: 500 }
        );
    }
}