"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Info,
  TrendingUp,
  PieChart as PieIcon,
  ClipboardList,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

type TimeRange = "daily" | "weekly" | "monthly";
// Note: legacy Period type removed; interval presets used instead

interface AvailabilityData {
  day: string;
  available: number;
  booked: number;
  total: number;
}

interface AppointmentTrendPoint {
  period: string;
  appointments: number;
}

type ApiError = string | null;

export default function DoctorDashboard() {
  // Filters
  const [range, setRange] = useState<TimeRange>("weekly");
  // period now stores interval presets: '1d' | '1m' | '2m' | '3m' | '6m' | '1y' | 'all'
  const [period, setPeriod] = useState<string>("1m");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [apptType, setApptType] = useState<string>("");
  const [dayOfWeek, setDayOfWeek] = useState<string>("");
  const [timeBucket, setTimeBucket] = useState<string>("");

  // Data states
  const [availability, setAvailability] = useState<AvailabilityData[] | null>(
    null
  );
  const [trend, setTrend] = useState<AppointmentTrendPoint[] | null>(null);
  const [statusStats, setStatusStats] = useState<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    canceled: number;
  } | null>(null);

  // Loading / error
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [errorAvail, setErrorAvail] = useState<ApiError>(null);
  const [errorTrend, setErrorTrend] = useState<ApiError>(null);
  const [errorStatus, setErrorStatus] = useState<ApiError>(null);

  // Debounced fetch helpers
  useEffect(() => {
    const c = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoadingAvail(true);
        setErrorAvail(null);
        const qs = new URLSearchParams({ type: "availability", range, period });
        qs.set("interval", period);
        if (statuses.length) qs.set("statuses", statuses.join(","));
        if (apptType) qs.set("apptType", apptType);
        if (dayOfWeek) qs.set("day", dayOfWeek);
        if (timeBucket) qs.set("timeBucket", timeBucket);
        const res = await fetch(`/api/independant_doctor/dashboard?${qs}`, {
          signal: c.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch availability");
        setAvailability(await res.json());
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setErrorAvail(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        setLoadingAvail(false);
      }
    }, 250);
    return () => {
      c.abort();
      clearTimeout(t);
    };
  }, [range, period, statuses, apptType, dayOfWeek, timeBucket]);

  useEffect(() => {
    const c = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoadingTrend(true);
        setErrorTrend(null);
        const qs = new URLSearchParams({ type: "appointments", range, period });
        qs.set("interval", period);
        if (statuses.length) qs.set("statuses", statuses.join(","));
        if (apptType) qs.set("apptType", apptType);
        if (dayOfWeek) qs.set("day", dayOfWeek);
        if (timeBucket) qs.set("timeBucket", timeBucket);
        const res = await fetch(`/api/independant_doctor/dashboard?${qs}`, {
          signal: c.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch trend");
        setTrend(await res.json());
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setErrorTrend(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        setLoadingTrend(false);
      }
    }, 250);
    return () => {
      c.abort();
      clearTimeout(t);
    };
  }, [range, period, statuses, apptType, dayOfWeek, timeBucket]);

  useEffect(() => {
    const c = new AbortController();
    (async () => {
      try {
        setLoadingStatus(true);
        setErrorStatus(null);
        const res = await fetch(`/api/independant_doctor/appointments/stats`, {
          signal: c.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch status stats");
        setStatusStats(await res.json());
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setErrorStatus(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        setLoadingStatus(false);
      }
    })();
    return () => c.abort();
  }, []);

  // Derived metrics
  // Totals computed if needed later for KPIs or tooltips
  // const totalAvailable = useMemo(
  //   () => availability?.reduce((s, d) => s + d.available, 0) ?? 0,
  //   [availability]
  // );
  // const totalBooked = useMemo(
  //   () => availability?.reduce((s, d) => s + d.booked, 0) ?? 0,
  //   [availability]
  // );
  // utilization intentionally unused in UI for now but kept for future KPI usage

  // Colors
  const STATUS_COLORS = {
    pending: "#f59e0b",
    confirmed: "#22c55e",
    completed: "#3b82f6",
    canceled: "#ef4444",
  } as const;

  const statusPie = useMemo(() => {
    if (!statusStats)
      return [] as { name: string; value: number; color: string }[];
    return [
      {
        name: "En attente",
        value: statusStats.pending,
        color: STATUS_COLORS.pending,
      },
      {
        name: "Confirmés",
        value: statusStats.confirmed,
        color: STATUS_COLORS.confirmed,
      },
      {
        name: "Terminés",
        value: statusStats.completed,
        color: STATUS_COLORS.completed,
      },
      {
        name: "Annulés",
        value: statusStats.canceled,
        color: STATUS_COLORS.canceled,
      },
    ];
  }, [
    statusStats,
    STATUS_COLORS.pending,
    STATUS_COLORS.confirmed,
    STATUS_COLORS.completed,
    STATUS_COLORS.canceled,
  ]);

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" /> Vue d’ensemble
        </h2>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="text-xs text-muted-foreground hidden md:block">
            Regrouper par
          </div>
          <Select value={range} onValueChange={(v: TimeRange) => setRange(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Regrouper par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Jour</SelectItem>
              <SelectItem value="weekly">Semaine</SelectItem>
              <SelectItem value="monthly">Mois</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
            Période
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Choisissez la période d&apos;analyse (jour, mois, 2/3/6 mois,
                  année, tout temps).
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select value={period} onValueChange={(v: string) => setPeriod(v)}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Jour</SelectItem>
              <SelectItem value="1m">Mois</SelectItem>
              <SelectItem value="2m">2 mois</SelectItem>
              <SelectItem value="3m">3 mois</SelectItem>
              <SelectItem value="6m">6 mois</SelectItem>
              <SelectItem value="1y">Année</SelectItem>
              <SelectItem value="all">Tout temps</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Filtres avancés
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Statuts</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "PENDING", label: "En attente" },
                      { key: "CONFIRMED", label: "Confirmé" },
                      { key: "COMPLETED", label: "Terminé" },
                      { key: "CANCELED", label: "Annulé" },
                    ].map((s) => (
                      <label
                        key={s.key}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={statuses.includes(s.key)}
                          onCheckedChange={(checked) => {
                            setStatuses((prev) =>
                              checked
                                ? [...prev, s.key]
                                : prev.filter((v) => v !== s.key)
                            );
                          }}
                        />
                        {s.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Type</p>
                    <Select
                      value={apptType || undefined}
                      onValueChange={(v) => setApptType(v === "ALL" ? "" : v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Tous</SelectItem>
                        <SelectItem value="Consultation">
                          Consultation
                        </SelectItem>
                        <SelectItem value="Suivi">Suivi</SelectItem>
                        <SelectItem value="Urgence">Urgence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Jour</p>
                    <Select
                      value={dayOfWeek || undefined}
                      onValueChange={(v) => setDayOfWeek(v === "ALL" ? "" : v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Tous</SelectItem>
                        {[
                          "lundi",
                          "mardi",
                          "mercredi",
                          "jeudi",
                          "vendredi",
                          "samedi",
                          "dimanche",
                        ].map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Moment de la journée
                  </p>
                  <Select
                    value={timeBucket || undefined}
                    onValueChange={(v) => setTimeBucket(v === "ALL" ? "" : v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous</SelectItem>
                      <SelectItem value="morning">Matin</SelectItem>
                      <SelectItem value="afternoon">Après-midi</SelectItem>
                      <SelectItem value="evening">Soir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatuses([]);
                      setApptType("");
                      setDayOfWeek("");
                      setTimeBucket("");
                    }}
                  >
                    Réinitialiser
                  </Button>
                  <Button size="sm">Appliquer</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {Boolean(statuses.length || apptType || dayOfWeek || timeBucket) && (
            <div className="flex gap-2 items-center">
              {statuses.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
              {apptType && (
                <Badge variant="secondary" className="text-xs">
                  {apptType}
                </Badge>
              )}
              {dayOfWeek && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {dayOfWeek}
                </Badge>
              )}
              {timeBucket && (
                <Badge variant="secondary" className="text-xs">
                  {timeBucket}
                </Badge>
              )}
            </div>
          )}
          {/* Selection summary */}
          <div className="w-full text-xs text-muted-foreground md:text-right">
            {"Période = "}
            {period === "1d"
              ? "Jour"
              : period === "1m"
                ? "Mois"
                : period === "2m"
                  ? "2 mois"
                  : period === "3m"
                    ? "3 mois"
                    : period === "6m"
                      ? "6 mois"
                      : period === "1y"
                        ? "Année"
                        : "Tout temps"}
            {" · Regroupement = "}
            {range === "daily"
              ? "Jour"
              : range === "weekly"
                ? "Semaine"
                : "Mois"}
          </div>
        </div>
      </div>

      {/* Appointments & Availability focus */}

      {/* Charts grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Appointments trend */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tendance des consultations
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingTrend ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : errorTrend ? (
              <div className="h-[300px] flex items-center justify-center text-red-500 text-sm">
                {errorTrend}
              </div>
            ) : trend && trend.length ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trend}
                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="appointments"
                      name="Consultations"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Répartition des statuts
            </CardTitle>
            <PieIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStatus ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : errorStatus ? (
              <div className="h-[300px] flex items-center justify-center text-red-500 text-sm">
                {errorStatus}
              </div>
            ) : statusStats ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip />
                    <Pie
                      data={statusPie}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={110}
                      innerRadius={60}
                    >
                      {statusPie.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  {statusPie.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-sm"
                        style={{ background: s.color }}
                      />{" "}
                      {s.name}: <span className="font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Utilization by day (stacked) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Utilisation des créneaux (par jour)
          </CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loadingAvail ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : errorAvail ? (
            <div className="h-[300px] flex items-center justify-center text-red-500 text-sm">
              {errorAvail}
            </div>
          ) : availability && availability.length ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={availability}
                  margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar
                    dataKey="booked"
                    name="Réservé"
                    stackId="a"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="available"
                    name="Disponible"
                    stackId="a"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              Aucune donnée
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
