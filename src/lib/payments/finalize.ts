// lib/payments/finalize.ts
import { addMonths } from "date-fns";
import prisma from "@/lib/prisma";
import {
  PaymentStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";

/**
 * Finalize one payment by its orderId and apply subscription effects.
 * - Idempotent: safe to call multiple times.
 * - orderId format supported:
 *   REN-<subId>-<months>-<ts>
 *   CHG-<plan>-<subId>-<months>-<ts>
 */
export async function finalizePaymentByOrderId(
  orderId: string,
  success: boolean
) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.subscriptionPayment.findFirst({
      where: { transactionId: orderId },
      include: { subscription: true },
    });
    if (!payment) return { ok: false, reason: "payment_not_found" };

    // Idempotency: if already terminal, stop.
    if (payment.status === "COMPLETED") return { ok: true, already: true };
    if (!success) {
      await tx.subscriptionPayment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      return { ok: false, reason: "not_success" };
    }

    // Mark as paid
    await tx.subscriptionPayment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.COMPLETED },
    });

    const sub = payment.subscription;
    if (!sub) return { ok: true, reason: "subscription_missing_but_paid" };

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
          plan: target,
          status: SubscriptionStatus.ACTIVE,
          startDate: newStart,
          endDate: newEnd,
        },
      });
    }

    return { ok: true };
  });
}
