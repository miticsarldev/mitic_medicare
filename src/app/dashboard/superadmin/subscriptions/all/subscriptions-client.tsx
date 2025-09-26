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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
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
} from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  applyPlanPriceToSub,
  updateSubscription,
} from "@/app/actions/subscriptions-actions";

type PlanWithStats = {
  code: PlanConfig["code"];
  cfg: PlanConfig & { limits: PlanLimits | null };
  subscribers: number;
  doctors: number;
  hospitals: number;
};

type DocSub = Subscription & { doctor: Doctor & { user: User } } & {
  _type: "DOCTOR";
};
type HospSub = Subscription & { hospital: Hospital | null } & {
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
  const [editing, setEditing] = React.useState<(DocSub | HospSub) | null>(null);

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
          <SubList items={filtered} planMap={planMap} onEdit={setEditing} />
        </TabsContent>

        <TabsContent value="doctors">
          <SubList
            items={filtered.filter((s) => s._type === "DOCTOR")}
            planMap={planMap}
            onEdit={setEditing}
          />
        </TabsContent>

        <TabsContent value="hospitals">
          <SubList
            items={filtered.filter((s) => s._type === "HOSPITAL")}
            planMap={planMap}
            onEdit={setEditing}
          />
        </TabsContent>
      </Tabs>

      <EditDialog
        sub={editing}
        planMap={planMap}
        onClose={() => setEditing(null)}
      />
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
  onEdit,
}: {
  items: (DocSub | (HospSub & { _type: "DOCTOR" | "HOSPITAL" }))[];
  planMap: Record<string, PlanConfig & { limits: PlanLimits | null }>;
  onEdit: (s: any) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Résultats ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-8 gap-2 text-sm text-muted-foreground px-2">
          <div className="col-span-2">Client</div>
          <div>Type</div>
          <div>Plan</div>
          <div>Montant</div>
          <div>Début</div>
          <div>Fin</div>
          <div>Statut</div>
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
                className="grid grid-cols-8 gap-2 items-center px-2 py-3 hover:bg-muted/40 rounded-lg transition"
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
                  <Button size="sm" variant="outline" onClick={() => onEdit(s)}>
                    Éditer
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function EditDialog({
  sub,
  planMap,
  onClose,
}: {
  sub: (DocSub | (HospSub & { _type?: "DOCTOR" | "HOSPITAL" })) | null;
  planMap: Record<string, PlanConfig & { limits: PlanLimits | null }>;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = React.useState<any>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!sub) return setForm(null);
    setForm({
      id: sub.id,
      plan: sub.plan,
      status: sub.status,
      startDate: new Date(sub.startDate).toISOString().slice(0, 10),
      endDate: new Date(sub.endDate).toISOString().slice(0, 10),
      amount: sub.amount ? Number(sub.amount) : undefined,
      currency: sub.currency ?? planMap[sub.plan]?.currency ?? "XOF",
    });
  }, [sub]); // eslint-disable-line

  if (!sub || !form) return null;

  const applyPlanPrice = async () => {
    setBusy(true);
    try {
      await applyPlanPriceToSub(form.id);
      toast({
        title: "Prix appliqué",
        description: "Montant aligné sur le plan.",
      });
      onClose();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: String(e.message || e),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      await updateSubscription({
        id: form.id,
        plan: form.plan,
        status: form.status,
        startDate: form.startDate,
        endDate: form.endDate,
        amount: form.amount === "" ? null : Number(form.amount),
        currency: form.currency,
        autoRenew: !!form.autoRenew,
      });
      toast({ title: "Abonnement mis à jour" });
      onClose();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: String(e.message || e),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!sub} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>Modifier abonnement</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Plan</Label>
            <Select
              value={form.plan}
              onValueChange={(v) => setForm({ ...form, plan: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(planMap).map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Statut</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="TRIAL">Essai</SelectItem>
                <SelectItem value="INACTIVE">Inactif</SelectItem>
                <SelectItem value="EXPIRED">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Devise</Label>
            <Input
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            />
          </div>

          <div>
            <Label>Début</Label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Fin</Label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="secondary" onClick={applyPlanPrice} disabled={busy}>
            Aligner sur prix du plan
          </Button>
          <Button onClick={save} disabled={busy}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
