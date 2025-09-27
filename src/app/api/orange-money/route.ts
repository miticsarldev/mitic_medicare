import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount, orderId, returnUrl, cancelUrl, notifUrl } = await req.json();

  const auth = Buffer.from(
    `${process.env.ORANGE_CLIENT_ID}:${process.env.ORANGE_CLIENT_SECRET}`
  ).toString("base64");

  // 1. Obtenir un access_token
  const tokenRes = await fetch("https://api.orange.com/oauth/v3/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return NextResponse.json({ error: "Token non obtenu" }, { status: 500 });
  }

  // 2. Initialiser une session de paiement
  const paymentRes = await fetch(
    "https://api.orange.com/orange-money-webpay/dev/v1/webpayment",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        merchant_key: process.env.ORANGE_MERCHANT_KEY,
        currency: "OUV", // En sandbox
        order_id: orderId,
        amount: amount,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notif_url: notifUrl,
        lang: "fr",
        reference: "MyShop Orange",
      }),
    }
  );

  const paymentData = await paymentRes.json();

  if (!paymentData?.payment_url) {
    return NextResponse.json(
      { error: "Erreur de création du paiement", details: paymentData },
      { status: 500 }
    );
  }

  return NextResponse.json({
    payment_url: paymentData.payment_url,
    pay_token: paymentData.pay_token,
  });
}
