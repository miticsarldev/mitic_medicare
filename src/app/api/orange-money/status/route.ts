// app/api/orange-money/notify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { finalizePaymentByOrderId } from "@/lib/payments/finalize";

// Optional: tighten by checking Orange IPs / shared secret if available

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const order_id: string | undefined = body?.order_id;
    const pay_token: string | undefined = body?.pay_token;
    const amount: number | undefined = body?.amount
      ? Number(body.amount)
      : undefined;

    if (!order_id) {
      return NextResponse.json({ error: "order_id missing" }, { status: 400 });
    }

    // Ask our own status route (which already wraps Orange auth + POST)
    const base = process.env.NEXT_PUBLIC_BASE_URL!;
    let success = false;
    try {
      const statusRes = await fetch(`${base}/api/orange-money/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ order_id, pay_token, amount }),
      });
      const j = await statusRes.json().catch(() => ({}));
      const s = String(j?.status || j?.message || "").toUpperCase();
      success = s.includes("SUCCESS") || s.includes("PAID");
    } catch {
      // Fallback to pushed status
      const pushed = String(body?.status || body?.message || "").toUpperCase();
      success = pushed.includes("SUCCESS") || pushed.includes("PAID");
    }

    const result = await finalizePaymentByOrderId(order_id, success);
    return NextResponse.json({ ...result });
  } catch (e) {
    console.error("OM notify error:", e);
    return NextResponse.json({ error: "notify_failed" }, { status: 500 });
  }
}
