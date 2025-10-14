// // app/api/orange-money/notify/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getOrangeAccessToken } from "@/lib/orange";
// import {
//   PaymentStatus,
//   SubscriptionStatus,
//   SubscriptionPlan,
// } from "@prisma/client";
// import { addMonths } from "date-fns";
// import prisma from "@/lib/prisma";

// export async function POST(req: NextRequest) {
//   try {
//     // Depending on Orange, you may receive order_id, pay_token, amount, status, etc.
//     const body = await req.json();
//     console.log("NOTIFICATION", { body });
//     const order_id: string | undefined = body?.order_id;
//     const pay_token: string | undefined = body?.pay_token;
//     const amount: number | undefined = Number(body?.amount);

//     if (!order_id) {
//       return NextResponse.json({ error: "order_id missing" }, { status: 400 });
//     }

//     // Look up our payment
//     await prisma.$transaction(async (tx) => {
//       const payment = await tx.subscriptionPayment.findFirst({
//         where: { transactionId: order_id },
//         include: { subscription: true },
//       });

//       if (!payment) return NextResponse.json({ ok: true }); // or 404, but idempotency matters

//       // Optional: verify by calling transactionstatus (good practice)
//       let isSuccess = false;

//       try {
//         const token = await getOrangeAccessToken();
//         const statusRes = await fetch(
//           "https://api.orange.com/orange-money-webpay/dev/v1/transactionstatus",
//           {
//             method: "POST",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//               Accept: "application/json",
//             },
//             body: JSON.stringify({
//               order_id,
//               amount, // include if you have it
//               pay_token: pay_token || payment.payToken,
//             }),
//           }
//         );
//         const statusJson = await statusRes.json();
//         const statusStr = String(
//           statusJson?.status || statusJson?.message || ""
//         ).toUpperCase();
//         isSuccess = statusStr.includes("SUCCESS") || statusStr.includes("PAID");
//         // Persist raw
//         await tx.subscriptionPayment.update({
//           where: { id: payment.id },
//           data: { status: PaymentStatus.COMPLETED },
//         });
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       } catch (_) {
//         // if status check fails, you could fallback to Orange’s pushed status in body
//         const pushed = String(
//           body?.status || body?.message || ""
//         ).toUpperCase();
//         isSuccess = pushed.includes("SUCCESS") || pushed.includes("PAID");
//       }

//       if (!isSuccess) {
//         await tx.subscriptionPayment.update({
//           where: { id: payment.id },
//           data: { status: PaymentStatus.FAILED },
//         });
//         return NextResponse.json({ ok: true });
//       }

//       // Mark payment completed
//       await tx.subscriptionPayment.update({
//         where: { id: payment.id },
//         data: { status: PaymentStatus.COMPLETED },
//       });

//       // Update subscription (decode orderId)
//       const sub = payment.subscription;
//       if (sub) {
//         const parts = order_id.split("-");
//         const kind = parts[0]; // REN or CHG
//         if (kind === "REN") {
//           const months = Math.max(1, parseInt(parts[2] || "1", 10));
//           const start =
//             new Date(sub.endDate) < new Date()
//               ? new Date()
//               : new Date(sub.endDate);
//           const end = addMonths(start, months);
//           await tx.subscription.update({
//             where: { id: sub.id },
//             data: {
//               status: SubscriptionStatus.ACTIVE,
//               startDate: start,
//               endDate: end,
//             },
//           });
//         } else if (kind === "CHG") {
//           const target = parts[1] as SubscriptionPlan;
//           const months = Math.max(1, parseInt(parts[3] || "1", 10));
//           const start =
//             new Date(sub.endDate) < new Date()
//               ? new Date()
//               : new Date(sub.endDate);
//           const end = addMonths(start, months);
//           await tx.subscription.update({
//             where: { id: sub.id },
//             data: {
//               plan: target,
//               status: SubscriptionStatus.ACTIVE,
//               startDate: start,
//               endDate: end,
//             },
//           });
//         }
//       }
//     });

//     return NextResponse.json({ ok: true });
//   } catch (e) {
//     console.error("OM notify error:", e);
//     return NextResponse.json({ error: "notify_failed" }, { status: 500 });
//   }
// }

// app/api/orange-money/notify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOrangeAccessToken } from "@/lib/orange";
import { finalizePaymentByOrderId } from "@/lib/payments/finalize";

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

    // Best-effort verification with Orange
    let success = false;
    try {
      const token = await getOrangeAccessToken();
      const statusRes = await fetch(
        "https://api.orange.com/orange-money-webpay/dev/v1/transactionstatus",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            order_id,
            amount, // optional, if available
            pay_token,
          }),
        }
      );
      const j = await statusRes.json();
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
