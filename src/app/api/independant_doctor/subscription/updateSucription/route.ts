export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SubscriptionPlan } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "INDEPENDENT_DOCTOR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, months, amount } = body;

    if (!plan || !Object.values(SubscriptionPlan).includes(plan)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      include: { subscription: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Médecin introuvable" }, { status: 404 });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    let subscription;

    if (doctor.subscription) {
      const baseDate = doctor.subscription.plan === plan
        ? doctor.subscription.endDate
        : startDate;
      const newEndDate = new Date(baseDate);
      newEndDate.setMonth(newEndDate.getMonth() + months);

      subscription = await prisma.subscription.update({
        where: { doctorId: doctor.id },
        data: {
          plan,
          status: "ACTIVE",
          startDate: doctor.subscription.plan === plan
            ? doctor.subscription.startDate
            : startDate,
          endDate: newEndDate,
          amount,
          currency: "XOF",
          autoRenew: false,
        },
      });
    } else {
      subscription = await prisma.subscription.create({
        data: {
          subscriberType: "DOCTOR",
          doctorId: doctor.id,
          plan,
          status: "ACTIVE",
          startDate,
          endDate,
          amount,
          currency: "XOF",
          autoRenew: false,
        },
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Erreur abonnement médecin :", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
