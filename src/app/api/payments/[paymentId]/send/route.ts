import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import your mailer

export async function POST(
  _req: Request,
  { params }: { params: { paymentId: string } }
) {
  const p = await prisma.subscriptionPayment.findUnique({
    where: { id: params.paymentId },
    include: {
      subscription: {
        include: { doctor: { include: { user: true } }, hospital: true },
      },
    },
  });
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const email =
    p.subscription.doctor?.user?.email ??
    p.subscription.hospital?.email ??
    null;

  if (!email)
    return NextResponse.json({ error: "No recipient" }, { status: 400 });

  // const html = renderReceiptHtml(p) // reuse the string from above
  // await mailer.send({ to: email, subject: `Reçu #${p.id}`, html });

  return NextResponse.json({ ok: true });
}
