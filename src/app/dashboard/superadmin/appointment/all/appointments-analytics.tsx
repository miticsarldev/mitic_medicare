"use client";

import { useState } from "react";
import { format, subDays, subMonths, subYears } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, FileDown, RefreshCw, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import type { AppointmentsData } from "./types";
import { useRouter, useSearchParams } from "next/navigation";

// Colors for charts
// const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const STATUS_COLORS = {
  PENDING: "#f59e0b",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
};

interface AppointmentsAnalyticsProps {
  initialData: AppointmentsData;
  initialRange?: { from?: Date; to?: Date };
}

export function AppointmentsAnalytics({
  initialData,
  initialRange,
}: AppointmentsAnalyticsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  //   const [data, setData] = useState<AppointmentsData>(initialData);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: initialRange?.from ?? subMonths(new Date("2024-06-01"), 1),
    to: initialRange?.to ?? new Date(),
  });

  const pushRangeToUrl = (from?: Date, to?: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    if (from) params.set("from", from.toISOString());
    else params.delete("from");
    if (to) params.set("to", to.toISOString());
    else params.delete("to");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    let from: Date | undefined;
    const to = new Date();
    switch (period) {
      case "7d":
        from = subDays(to, 7);
        break;
      case "1m":
        from = subMonths(to, 1);
        break;
      case "3m":
        from = subMonths(to, 3);
        break;
      case "6m":
        from = subMonths(to, 6);
        break;
      case "1y":
        from = subYears(to, 1);
        break;
      case "all":
        from = undefined;
        break;
      default:
        from = subMonths(to, 1);
    }
    setDateRange({ from, to });
    pushRangeToUrl(from, to);
  };

  const refreshData = () => {
    setIsRefreshing(true);
    pushRangeToUrl(dateRange.from, dateRange.to);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: "Données actualisées" });
    }, 600);
  };

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    const next = { from: range?.from, to: range?.to };
    setDateRange(next);
    pushRangeToUrl(next.from, next.to);
  };

  // Format time from hour number
  const formatHour = (hour: number) => {
    return `${hour}:00`;
  };

  // CSV helpers
  const csvEscape = (val: unknown) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const csvRow = (cols: unknown[]) => cols.map(csvEscape).join(",");

  // Build and download CSV
  const exportAnalytics = () => {
    try {
      const from = dateRange.from;
      const to = dateRange.to;

      // Filter trend by date range if provided (expects YYYY-MM-DD or ISO in data)
      const trend = (initialData?.stats.appointmentsTrend ?? []).filter((d) => {
        if (!from && !to) return true;
        const dDate = new Date(d.date);
        if (Number.isNaN(dDate.getTime())) return true; // keep if unparseable
        if (from && dDate < new Date(from.setHours(0, 0, 0, 0))) return false;
        if (to && dDate > new Date(new Date(to).setHours(23, 59, 59, 999)))
          return false;
        return true;
      });

      const lines: string[] = [];

      // Section: Meta
      lines.push(csvRow(["Export", "Appointments Analytics"]));
      lines.push(
        csvRow(["Generated At", format(new Date(), "yyyy-MM-dd HH:mm")])
      );
      lines.push(
        csvRow([
          "Range",
          from ? format(from, "yyyy-MM-dd") : "all",
          to ? format(to, "yyyy-MM-dd") : "now",
        ])
      );
      lines.push(""); // spacer

      // Section: KPIs
      lines.push("KPIs");
      lines.push(
        csvRow([
          "Total",
          "Completed",
          "Pending",
          "Cancelled",
          "Completion Rate (%)",
          "Cancellation Rate (%)",
          "Average Duration (min)",
        ])
      );
      lines.push(
        csvRow([
          initialData?.stats.totalAppointments,
          initialData?.stats.completedAppointments,
          initialData?.stats.pendingAppointments,
          initialData?.stats.cancelledAppointments,
          initialData?.stats.completionRate,
          initialData?.stats.cancellationRate,
          initialData?.stats.averageDuration,
        ])
      );
      lines.push("");

      // Section: Trend
      lines.push("Appointments Trend");
      lines.push(csvRow(["Date", "Total", "Completed"]));
      trend.forEach((t) => {
        lines.push(csvRow([t.date, t.total, t.completed]));
      });
      lines.push("");

      // Section: By Status
      lines.push("Appointments By Status");
      lines.push(csvRow(["Status", "Count", "Percentage (%)"]));
      (initialData?.stats.appointmentsByStatus ?? []).forEach((s) => {
        lines.push(csvRow([s.status, s.count, s.percentage]));
      });
      lines.push("");

      // Section: By Day
      lines.push("Appointments By Day");
      lines.push(csvRow(["Day", "Count"]));
      (initialData?.stats.appointmentsByDay ?? []).forEach((d) => {
        lines.push(csvRow([d.day, d.count]));
      });
      lines.push("");

      // Section: By Hour
      lines.push("Appointments By Hour");
      lines.push(csvRow(["Hour", "Count"]));
      (initialData?.stats.appointmentsByHour ?? []).forEach((h) => {
        lines.push(csvRow([`${h.hour}:00`, h.count]));
      });
      lines.push("");

      // Section: Top Doctors
      lines.push("Top Doctors");
      lines.push(
        csvRow([
          "Name",
          "Specialization",
          "Appointments",
          "Completion Rate (%)",
        ])
      );
      (initialData?.stats.topDoctors ?? []).forEach((d) => {
        lines.push(
          csvRow([
            d.name,
            d.specialization,
            d.appointmentCount,
            d.completionRate,
          ])
        );
      });
      lines.push("");

      // Section: Top Hospitals
      lines.push("Top Hospitals");
      lines.push(csvRow(["Name", "Appointments", "Completion Rate (%)"]));
      (initialData?.stats.topHospitals ?? []).forEach((h) => {
        lines.push(csvRow([h.name, h.appointmentCount, h.completionRate]));
      });

      const csvContent = lines.join("\n");
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const fname = `appointments_analytics_${from ? format(from, "yyyyMMdd") : "all"}_${to ? format(to, "yyyyMMdd") : format(new Date(), "yyyyMMdd")}.csv`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fname;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export terminé",
        description: `Le fichier ${fname} a été généré.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Erreur",
        description: "Impossible d’exporter les données.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1"></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="1m">Dernier mois</SelectItem>
              <SelectItem value="3m">3 derniers mois</SelectItem>
              <SelectItem value="6m">6 derniers mois</SelectItem>
              <SelectItem value="1y">Dernière année</SelectItem>
              <SelectItem value="all">Tout l&apos;historique</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange.from
                  ? dateRange.to
                    ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
                    : format(dateRange.from, "dd/MM/yyyy")
                  : "Sélectionner une période"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={handleSelect}
                numberOfMonths={2}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
          <Button variant="outline" onClick={exportAnalytics}>
            <FileDown className="mr-2 h-4 w-4" /> Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total des rendez-vous</CardDescription>
            <CardTitle className="text-3xl">
              {initialData?.stats.totalAppointments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-1 h-4 w-4" />
              Tous les rendez-vous
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rendez-vous complétés</CardDescription>
            <CardTitle className="text-3xl">
              {initialData?.stats.completedAppointments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {initialData?.stats.completionRate}% de taux de complétion
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rendez-vous en attente</CardDescription>
            <CardTitle className="text-3xl">
              {initialData?.stats.pendingAppointments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200"
              >
                {initialData?.stats.upcomingAppointments} à venir
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rendez-vous annulés</CardDescription>
            <CardTitle className="text-3xl">
              {initialData?.stats.cancelledAppointments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                {initialData?.stats.cancellationRate}% de taux d&apos;annulation
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Durée moyenne</CardDescription>
            <CardTitle className="text-3xl">
              {initialData?.stats.averageDuration} min
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              Par rendez-vous
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendance des rendez-vous</CardTitle>
            <CardDescription>
              Évolution du nombre de rendez-vous sur les 30 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={initialData?.stats.appointmentsTrend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorCompleted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(iso) =>
                    format(new Date(iso), "dd MMM", { locale: fr })
                  }
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="#4f46e5"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Complétés"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par statut</CardTitle>
            <CardDescription>
              Distribution des rendez-vous par statut
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={initialData?.stats.appointmentsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {initialData?.stats.appointmentsByStatus.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] || "#8884d8"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} rendez-vous`, name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="w-full space-y-1">
              {initialData?.stats.appointmentsByStatus.map((status) => (
                <div
                  key={status.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className="h-3 w-3 rounded-full mr-2"
                      style={{
                        backgroundColor:
                          STATUS_COLORS[status.status] || "#8884d8",
                      }}
                    />
                    <span className="text-sm">
                      {status.status === "PENDING"
                        ? "En attente"
                        : status.status === "COMPLETED"
                          ? "Complétés"
                          : "Annulés"}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {status.count} ({status.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous par jour</CardTitle>
            <CardDescription>
              Distribution des rendez-vous par jour de la semaine
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={initialData?.stats.appointmentsByDay}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} rendez-vous`, ""]} />
                <Bar
                  dataKey="count"
                  name="Rendez-vous"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="flex items-center justify-between w-full">
              <Badge variant="outline">
                Jour le plus actif: {initialData?.stats.mostActiveDay}
              </Badge>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous par heure</CardTitle>
            <CardDescription>
              Distribution des rendez-vous par heure de la journée
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={initialData?.stats.appointmentsByHour}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tickFormatter={formatHour} />
                <YAxis />
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} rendez-vous`,
                    `${formatHour(props.payload.hour)}`,
                  ]}
                />
                <Bar
                  dataKey="count"
                  name="Rendez-vous"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="flex items-center justify-between w-full">
              <Badge variant="outline">
                Heure la plus active:{" "}
                {formatHour(initialData?.stats.mostActiveHour)}
              </Badge>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Médecins</CardTitle>
            <CardDescription>
              Médecins avec le plus de rendez-vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {initialData?.stats.topDoctors.map((doctor, index) => (
                <div key={doctor.id} className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doctor.specialization}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{doctor.appointmentCount}</p>
                        <p className="text-xs text-muted-foreground">
                          rendez-vous
                        </p>
                      </div>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${doctor.completionRate}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs">
                      <span>Taux de complétion</span>
                      <span>{doctor.completionRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Hôpitaux</CardTitle>
            <CardDescription>
              Hôpitaux avec le plus de rendez-vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {initialData?.stats.topHospitals.map((hospital, index) => (
                <div key={hospital.id} className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{hospital.name}</p>
                      <div className="text-right">
                        <p className="font-medium">
                          {hospital.appointmentCount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          rendez-vous
                        </p>
                      </div>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${hospital.completionRate}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs">
                      <span>Taux de complétion</span>
                      <span>{hospital.completionRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
