export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const PATIENT_QUOTAS = {
  FREE: 50,
  STANDARD: 200,
  PREMIUM: Infinity,
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "INDEPENDENT_DOCTOR") {
    return NextResponse.json(
      { error: "Accès non autorisé. Réservé aux médecins indépendants." },
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
          select: { patientId: true },
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
        suggestion: "Veuillez souscrire à un abonnement.",
      }, { status: 404 });
    }

    const uniquePatientIds = new Set(doctor.appointments.map(a => a.patientId));
    const currentPatients = uniquePatientIds.size;

    const quota = PATIENT_QUOTAS[subscription.plan];
    const maxPatients = quota === Infinity ? "Illimité" : quota;
    const remainingSlots = quota === Infinity ? "Illimité" : quota - currentPatients;
    const canAddMorePatients = quota === Infinity || currentPatients < quota;

    const now = new Date();
    const daysLeft = Math.max(
      0,
      Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
    );

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
      daysUntilExpiration: daysLeft,
      payments: subscription.payments,
    });

  } catch (error) {
    console.error("Erreur abonnement médecin :", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
