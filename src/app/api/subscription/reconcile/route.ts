// app/api/subscriptions/reconcile/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { finalizePaymentByOrderId } from "@/lib/payments/finalize";

export const dynamic = "force-dynamic";

export async function GET() {
  const since = new Date(Date.now() - 2 * 60 * 60 * 1000); // last 2h
  const pendings = await prisma.subscriptionPayment.findMany({
    where: {
      status: PaymentStatus.PENDING,
      paymentDate: { gte: since },
      transactionId: { not: null },
    },
    select: { transactionId: true, payToken: true, amount: true },
    take: 100,
  });

  if (pendings.length === 0) return NextResponse.json({ ok: true, count: 0 });

  // verify each via your own status route (keeps auth in one place)
  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  let finalized = 0;

  for (const p of pendings) {
    try {
      const res = await fetch(`${base}/api/orange-money/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          order_id: p.transactionId,
          pay_token: p.payToken ?? undefined,
          amount: Math.round(Number(p.amount || 0)),
        }),
      });
      const j = await res.json().catch(() => ({}));
      const s = String(j?.status || j?.message || "").toUpperCase();
      const success = s.includes("SUCCESS") || s.includes("PAID");
      const r = await finalizePaymentByOrderId(p.transactionId!, success);
      if (r.ok) finalized++;
    } catch (e) {
      console.error("reconcile error", p.transactionId, e);
    }
  }

  return NextResponse.json({ ok: true, scanned: pendings.length, finalized });
}
