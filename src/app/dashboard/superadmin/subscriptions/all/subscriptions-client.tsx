/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, differenceInDays } from "date-fns";
import {
  Building2,
  CalendarClock,
  Search,
  Settings2,
  ShieldCheck,
  User2,
} from "lucide-react";
import type {
  Subscription,
  Doctor,
  Hospital,
  User,
  PlanConfig,
  PlanLimits,
  SubscriptionPlan,
  SubscriptionStatus,
  PaymentStatus,
  SubscriptionPayment,
  PaymentMethod,
} from "@prisma/client";
import { cn } from "@/lib/utils";

type PlanWithStats = {
  code: PlanConfig["code"];
  cfg: PlanConfig & { limits: PlanLimits | null };
  subscribers: number;
  doctors: number;
  hospitals: number;
};

type DocSub = Subscription & {
  doctor: Doctor & { user: User };
  payments: SubscriptionPayment[];
} & {
  _type: "DOCTOR";
};
type HospSub = Subscription & {
  hospital: Hospital | null;
  payments: SubscriptionPayment[];
} & {
  _type: "HOSPITAL";
};

type Filters = {
  q: string;
  plan: SubscriptionPlan | "ALL";
  status: SubscriptionStatus | "ALL";
  type: "ALL" | "DOCTOR" | "HOSPITAL";
  expiringInDays: string; // "", "7", "30", "90"
};

export default function SubscriptionsClient({
  plans,
  doctorSubs,
  hospitalSubs,
}: {
  plans: PlanWithStats[];
  doctorSubs: DocSub[];
  hospitalSubs: HospSub[];
}) {
  const planMap = Object.fromEntries(plans.map((p) => [p.code, p.cfg]));

  const allSubs = React.useMemo(() => {
    return [
      ...doctorSubs.map((s) => ({ ...s, _type: "DOCTOR" as const })),
      ...hospitalSubs.map((s) => ({ ...s, _type: "HOSPITAL" as const })),
    ];
  }, [doctorSubs, hospitalSubs]);

  // ---------- local filtering (client-side; if data grows, switch to server)
  const [filters, setFilters] = React.useState<Filters>({
    q: "",
    plan: "ALL",
    status: "ALL",
    type: "ALL",
    expiringInDays: "",
  });

  const filtered = React.useMemo(() => {
    const now = new Date();
    const exp = filters.expiringInDays ? parseInt(filters.expiringInDays) : 0;

    return allSubs.filter((s) => {
      if (filters.plan !== "ALL" && s.plan !== filters.plan) return false;
      if (filters.status !== "ALL" && s.status !== filters.status) return false;
      if (filters.type !== "ALL" && s._type !== filters.type) return false;

      if (exp > 0) {
        const end = new Date(s.endDate);
        const d = differenceInDays(end, now);
        if (d < 0 || d > exp) return false;
      }

      if (filters.q.trim()) {
        const q = filters.q.toLowerCase().trim();
        const name =
          s._type === "DOCTOR" ? s.doctor.user.name : (s.hospital?.name ?? "");
        const email =
          s._type === "DOCTOR"
            ? s.doctor.user.email
            : (s.hospital?.email ?? "");
        const hay = `${name} ${email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allSubs, filters]);

  const expiringSoon = filtered.filter(
    (s) =>
      differenceInDays(new Date(s.endDate), new Date()) <= 30 &&
      differenceInDays(new Date(s.endDate), new Date()) >= 0
  ).length;

  // ---------- edit modal
  return (
    <div className="space-y-4 p-4">
      {/* Header + KPIs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Abonnements</h2>
          <p className="text-muted-foreground">
            Médecins indépendants & hôpitaux — plans, montants et échéances.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Actifs"
          value={filtered.filter((s) => s.status === "ACTIVE").length}
        />
        <KpiCard
          icon={<CalendarClock className="h-4 w-4" />}
          label="Expirent ≤ 30 j"
          value={expiringSoon}
        />
        <KpiCard
          icon={<Settings2 className="h-4 w-4" />}
          label="Total filtré"
          value={filtered.length}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-6">
            <div className="md:col-span-2">
              <Label>Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Nom ou email..."
                  value={filters.q}
                  onChange={(e) =>
                    setFilters({ ...filters, q: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Plan</Label>
              <Select
                value={filters.plan}
                onValueChange={(v) =>
                  setFilters({
                    ...filters,
                    plan: v as SubscriptionPlan | "ALL",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous</SelectItem>
                  {plans.map((p) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Statut</Label>
              <Select
                value={filters.status}
                onValueChange={(v) =>
                  setFilters({
                    ...filters,
                    status: v as SubscriptionStatus | "ALL",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous</SelectItem>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="TRIAL">Essai</SelectItem>
                  <SelectItem value="INACTIVE">Inactif</SelectItem>
                  <SelectItem value="EXPIRED">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={filters.type}
                onValueChange={(v) =>
                  setFilters({ ...filters, type: v as Filters["type"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous</SelectItem>
                  <SelectItem value="DOCTOR">Médecins</SelectItem>
                  <SelectItem value="HOSPITAL">Hôpitaux</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Échéance (jours)</Label>
              <Select
                value={filters.expiringInDays}
                onValueChange={(v) =>
                  setFilters({
                    ...filters,
                    expiringInDays: v === "all" ? "" : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">—</SelectItem>
                  <SelectItem value="7">≤ 7</SelectItem>
                  <SelectItem value="30">≤ 30</SelectItem>
                  <SelectItem value="90">≤ 90</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lists */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="doctors">Médecins</TabsTrigger>
          <TabsTrigger value="hospitals">Hôpitaux</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <SubList items={filtered} planMap={planMap} />
        </TabsContent>

        <TabsContent value="doctors">
          <SubList
            items={filtered.filter((s) => s._type === "DOCTOR")}
            planMap={planMap}
          />
        </TabsContent>

        <TabsContent value="hospitals">
          <SubList
            items={filtered.filter((s) => s._type === "HOSPITAL")}
            planMap={planMap}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="border-2">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function statusBadge(s: SubscriptionStatus) {
  switch (s) {
    case "ACTIVE":
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-600">Actif</Badge>
      );
    case "TRIAL":
      return <Badge className="bg-blue-600 hover:bg-blue-600">Essai</Badge>;
    case "EXPIRED":
      return <Badge variant="destructive">Expiré</Badge>;
    default:
      return <Badge variant="secondary">Inactif</Badge>;
  }
}

function SubList({
  items,
  planMap,
}: {
  items: (DocSub | (HospSub & { _type: "DOCTOR" | "HOSPITAL" }))[];
  planMap: Record<string, PlanConfig & { limits: PlanLimits | null }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Résultats ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-9 gap-2 text-sm text-muted-foreground px-2">
          <div className="col-span-2">Client</div>
          <div>Type</div>
          <div>Plan</div>
          <div>Montant</div>
          <div>Début</div>
          <div>Fin</div>
          <div>Statut</div>
          <div>Paiements</div>
        </div>
        <div className="divide-y">
          {items.map((s) => {
            const cfg = planMap[s.plan];
            const name =
              s._type === "DOCTOR"
                ? (s as any).doctor.user.name
                : (s as any).hospital?.name;
            const icon =
              s._type === "DOCTOR" ? (
                <User2 className="h-4 w-4" />
              ) : (
                <Building2 className="h-4 w-4" />
              );

            const now = new Date();
            const daysLeft = differenceInDays(new Date(s.endDate), now);

            return (
              <div
                key={s.id}
                className="grid grid-cols-9 gap-2 items-center px-2 py-3 hover:bg-muted/40 rounded-lg transition"
              >
                <div className="col-span-2 flex items-center gap-2 truncate">
                  {icon}
                  <span className="truncate">{name}</span>
                </div>
                <div className="uppercase text-xs">{s._type}</div>
                <div>
                  <Badge variant="outline">{s.plan}</Badge>
                </div>
                <div>
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: (
                      s.currency ??
                      cfg?.currency ??
                      "XOF"
                    ).toUpperCase(),
                  }).format(
                    s.amount ? Number(s.amount) : Number(cfg?.price || 0)
                  )}
                </div>
                <div>{format(new Date(s.startDate), "dd/MM/yyyy")}</div>
                <div
                  className={cn(
                    "font-medium",
                    daysLeft < 0 || s.status === "EXPIRED"
                      ? "text-red-600"
                      : daysLeft <= 7
                        ? "text-amber-600"
                        : undefined
                  )}
                  title={
                    daysLeft < 0
                      ? `Expiré il y a ${Math.abs(daysLeft)} j`
                      : `Expire dans ${daysLeft} j`
                  }
                >
                  {format(new Date(s.endDate), "dd/MM/yyyy")}
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(s.status)}
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Badge variant="secondary">{s?.payments?.length}</Badge>
                  <PaymentsDialogTrigger subscription={s} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentsDialogTrigger({
  subscription,
}: {
  subscription: DocSub | HospSub;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Voir
      </Button>
      {open && (
        <PaymentsDialog
          open={open}
          onOpenChange={setOpen}
          subscription={subscription}
        />
      )}
    </>
  );
}

function ReceiptActions({ payment }: { payment: SubscriptionPayment }) {
  const receiptUrl = `/api/payments/${payment.id}/receipt`; // 👈 see route below

  return (
    <div className="flex gap-2 justify-end">
      <Button
        size="sm"
        variant="outline"
        onClick={() => window.open(receiptUrl, "_blank")}
      >
        Voir reçu
      </Button>
      <Button
        size="sm"
        onClick={async () => {
          // naive email trigger; implement server route below
          const res = await fetch(`${receiptUrl}/send`, { method: "POST" });
          if (res.ok) alert("Reçu envoyé");
          else alert("En cours d'implémentation");
        }}
      >
        Envoyer
      </Button>
    </div>
  );
}

// simple currency formatter
function formatCurrency(n: number, currency = "XOF") {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(
    n
  );
}

function paymentStatusBadge(s: PaymentStatus) {
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
    case "FAILED":
    case "CANCELED":
      return <span className={`${base} bg-red-600 text-white`}>Échec</span>;
  }
}

function humanMethod(m: PaymentMethod) {
  switch (m) {
    case "CREDIT_CARD":
      return "Carte";
    case "BANK_TRANSFER":
      return "Virement";
    case "MOBILE_MONEY":
      return "Mobile money";
    case "CASH":
      return "Espèces";
  }
}

export function PaymentsDialog({
  open,
  onOpenChange,
  subscription,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subscription: DocSub | HospSub;
}) {
  const s = subscription;
  const name =
    s._type === "DOCTOR" ? s.doctor.user.name : (s.hospital?.name ?? "");
  const payments = s.payments ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[950px]">
        <DialogHeader>
          <DialogTitle>
            Paiements — {name} ({s._type}) — {s.plan}
          </DialogTitle>
        </DialogHeader>

        {payments.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            Aucun paiement enregistré pour cet abonnement.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr className="[&>th]:py-2 [&>th]:px-2 text-left">
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Méthode</th>
                  <th>Plan</th>
                  <th>Qté (mois)</th>
                  <th>Total</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const unit = Number(p.amount); // assume monthly
                  const qty = 1;
                  const total = unit * qty;
                  const curr = p.currency?.toUpperCase() || "XOF";

                  return (
                    <tr
                      key={p.id}
                      className="[&>td]:py-2 [&>td]:px-2 border-b last:border-0"
                    >
                      <td>{format(new Date(p.paymentDate), "dd/MM/yyyy")}</td>
                      <td>{paymentStatusBadge(p.status)}</td>
                      <td className="capitalize">
                        {humanMethod(p.paymentMethod)}
                      </td>
                      <td>
                        <Badge variant="outline">{s.plan}</Badge>
                      </td>
                      <td>{qty}</td>
                      <td className="font-medium">
                        {formatCurrency(total, curr)}
                      </td>
                      <td className="text-right">
                        <ReceiptActions payment={p} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
