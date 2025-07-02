export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Quotas de patients selon le plan d’abonnement
const PATIENT_QUOTAS = {
  FREE: 50,
  STANDARD: 200,
  PREMIUM: Infinity,
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "INDEPENDENT_DOCTOR") {
    return NextResponse.json(
      { error: "Accès non autorisé. Seuls les médecins indépendants peuvent accéder à cette ressource." },
      { status: 401 }
    );
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      include: {
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
        appointments: {
          select: {
            patientId: true,
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Médecin introuvable" }, { status: 404 });
    }

    const subscription = doctor.subscription;

    if (!subscription) {
      return NextResponse.json({
        info: "Aucun abonnement actif",
        suggestion: "Veuillez souscrire à un abonnement pour accéder aux fonctionnalités.",
      }, { status: 404 });
    }

    const currentDate = new Date();
    const endDate = new Date(subscription.endDate);
    const timeDiff = endDate.getTime() - currentDate.getTime();
    const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Nombre de patients uniques vus par le médecin
    const uniquePatientIds = new Set(doctor.appointments.map(a => a.patientId));
    const currentPatients = uniquePatientIds.size;

    const planQuota = PATIENT_QUOTAS[subscription.plan];
    const maxPatients = planQuota === Infinity ? "Illimité" : planQuota;
    const remainingSlots = planQuota === Infinity ? "Illimité" : planQuota - currentPatients;
    const canAddMorePatients = planQuota === Infinity || currentPatients < planQuota;

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      autoRenew: subscription.autoRenew,
      currentPatients,
      maxPatients,
      remainingSlots,
      canAddMorePatients,
      daysUntilExpiration,
      payments: subscription.payments,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération de l'abonnement médecin:", error);
    return NextResponse.json({
      error: "Une erreur est survenue lors de la récupération des informations d’abonnement."
    }, { status: 500 });
  }
}
