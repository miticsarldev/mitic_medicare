/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { format } from "date-fns";
import {
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  Wallet,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  getRevenueStats,
  RevenueFilters,
  RevenueStats,
} from "@/app/actions/revenue-ations";

export default function RevenueClient({ initial }: { initial: RevenueStats }) {
  const { toast } = useToast();
  const [stats, setStats] = useState<RevenueStats>(initial);
  const [filters, setFilters] = useState<RevenueFilters>(initial.filters);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getRevenueStats(filters);
      setStats(data);
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: String(e.message || e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper: currency-format
  const fmt = (n: number, c: string) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: c.toUpperCase(),
    }).format(n);

  // Build a merged series per currency into separate data keys
  const currencies = Array.from(
    new Set(stats.paymentsSeries.map((p) => p.currency))
  );
  const seriesByDate: Record<string, any> = {};
  stats.paymentsSeries.forEach((p) => {
    const key = p.date;
    if (!seriesByDate[key]) seriesByDate[key] = { date: key };
    seriesByDate[key][p.currency] =
      (seriesByDate[key][p.currency] || 0) + p.amount;
  });
  const chartData = Object.values(seriesByDate).sort((a: any, b: any) =>
    String(a.date).localeCompare(String(b.date))
  );

  // Totals helpers
  const totalPaymentsLabel = stats.totalPayments
    .map((t) => fmt(t.amount, t.currency))
    .join("  ·  ");
  const mrrLabel = stats.mrrRunRate
    .map((t) => fmt(t.amount, t.currency))
    .join("  ·  ");
  const arrLabel = stats.arrRunRate
    .map((t) => fmt(t.amount, t.currency))
    .join("  ·  ");

  // CSV export
  const exportCSV = () => {
    const header = ["date", ...currencies].join(",");
    const rows = (chartData as any[]).map((r) =>
      [r.date, ...currencies.map((c) => r[c] || 0)].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue_${filters.dateFrom}_to_${filters.dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revenus & MRR</h2>
          <p className="text-muted-foreground">
            Paiements encaissés, MRR/ARR (run-rate) et dynamiques d’abonnements.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={refresh} disabled={loading} className="gap-2">
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filtres
          </CardTitle>
          <CardDescription>
            Affinez par période, plan, statut et type d’abonné.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-6">
          <div>
            <Label>Du</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Au</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Plan</Label>
            <Select
              value={filters.plan}
              onValueChange={(v) => setFilters({ ...filters, plan: v as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous</SelectItem>
                <SelectItem value="FREE">FREE</SelectItem>
                <SelectItem value="STANDARD">STANDARD</SelectItem>
                <SelectItem value="PREMIUM">PREMIUM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Statut</Label>
            <Select
              value={filters.status}
              onValueChange={(v) =>
                setFilters({ ...filters, status: v as any })
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
              onValueChange={(v) => setFilters({ ...filters, type: v as any })}
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
          <div className="flex items-end">
            <Button onClick={refresh} disabled={loading} className="w-full">
              Appliquer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          icon={<Wallet className="h-4 w-4" />}
          label="Paiements encaissés"
          value={totalPaymentsLabel}
          hint="Somme des paiements dans la période"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="MRR (run-rate)"
          value={mrrLabel}
          hint="Abonnés actifs × prix mensuel"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="ARR (run-rate)"
          value={arrLabel}
          hint="MRR × 12"
        />
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="Actifs / Nouveaux / Churn"
          value={`${stats.activeSubs} / ${stats.newSubs} / ${stats.churnedSubs}`}
          hint="Dans la période sélectionnée"
        />
      </div>

      {/* Chart */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Revenus (encaissés) par jour</CardTitle>
          <CardDescription>Somme quotidienne par devise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData as any[]}
                margin={{ left: 8, right: 8, top: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => format(new Date(d), "dd/MM")}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: any) => [value, name]}
                  labelFormatter={(l) => format(new Date(l), "dd/MM/yyyy")}
                />
                <Legend />
                {currencies.map((c) => (
                  <Area
                    key={c}
                    type="monotone"
                    dataKey={c}
                    stackId="1"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par plan</CardTitle>
          <CardDescription>
            Nombre d’abonnés (tel que présent dans la période)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stats.byPlan.map((p) => (
              <div key={p.plan} className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">{p.plan}</div>
                <div className="text-2xl font-semibold mt-1">
                  {p.subscribers}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.payments?.length ? (
                    p.payments.map((q) => (
                      <Badge key={q.currency} variant="secondary">
                        {q.currency} {q.amount.toFixed(0)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card className="border-2">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon} {label}
        </div>
        <div className="mt-1 text-2xl font-semibold">{value ?? "-"}</div>
        {hint && (
          <div className="text-xs text-muted-foreground mt-1">{hint}</div>
        )}
      </CardContent>
    </Card>
  );
}
