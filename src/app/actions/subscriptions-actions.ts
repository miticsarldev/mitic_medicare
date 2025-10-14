"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  PaymentMethod,
  PaymentStatus,
  type SubscriberType,
  type SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { getUnitPriceXOF, getActivePlansWithLimits } from "@/lib/billing";

import { addMonths } from "date-fns";
import { getOrangeAccessToken } from "@/lib/orange";

export type SubscriptionFilters = {
  q?: string; // search doctor/hospital/user/hospital email
  plan?: SubscriptionPlan | "ALL";
  status?: SubscriptionStatus | "ALL";
  type?: "ALL" | "DOCTOR" | "HOSPITAL";
  expiringInDays?: number | null; // e.g. 30
};

// ─────────────────────────────────────────────────────────────
// Delete a pending payment (only if it belongs to current user)
// ─────────────────────────────────────────────────────────────
export async function deletePendingPayment(orderId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const ctx = await getSelfSubscriptionCtx();
  if (!ctx?.sub) throw new Error("Subscription not found");

  // Only delete if it's still pending and linked to this subscription
  try {
    await prisma.subscriptionPayment.deleteMany({
      where: {
        subscriptionId: ctx.sub.id,
        transactionId: orderId,
      },
    });
  } catch (e) {
    throw e;
  }

  revalidatePath("dashboard/hopital_admin/management/pricing");

  return { ok: true };
}

// server action (simplified)
// ── Orange Money init (RENEW) — TRANSACTIONAL ────────────────────────────────
export async function createRenewCheckout(months: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const ctx = await getSelfSubscriptionCtx();
  if (!ctx?.sub) throw new Error("Subscription not found");
  if (ctx.sub.plan === "FREE")
    throw new Error("Le plan gratuit n’est pas renouvelable.");

  const unit = await getUnitPriceXOF({
    plan: ctx.sub.plan,
    subscriberType: ctx.subscriberType,
  });
  const total = unit.amount * Math.max(1, months);

  const orderId = `REN-${ctx.sub.id}-${months}-${Date.now()}`;
  const referenceId = `REF-${months}-${Date.now()}`;
  const urlFront = process.env.ORANGE_MONEY_API_RETURN_URL!;
  const base = process.env.NEXT_PUBLIC_BASE_URL!;

  // TX 1: create pending
  const payment = await prisma.subscriptionPayment.create({
    data: {
      subscriptionId: ctx.sub.id,
      paymentMethod: PaymentMethod.MOBILE_MONEY,
      status: PaymentStatus.PENDING,
      amount: total,
      currency: unit.currency,
      transactionId: orderId,
      provider: "ORANGE_MONEY",
    },
  });

  try {
    // Orange init (outside TX)
    const token = await getOrangeAccessToken();
    const res = await fetch(
      "https://api.orange.com/orange-money-webpay/dev/v1/webpayment",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          merchant_key: process.env.MITIC_ORANGE_MONEY_API_MERCHANT_KEY,
          currency: process.env.MITIC_ORANGE_MONEY_API_CURRENCY,
          order_id: orderId,
          amount: Math.round(total),
          return_url: `${urlFront}/dashboard/hopital_admin/management/pricing?return=1&order_id=${encodeURIComponent(orderId)}&amount=${Math.round(total)}`,
          cancel_url: `${urlFront}/dashboard/hopital_admin/management/pricing?err=cancel&order_id=${encodeURIComponent(orderId)}`,
          notif_url: `${base}/api/orange-money/notify`, // SERVER webhook
          lang: "fr",
          reference: referenceId,
        }),
      }
    );
    const json = await res.json();
    if (!res.ok || !json?.payment_url || !json?.pay_token) {
      throw new Error("Orange init failed");
    }

    // TX 2: update with pay_token
    await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: {
        payToken: json.pay_token,
        externalOrderId: referenceId,
      },
    });

    return { checkoutUrl: json.payment_url }; // client will redirect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
      },
    });
    throw e;
  }
}

// ── Orange Money init (CHANGE PLAN) — TRANSACTIONAL ──────────────────────────
export async function createChangePlanCheckout(
  plan: SubscriptionPlan,
  months: number
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const ctx = await getSelfSubscriptionCtx();
  if (!ctx?.sub) throw new Error("Subscription not found");
  if (ctx.sub.plan !== "FREE" && plan === "FREE") {
    throw new Error("Impossible de revenir au plan gratuit.");
  }
  if (ctx.sub.plan === plan) throw new Error("Ce plan est déjà actif.");

  const unit = await getUnitPriceXOF({
    plan,
    subscriberType: ctx.subscriberType,
  });
  const total = unit.amount * Math.max(1, months);

  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  const orderId = `CHG-${plan}-${ctx.sub.id}-${months}-${Date.now()}`;
  const referenceId = `REF_${months}_${Date.now()}`;

  let checkoutUrl = "";
  let payToken: string | undefined;

  await prisma.$transaction(async (tx) => {
    // 1) Pending payment
    await tx.subscriptionPayment.create({
      data: {
        subscriptionId: ctx.sub!.id,
        paymentMethod: PaymentMethod.MOBILE_MONEY,
        status: PaymentStatus.PENDING,
        amount: total,
        currency: unit.currency,
        transactionId: orderId,
      },
    });

    const urlFront = process.env.ORANGE_MONEY_API_RETURN_URL;

    // 2) Init OM
    const payload = {
      amount: Math.round(total),
      orderId,
      returnUrl: `${urlFront}/dashboard/hopital_admin/management/pricing?return=1&order_id=${encodeURIComponent(orderId)}&amount=${Math.round(total)}`,
      cancelUrl: `${urlFront}/dashboard/hopital_admin/management/pricing?err=cancel&order_id=${encodeURIComponent(orderId)}`,
      notifUrl: `${urlFront}/api/orange-money/notify`,
      referenceId,
    };

    const res = await fetch(`${base}/api/orange-money`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err?.error ?? "Erreur de création du paiement Orange Money"
      );
    }
    const json = await res.json();
    if (!json?.payment_url) {
      throw new Error("URL de paiement Orange Money introuvable");
    }

    checkoutUrl = json.payment_url;
    payToken = json.pay_token;
  });

  return { checkoutUrl, payToken };
}

// ── Context loader ─────────────────────────────────────────────────────────────
export async function getSelfSubscriptionCtx() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      doctor: {
        include: {
          user: true,
          subscription: {
            include: { payments: { orderBy: { paymentDate: "desc" } } },
          },
        },
      },
      hospital: {
        include: {
          subscription: {
            include: { payments: { orderBy: { paymentDate: "desc" } } },
          },
        },
      },
    },
  });
  if (!user) return null;

  if (user.role === "INDEPENDENT_DOCTOR") {
    return {
      subscriberType: "DOCTOR" as SubscriberType,
      sub: user.doctor?.subscription ?? null,
      whoId: user.doctor?.id ?? null,
      whoName: user.doctor?.user.name ?? user.name,
    };
  }
  if (user.role === "HOSPITAL_ADMIN") {
    return {
      subscriberType: "HOSPITAL" as SubscriberType,
      sub: user.hospital?.subscription ?? null,
      whoId: user.hospital?.id ?? null,
      whoName: user.hospital?.name ?? user.name,
    };
  }
  return null;
}

export async function loadSubscriptionSelfPage() {
  const ctx = await getSelfSubscriptionCtx();
  if (!ctx) throw new Error("Unauthorized");
  const plans = await getActivePlansWithLimits();
  const priceMap: Record<SubscriptionPlan, number> = {
    FREE: (
      await getUnitPriceXOF({
        plan: "FREE",
        subscriberType: ctx.subscriberType,
      })
    ).amount,
    STANDARD: (
      await getUnitPriceXOF({
        plan: "STANDARD",
        subscriberType: ctx.subscriberType,
      })
    ).amount,
    PREMIUM: (
      await getUnitPriceXOF({
        plan: "PREMIUM",
        subscriberType: ctx.subscriberType,
      })
    ).amount,
  };
  return { ctx, plans, priceMap };
}

// ── Finalization after redirect back from OM ──────────────────────────────────
export async function finalizeFromReturn(
  orderId: string,
  amount: string,
  payToken?: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // The client will POST us pay_token it reads from OM’s redirect (query)
  if (!orderId || !payToken || !amount)
    return { ok: false, reason: "missing_params" };

  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  // ask our status route (it performs OAuth + transactionstatus)
  const token = await getOrangeAccessToken();
  const statusRes = await fetch(`${base}/api/orange-money/status`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({ order_id: orderId, pay_token: payToken, amount }),
  });
  const status = await statusRes.json();

  // Accept both "SUCCESS" / "PAID" styles; you can tune this to Orange's exact payload
  const success = String(status?.status || status?.message || "")
    .toUpperCase()
    .includes("SUCCESS");

  // Locate the pending payment by transactionId=orderId
  await prisma.$transaction(async (tx) => {
    const payment = await tx.subscriptionPayment.findFirst({
      where: { transactionId: orderId },
      include: { subscription: true },
    });
    if (!payment) return { ok: false, reason: "payment_not_found" };

    if (!success) {
      await tx.subscriptionPayment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      return { ok: false, reason: "not_success" };
    }

    // Mark as completed
    await tx.subscriptionPayment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.COMPLETED },
    });

    const sub = await tx.subscription.findUnique({
      where: { id: payment.subscriptionId },
    });
    if (!sub) return { ok: true, reason: "sub_missing_but_paid" };

    // Decode action from orderId
    // REN-<subId>-<months>-<ts>  |  CHG-<plan>-<subId>-<months>-<ts>
    const parts = orderId.split("-");
    const kind = parts[0]; // REN or CHG

    if (kind === "REN") {
      const months = Math.max(1, parseInt(parts[2] || "1", 10));
      const newStart =
        new Date(sub.endDate) < new Date() ? new Date() : new Date(sub.endDate);
      const newEnd = addMonths(newStart, months);
      await tx.subscription.update({
        where: { id: sub.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          startDate: newStart,
          endDate: newEnd,
        },
      });
    } else if (kind === "CHG") {
      const target = parts[1] as SubscriptionPlan; // STANDARD | PREMIUM
      const months = Math.max(1, parseInt(parts[3] || "1", 10));
      const newStart = new Date();
      const newEnd = addMonths(newStart, months);
      await tx.subscription.update({
        where: { id: sub.id },
        data: {
          plan: target as SubscriptionPlan,
          status: SubscriptionStatus.ACTIVE,
          startDate: newStart,
          endDate: newEnd,
        },
      });
    }
  });

  return { ok: true };
}
