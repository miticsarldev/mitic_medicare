export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Définition des quotas de médecins par type d'abonnement
const DOCTOR_QUOTAS = {
  FREE: 10,
  STANDARD: 20,
  PREMIUM: 30,
  ENTERPRISE: Infinity,
};

// Type pour la réponse de l'API
type SubscriptionResponse = {
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  currentDoctors: number;
  maxDoctors: number | "Illimité";
  remainingSlots: number | "Illimité";
  canAddMoreDoctors: boolean;
  daysUntilExpiration: number;
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    paymentDate: Date;
  }>;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  // Vérification d'authentification et de rôle
  if (!session?.user?.id || session.user.role !== "HOSPITAL_ADMIN") {
    return NextResponse.json(
      {
        error:
          "Accès non autorisé. Seuls les administrateurs d'hôpital peuvent accéder à ces informations.",
      },
      { status: 401 }
    );
  }

  try {
    // Récupération des données en une seule requête optimisée
    const hospitalData = await prisma.hospital.findUnique({
      where: { adminId: session.user.id },
      select: {
        subscription: {
          include: {
            payments: {
              orderBy: { paymentDate: "desc" },
              select: {
                id: true,
                amount: true,
                currency: true,
                paymentMethod: true,
                status: true,
                paymentDate: true,
              },
            },
          },
        },
        _count: {
          select: { doctors: true },
        },
      },
    });

    if (!hospitalData?.subscription) {
      return NextResponse.json(
        {
          info: "Aucun abonnement actif",
          suggestion:
            "Veuillez souscrire à un abonnement pour accéder aux fonctionnalités complètes",
        },
        { status: 404 }
      );
    }

    const { subscription, _count } = hospitalData;
    const currentDate = new Date();
    const endDate = new Date(subscription.endDate);

    // Calcul des jours restants avant expiration
    const timeDiff = endDate.getTime() - currentDate.getTime();
    const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Détermination des quotas
    const maxDoctors =
      DOCTOR_QUOTAS[subscription.plan] === Infinity
        ? "Illimité"
        : DOCTOR_QUOTAS[subscription.plan];

    const remainingSlots =
      DOCTOR_QUOTAS[subscription.plan] === Infinity
        ? "Illimité"
        : DOCTOR_QUOTAS[subscription.plan] - _count.doctors;

    const canAddMoreDoctors =
      DOCTOR_QUOTAS[subscription.plan] === Infinity ||
      _count.doctors < DOCTOR_QUOTAS[subscription.plan];

    // Formatage de la réponse
    const response: SubscriptionResponse = {
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      autoRenew: subscription.autoRenew,
      currentDoctors: _count.doctors,
      maxDoctors,
      remainingSlots,
      canAddMoreDoctors,
      daysUntilExpiration,
      payments: subscription.payments.map((payment) => ({
        id: payment.id,
        amount:
          typeof payment.amount === "number"
            ? payment.amount
            : Number(payment.amount),
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentDate: payment.paymentDate,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des informations d'abonnement:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la récupération de vos informations d'abonnement",
        code: "SUBSCRIPTION_FETCH_ERROR",
      },
      { status: 500 }
    );
  }
}
