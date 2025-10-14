/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Subscription,
  SubscriptionPayment,
  SubscriptionPlan,
  PlanConfig,
  PlanLimits,
  SubscriberType,
} from "@prisma/client";
import {
  createChangePlanCheckout,
  createRenewCheckout,
  deletePendingPayment,
  finalizeFromReturn,
} from "@/app/actions/subscriptions-actions";
import { Loader2 } from "lucide-react";

type Ctx = {
  subscriberType: SubscriberType;
  whoId: string | null;
  whoName: string | null;
  sub: (Subscription & { payments: SubscriptionPayment[] }) | null;
};
type Props = {
  ctx: Ctx;
  plans: (PlanConfig & { limits: PlanLimits | null })[];
  priceMap: Record<SubscriptionPlan, number>;
};

const PLAN_LABEL: Record<SubscriptionPlan, string> = {
  FREE: "Gratuit",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

export default function SubscriptionSelfClient({
  ctx,
  plans,
  priceMap,
}: Props) {
  const sp = useSearchParams();
  const [checkingReturn, setCheckingReturn] = React.useState(false);

  React.useEffect(() => {
    const orderId = sp.get("order_id");
    const payToken = localStorage.getItem("mitic_current_data") ?? null;
    const hasReturn = sp.get("return") === "1";
    const err = sp.get("err");
    const amount = sp.get("amount");

    (async () => {
      if (err) {
        toast({
          title: "Paiement annulé",
          description: "Vous pouvez réessayer quand vous voulez.",
          variant: "destructive",
        });
        return;
      }
      if (hasReturn && orderId && payToken && amount) {
        setCheckingReturn(true);
        try {
          const res = await finalizeFromReturn(orderId, amount, payToken);
          if (res?.ok) {
            toast({
              title: "Paiement confirmé",
              description: "Votre abonnement a été mis à jour.",
            });
            localStorage.removeItem("mitic_current_data");
          } else {
            toast({
              title: "Vérification incomplète",
              description: "Merci de patienter ou réessayer.",
              variant: "destructive",
            });
          }
        } finally {
          setCheckingReturn(false);
        }
      }
    })();
  }, [sp]);

  if (!ctx.sub) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Abonnement</CardTitle>
            <CardDescription>
              Aucun abonnement trouvé pour votre profil.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const sub = ctx.sub;
  const isFree = sub.plan === "FREE";

  const currency = "XOF";
  const unitCurrent = priceMap[sub.plan] ?? Number(sub.amount) ?? 0;

  return (
    <div className="mx-auto max-w-6xl p-2 sm:p-4 space-y-4">
      {checkingReturn && (
        <div className="flex items-center gap-2 text-sm rounded-md border bg-card px-3 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Vérification du paiement en cours…</span>
        </div>
      )}

      {/* Summary */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Mon abonnement</CardTitle>
            <CardDescription>
              {ctx.whoName} — {ctx.subscriberType}
            </CardDescription>
          </div>
          <Badge variant="outline" className="uppercase">
            {sub.status}
          </Badge>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Info label="Plan" value={<Badge>{PLAN_LABEL[sub.plan]}</Badge>} />
          <Info
            label="Période"
            value={`${format(new Date(sub.startDate), "dd/MM/yyyy")} → ${format(new Date(sub.endDate), "dd/MM/yyyy")}`}
          />
          <Info
            label="Prix mensuel (référence)"
            value={money(unitCurrent, currency)}
          />
          <Info
            label="Renouvellement automatique"
            value={sub.autoRenew ? "Activé" : "Désactivé"}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            {isFree
              ? "Le plan gratuit n’est pas renouvelable. Passez à un plan payant pour continuer."
              : "Renouvelez votre plan ou changez de plan."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFree ? (
            <ChangePlanSection
              current={sub.plan}
              plans={plans
                .sort((a, b) => {
                  return b.name.localeCompare(a.name);
                })
                .filter((p) => p.code !== "FREE")}
              priceMap={priceMap}
              onConfirm={async (plan, months, setLoading) => {
                try {
                  setLoading(true);
                  const r = await createChangePlanCheckout(plan, months);
                  if (r.payToken) {
                    localStorage.setItem("mitic_current_data", r.payToken);
                  }
                  window.location.assign(r.checkoutUrl);
                } catch (e: any) {
                  toast({
                    title: "Erreur",
                    description:
                      e?.message ?? "Échec de l'initialisation du paiement",
                    variant: "destructive",
                  });
                } finally {
                  setLoading(false);
                }
              }}
            />
          ) : (
            <Tabs defaultValue="renew">
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="renew">Renouveler</TabsTrigger>
                <TabsTrigger value="change">Changer de plan</TabsTrigger>
              </TabsList>

              <TabsContent value="renew" className="pt-4">
                <RenewSection
                  unit={unitCurrent}
                  currency={currency}
                  onConfirm={async (months, setLoading) => {
                    try {
                      setLoading(true);
                      const r = await createRenewCheckout(months);
                      if ((r as any)?.payToken) {
                        localStorage.setItem(
                          "mitic_current_data",
                          (r as any).payToken
                        );
                      }
                      window.location.assign(r.checkoutUrl);
                    } catch (e: any) {
                      toast({
                        title: "Erreur",
                        description:
                          e?.message ?? "Échec de l'initialisation du paiement",
                        variant: "destructive",
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="change" className="pt-4">
                <ChangePlanSection
                  current={sub.plan}
                  plans={plans
                    .sort((a, b) => {
                      return b.name.localeCompare(a.name);
                    })
                    .filter((p) => p.code !== "FREE")}
                  priceMap={priceMap}
                  onConfirm={async (plan, months, setLoading) => {
                    try {
                      setLoading(true);
                      const r = await createChangePlanCheckout(plan, months);
                      if (r.payToken) {
                        localStorage.setItem("mitic_current_data", r.payToken);
                      }
                      window.location.assign(r.checkoutUrl);
                    } catch (e: any) {
                      toast({
                        title: "Erreur",
                        description:
                          e?.message ?? "Échec de l'initialisation du paiement",
                        variant: "destructive",
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      <PaymentsCard
        payments={sub.payments}
        currency={currency}
        plan={sub.plan}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function RenewSection({
  unit,
  currency,
  onConfirm,
}: {
  unit: number;
  currency: string;
  onConfirm: (
    months: number,
    setLoading: (v: boolean) => void
  ) => Promise<void>;
}) {
  const [months, setMonths] = React.useState(1);
  const [method, setMethod] = React.useState<"OM" | "CASH">("OM");
  const [loading, setLoading] = React.useState(false);

  const total = unit * months;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Mois</Label>
          <Input
            type="number"
            min={1}
            step={1}
            value={months}
            onChange={(e) =>
              setMonths(Math.max(1, parseInt(e.target.value || "1", 10)))
            }
            disabled={loading}
          />
        </div>
        <div>
          <Label>Total</Label>
          <div className="h-10 flex items-center rounded-md border px-3 text-sm font-semibold">
            {money(total, currency)}
          </div>
        </div>
        <div>
          <Label>Méthode</Label>
          <RadioGroup
            value={method}
            onValueChange={(v: "OM" | "CASH") => setMethod(v)}
            className="flex gap-4 h-10 items-center"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="OM" id="om-renew" disabled={loading} />
              <Label htmlFor="om-renew">Orange Money</Label>
            </div>
            <div className="flex items-center space-x-2 opacity-50 pointer-events-none">
              <RadioGroupItem value="CASH" id="cash-renew" disabled />
              <Label htmlFor="cash-renew">Cash (contactez-nous)</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      <CardFooter className="justify-end gap-2 px-0">
        <Button
          onClick={() => onConfirm(months, setLoading)}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirection…
            </>
          ) : (
            "Confirmer et payer (Orange Money)"
          )}
        </Button>
      </CardFooter>
      <p className="text-xs text-muted-foreground">
        Pour le paiement en espèces, veuillez nous contacter. Le bouton est
        désactivé par défaut.
      </p>
    </div>
  );
}

function ChangePlanSection({
  current,
  plans,
  priceMap,
  onConfirm,
}: {
  current: SubscriptionPlan;
  plans: (PlanConfig & { limits: PlanLimits | null })[];
  priceMap: Record<SubscriptionPlan, number>;
  onConfirm: (
    plan: SubscriptionPlan,
    months: number,
    setLoading: (v: boolean) => void
  ) => Promise<void>;
}) {
  const [target, setTarget] = React.useState<SubscriptionPlan>(
    current === "STANDARD" ? "PREMIUM" : "STANDARD"
  );
  const [months, setMonths] = React.useState(1);
  const [method, setMethod] = React.useState<"OM" | "CASH">("OM");
  const [loading, setLoading] = React.useState(false);

  const unit = priceMap[target] ?? 0;
  const total = unit * months;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Nouveau plan</Label>
          <select
            className="h-10 w-full rounded-md border px-3 text-sm bg-background"
            value={target}
            onChange={(e) => setTarget(e.target.value as SubscriptionPlan)}
            disabled={loading}
          >
            {plans
              .filter((p) => p.code !== current)
              .map((p) => (
                <option key={p.id} value={p.code}>
                  {PLAN_LABEL[p.code]} — {money(priceMap[p.code] ?? 0)}
                </option>
              ))}
          </select>
        </div>
        <div>
          <Label>Mois</Label>
          <Input
            type="number"
            min={1}
            step={1}
            value={months}
            onChange={(e) =>
              setMonths(Math.max(1, parseInt(e.target.value || "1", 10)))
            }
            disabled={loading}
          />
        </div>
        <div>
          <Label>Total</Label>
          <div className="h-10 flex items-center rounded-md border px-3 text-sm font-semibold">
            {money(total)}
          </div>
        </div>
      </div>

      <div>
        <Label>Méthode</Label>
        <RadioGroup
          value={method}
          onValueChange={(v: "OM" | "CASH") => setMethod(v)}
          className="flex gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="OM" id="om-change" disabled={loading} />
            <Label htmlFor="om-change">Orange Money</Label>
          </div>
          <div className="flex items-center space-x-2 opacity-50 pointer-events-none">
            <RadioGroupItem value="CASH" id="cash-change" disabled />
            <Label htmlFor="cash-change">Cash (contactez-nous)</Label>
          </div>
        </RadioGroup>
      </div>

      <CardFooter className="justify-end gap-2 px-0">
        <Button
          onClick={() => onConfirm(target, months, setLoading)}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirection…
            </>
          ) : (
            "Confirmer et payer (Orange Money)"
          )}
        </Button>
      </CardFooter>
      <p className="text-xs text-muted-foreground">
        Le plan gratuit n’est pas disponible comme cible lors d’un changement.
      </p>
    </div>
  );
}

function PaymentsCard({
  payments,
  currency,
  plan,
}: {
  payments: SubscriptionPayment[];
  currency: string;
  plan: SubscriptionPlan;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paiements</CardTitle>
        <CardDescription>
          Historique de vos paiements d’abonnement
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun paiement pour l’instant.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="[&>th]:py-2 [&>th]:px-2 text-left">
                <th>Date de paiement</th>
                <th>Statut</th>
                <th>Méthode</th>
                <th>Plan</th>
                <th>Total</th>
                <th className="text-right">Reçu</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="[&>td]:py-2 [&>td]:px-2 border-b last:border-0"
                >
                  <td>{format(new Date(p.paymentDate), "dd/MM/yyyy")}</td>
                  <td>{badgePaymentStatus(p.status)}</td>
                  <td>Orange Money</td>
                  <td>
                    <Badge variant="outline">{PLAN_LABEL[plan]}</Badge>
                  </td>
                  <td className="font-medium">
                    {money(
                      Number(p.amount),
                      (p.currency || currency).toUpperCase()
                    )}
                  </td>
                  <td className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(`/api/payments/${p.id}/receipt`, "_blank")
                      }
                    >
                      Imprimer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await deletePendingPayment(p.transactionId!);
                          toast({
                            title: "Paiement annulé",
                            description:
                              "Le paiement en attente a été supprimé avec succès.",
                          });
                        } catch (e: any) {
                          toast({
                            title: "Erreur",
                            description:
                              e?.message ??
                              "Impossible de supprimer le paiement en attente.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Supprimer cette tentative
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

function money(n: number, c = "XOF") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: c,
  }).format(n);
}

function badgePaymentStatus(s: SubscriptionPayment["status"]) {
  const base =
    "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium";
  switch (s) {
    case "COMPLETED":
      return <span className={`${base} bg-emerald-600 text-white`}>Payé</span>;
    case "PENDING":
      return (
        <span className={`${base} bg-amber-500 text-white`}>En attente</span>
      );
    case "REFUNDED":
      return (
        <span className={`${base} bg-blue-600 text-white`}>Remboursé</span>
      );
    default:
      return <span className={`${base} bg-red-600 text-white`}>Échec</span>;
  }
}
