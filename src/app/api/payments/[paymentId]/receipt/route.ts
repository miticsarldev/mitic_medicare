import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { paymentId: string } }
) {
  const { searchParams } = new URL(req.url);
  const asPdf = searchParams.get("format") === "pdf";

  const p = await prisma.subscriptionPayment.findUnique({
    where: { id: params.paymentId },
    include: {
      subscription: {
        include: { doctor: { include: { user: true } }, hospital: true },
      },
    },
  });

  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sub = p.subscription!;
  const who = sub.doctor?.user?.name ?? sub.hospital?.name ?? "Client";
  const currency = (p.currency || "XOF").toUpperCase();

  const html = `<!doctype html><html lang="fr"><meta charset="utf-8">
<title>Reçu #${p.id}</title>
<style>
  :root{--ink:#111827;--muted:#6b7280;--line:#e5e7eb}
  body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; padding: 24px; color:var(--ink); }
  h1 { margin: 0 0 8px; } .muted { color: var(--muted); }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { padding: 8px; border-bottom: 1px solid var(--line); text-align: left; }
  .right { text-align: right; }
  .meta { margin: 8px 0 2px; }
</style>
<h1>Reçu de paiement</h1>
<div class="muted">#${p.id}</div>
<p class="meta"><strong>Client&nbsp;:</strong> ${who}</p>
<p class="meta"><strong>Plan&nbsp;:</strong> ${sub.plan} (${sub.subscriberType})</p>
<p class="meta"><strong>Date&nbsp;:</strong> ${new Date(p.paymentDate).toLocaleDateString("fr-FR")}</p>

<table>
  <thead>
    <tr>
      <th>Libellé</th>
      <th class="right">Montant</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Paiement d'abonnement</td>
      <td class="right"><strong>${Number(p.amount).toLocaleString("fr-FR")} ${currency}</strong></td>
    </tr>
  </tbody>
</table>

<p class="meta"><strong>Statut&nbsp;:</strong> ${p.status}</p>
<p class="meta"><strong>Méthode&nbsp;:</strong> ${p.paymentMethod}</p>
<p class="meta"><strong>Transaction&nbsp;:</strong> ${p.transactionId ?? "—"}</p>
`;

  if (!asPdf) {
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
