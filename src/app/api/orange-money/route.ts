// app/api/orange-money/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOrangeAccessToken } from "@/lib/orange";

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId, returnUrl, cancelUrl, notifUrl, referenceId } =
      await req.json();
    if (!amount || !orderId) {
      return NextResponse.json(
        { error: "amount et orderId requis" },
        { status: 400 }
      );
    }

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
          amount: 1,
          //   amount: Math.round(amount),
          return_url: returnUrl,
          cancel_url: cancelUrl,
          notif_url: notifUrl,
          lang: "fr",
          reference: referenceId,
        }),
      }
    );

    const json = await res.json();
    if (!res.ok || !json?.payment_url || !json?.pay_token) {
      return NextResponse.json(
        { error: "Erreur de création du paiement Orange Money", details: json },
        { status: 500 }
      );
    }
    return NextResponse.json({
      payment_url: json.payment_url,
      pay_token: json.pay_token,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json({ error: "OM init error" }, { status: 500 });
  }
}
