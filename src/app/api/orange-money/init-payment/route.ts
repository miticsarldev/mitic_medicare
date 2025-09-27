// app/api/orange/init-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { PaymentInitResponse } from "@/types";

// Types optionnels pour valider les inputs
interface PaymentRequestBody {
  amount: number;
  order_id?: string;
  reference_id?: string;
  access_token: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PaymentRequestBody;

    if (!body.amount || isNaN(body.amount)) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    const response = await axios.post<PaymentInitResponse>(
      "https://api.orange.com/orange-money-webpay/dev/v1/webpayment",
      {
        merchant_key: process.env.EXPO_PUBLIC_ORANGE_MONEY_API_MERCHANT_KEY,
        currency: "OUV",
        order_id: body.order_id?.toString(),
        reference_id: body.reference_id?.toString(),
        amount: body.amount,
        return_url:
          "https://orange-money-redirect.vercel.app/payment-callback?link=return_url",
        cancel_url:
          "https://orange-money-redirect.vercel.app/payment-callback?link=cancel_url",
        notif_url:
          "https://orange-money-redirect.vercel.app/payment-notification",
        lang: "fr",
      },
      {
        headers: {
          Authorization: `Bearer ${body.access_token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(
      "Erreur init paiement Orange:",
      error?.response?.data || error.message
    );
    return NextResponse.json(
      { error: "Erreur lors de l'initialisation du paiement Orange" },
      { status: 500 }
    );
  }
}
