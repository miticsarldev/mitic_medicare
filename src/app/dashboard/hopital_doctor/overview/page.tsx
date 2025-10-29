/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  CalendarDays,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Check,
  X,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

// --------------------------------------
// Types API
// --------------------------------------

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELED"
  | "NO_SHOW";

type AppointmentDTO = {
  id: string;
  scheduledAt: string; // ISO
  status: AppointmentStatus;
  notes: string | null;
  patientName: string;
  patientPhone?: string | null;
};

type OverviewResponse = {
  range: { from: string; to: string };
  hospital: {
    id: string;
    name: string;
  };
  doctor: {
    id: string;
    name: string;
  };
  kpis: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    canceled: number;
    noShow: number;
    revenueXOF: string; // already formatted server-side
  };
  series: {
    byDay: {
      date: string;
      total: number;
      confirmed: number;
      completed: number;
    }[];
    byType: { type: string; count: number }[];
    availabilityVsAppointments: {
      dow: number;
      label: string;
      availability: number;
      appointments: number;
    }[];
  };
  upcoming: AppointmentDTO[]; // prochains RDV (tous statuts)
  actionable: AppointmentDTO[]; // RDV en attente d'action (PENDING)
};

// --------------------------------------
// Aide: presets de périodes
// --------------------------------------

const presets = {
  "1j": { from: startOfDay(new Date()), to: endOfDay(new Date()) },
  "3j": { from: startOfDay(subDays(new Date(), 2)), to: endOfDay(new Date()) },
  "7j": { from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) },
  "1m": { from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) },
  "3m": { from: startOfDay(subDays(new Date(), 89)), to: endOfDay(new Date()) },
  "6m": {
    from: startOfDay(subDays(new Date(), 179)),
    to: endOfDay(new Date()),
  },
  an: { from: startOfDay(subDays(new Date(), 364)), to: endOfDay(new Date()) },
  moisCourant: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
  anneeCourante: { from: startOfYear(new Date()), to: endOfYear(new Date()) },
};

function toApiRange(range: { from: Date; to: Date }) {
  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  };
}

// --------------------------------------
// Page
// --------------------------------------

export default function HopitalDoctorOverviewPage() {
  const [range, setRange] = useState<{ from: Date; to: Date }>(
    presets.moisCourant
  );
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    apptId?: string;
  }>({ open: false });
  const [cancelReason, setCancelReason] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<
    keyof typeof presets | "custom"
  >("moisCourant");

  const selectPreset = (key: keyof typeof presets | "custom") => {
    setSelectedPreset(key);
    if (key !== "custom") {
      setRange(presets[key]);
    }
  };

  const onCustomFrom = (val: string) => {
    setSelectedPreset("custom");
    setRange((r) => ({ ...r, from: startOfDay(new Date(val)) }));
  };

  const onCustomTo = (val: string) => {
    setSelectedPreset("custom");
    setRange((r) => ({ ...r, to: endOfDay(new Date(val)) }));
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(toApiRange(range) as any).toString();
      const res = await fetch(`/api/hospital_doctor/overview?${params}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Impossible de charger les données.");
      const json: OverviewResponse = await res.json();
      setData(json);
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Actions
  const confirmAppointment = async (id: string) => {
    try {
      const res = await fetch(
        `/api/hospital_doctor/overview/appointments/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CONFIRMED" }),
        }
      );
      if (!res.ok) throw new Error("Échec de la confirmation.");
      toast.success("Rendez-vous confirmé");
      fetchData();
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur inconnue");
    }
  };

  const openCancel = (id: string) =>
    setCancelDialog({ open: true, apptId: id });

  const doCancel = async () => {
    if (!cancelDialog.apptId) return;
    try {
      const res = await fetch(
        `/api/hospital_doctor/overview/appointments/${cancelDialog.apptId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "CANCELED",
            cancellationReason: cancelReason || undefined,
          }),
        }
      );
      if (!res.ok) throw new Error("Échec de l'annulation.");
      toast.success("Rendez-vous annulé");
      setCancelDialog({ open: false });
      setCancelReason("");
      fetchData();
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur inconnue");
    }
  };

  const presetButtons = [
    { key: "1j", label: "1 jour" },
    { key: "3j", label: "3 jours" },
    { key: "7j", label: "7 jours" },
    { key: "1m", label: "1 mois" },
    { key: "3m", label: "3 mois" },
    { key: "6m", label: "6 mois" },
    { key: "an", label: "1 an" },
    { key: "moisCourant", label: "Mois en cours" },
    { key: "anneeCourante", label: "Année en cours" },
  ] as const;

  return (
    <div className="space-y-4 bg-transparent">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Tableau de bord – Médecin ({data?.hospital.name ?? "…"})
          </h1>
          <p className="text-muted-foreground">
            Vue d’ensemble de votre activité et actions rapides.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="w-[220px]">
            <Select
              value={selectedPreset}
              onValueChange={(val) =>
                selectPreset(val as keyof typeof presets | "custom")
              }
            >
              <SelectTrigger aria-label="Période">
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                {presetButtons.map((b) => (
                  <SelectItem key={b.key} value={b.key}>
                    {b.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Personnalisée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedPreset === "custom" && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                aria-label="Du"
                value={format(range.from, "yyyy-MM-dd")}
                onChange={(e) => onCustomFrom(e.target.value)}
              />
              <span>—</span>
              <Input
                type="date"
                aria-label="Au"
                value={format(range.to, "yyyy-MM-dd")}
                onChange={(e) => onCustomTo(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Rendez-vous"
          value={loading ? "…" : (data?.kpis.total ?? 0)}
          desc="Total sur la période"
          icon={<CalendarDays className="size-5" />}
        />
        <StatCard
          title="En attente"
          value={loading ? "…" : (data?.kpis.pending ?? 0)}
          desc="À traiter"
        />
        <StatCard
          title="Confirmés"
          value={loading ? "…" : (data?.kpis.confirmed ?? 0)}
          desc="Planifiés"
        />
        <StatCard
          title="Terminés"
          value={loading ? "…" : (data?.kpis.completed ?? 0)}
          desc="Consultations"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        {/* Série temporelle */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="size-5" /> Évolution quotidienne des
                  RDVs
                </CardTitle>
                <CardDescription>
                  {format(range.from, "PPP", { locale: fr })} →{" "}
                  {format(range.to, "PPP", { locale: fr })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data?.series.byDay ?? []}
                  margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) =>
                      format(new Date(d), "dd/MM", { locale: fr })
                    }
                  />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip
                    formatter={(v: any) => [v, "RDV"]}
                    labelFormatter={(l) =>
                      format(new Date(l), "PPPP", { locale: fr })
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    dot={false}
                    stroke="#2563eb"
                  />
                  <Line
                    type="monotone"
                    dataKey="confirmed"
                    name="Confirmés"
                    dot={false}
                    stroke="#10b981"
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Terminés"
                    dot={false}
                    stroke="#f59e0b"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Répartition statuts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="size-5" /> Statuts des rendez-vous
            </CardTitle>
            <CardDescription>Répartition des rendez-vous</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={buildStatusPie(data)}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                  >
                    {(buildStatusPie(data) ?? []).map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          [
                            "#6b7280",
                            "#2563eb",
                            "#10b981",
                            "#ef4444",
                            "#f59e0b",
                          ][idx % 5]
                        }
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip
                    formatter={(v: any, n: any) => [`${v}`, n]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="xl:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" /> Disponibilités vs RDV (lun → dim)
            </CardTitle>
            <CardDescription>
              Comparaison du nombre de créneaux disponibles et de RDV pris sur
              la période sélectionnée.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[360px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.series.availabilityVsAppointments ?? []}
                  margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Legend />
                  <RechartsTooltip />
                  <Bar
                    dataKey="availability"
                    name="Créneaux dispos"
                    fill="#60a5fa"
                  />
                  <Bar dataKey="appointments" name="RDV pris" fill="#34d399" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RDV à traiter */}
      <Card>
        <CardHeader>
          <CardTitle>Rendez-vous à valider</CardTitle>
          <CardDescription>
            Accepter, refuser ou clôturer rapidement vos RDV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : (data?.actionable?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun rendez-vous en attente pour cette période.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Date & heure</th>
                    <th>Patient</th>
                    <th>Statut</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data!.actionable.map((a) => (
                    <tr key={a.id} className="border-b last:border-none">
                      <td className="py-2">
                        {format(new Date(a.scheduledAt), "PPPPp", {
                          locale: fr,
                        })}
                      </td>
                      <td>
                        {a.patientName} & {a.patientPhone ?? ""}
                      </td>
                      <td>
                        <Badge variant="secondary">En attente</Badge>
                      </td>
                      <td className="text-right space-x-2">
                        <Button
                          size="sm"
                          onClick={() => confirmAppointment(a.id)}
                          className="gap-1"
                        >
                          <Check className="size-4" /> Confirmer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCancel(a.id)}
                          className="gap-1"
                        >
                          <X className="size-4" /> Refuser
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prochains RDV */}
      <Card>
        <CardHeader>
          <CardTitle>Prochains rendez-vous</CardTitle>
          <CardDescription>
            Les événements à venir (confirmés ou en attente).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : (data?.upcoming?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun rendez-vous à venir dans l’intervalle.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Date & heure</th>
                    <th>Patient</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {data!.upcoming.map((a) => (
                    <tr key={a.id} className="border-b last:border-none">
                      <td className="py-2">
                        {format(new Date(a.scheduledAt), "PPPPp", {
                          locale: fr,
                        })}
                      </td>
                      <td>
                        {a.patientName} & {a.patientPhone ?? ""}
                      </td>
                      <td>{renderStatusBadge(a.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog annulation */}
      <Dialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog((d) => ({ ...d, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser / Annuler le rendez-vous</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Optionnel : précisez un motif d’annulation pour l’historique.
            </p>
            <Input
              placeholder="Motif (optionnel)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelDialog({ open: false })}
            >
              Annuler
            </Button>
            <Button onClick={doCancel} variant="destructive">
              Refuser le RDV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  title,
  value,
  desc,
  icon,
}: {
  title: string;
  value: number | string;
  desc?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {icon}
        </div>
        {desc && <CardDescription>{desc}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function buildStatusPie(data: OverviewResponse | null | undefined) {
  if (!data) return [] as { name: string; value: number }[];
  const k = data.kpis;
  return [
    { name: "En attente", value: k.pending },
    { name: "Confirmés", value: k.confirmed },
    { name: "Terminés", value: k.completed },
    { name: "Annulés", value: k.canceled },
    { name: "Absents", value: k.noShow },
  ];
}

function renderStatusBadge(s: AppointmentStatus) {
  const map: Record<AppointmentStatus, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmé",
    COMPLETED: "Terminé",
    CANCELED: "Annulé",
    NO_SHOW: "Absent",
  };
  const variant: Record<AppointmentStatus, any> = {
    PENDING: "secondary",
    CONFIRMED: "default",
    COMPLETED: "outline",
    CANCELED: "destructive",
    NO_SHOW: "secondary",
  };
  return <Badge variant={variant[s]}>{map[s]}</Badge>;
}
