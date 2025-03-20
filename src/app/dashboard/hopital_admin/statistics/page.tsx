"use client";

import { useState } from "react";
import { format, subDays, subMonths, subYears } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Calendar,
  Download,
  FileDown,
  LineChart,
  RefreshCw,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "@/components/ui/charts";
import { DateRange } from "react-day-picker";

// Sample data for statistics
const generateMonthlyData = (months = 12, baseValue = 1000, variance = 200) => {
  return Array.from({ length: months }, (_, i) => ({
    month: format(subMonths(new Date(), months - 1 - i), "MMM yyyy", {
      locale: fr,
    }),
    value: Math.max(
      0,
      Math.floor(baseValue + Math.random() * variance * 2 - variance)
    ),
  }));
};

const generateDailyData = (days = 30, baseValue = 100, variance = 30) => {
  return Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - 1 - i), "dd MMM", { locale: fr }),
    value: Math.max(
      0,
      Math.floor(baseValue + Math.random() * variance * 2 - variance)
    ),
  }));
};

// Sample data
const userRegistrationsData = generateMonthlyData(12, 800, 200);
const activeUsersData = generateDailyData(30, 5000, 1000);

const appointmentsData = generateMonthlyData(12, 3000, 500);

const userTypeData = [
  { name: "Patients", value: 65 },
  { name: "Médecins", value: 25 },
  { name: "Hôpitaux", value: 10 },
];

const consultationTypeData = [
  { name: "Consultations", value: 35 },
  { name: "Urgences", value: 30 },
  { name: "Suivi Médical", value: 20 },
];


const patientServiceData = [
  { name: "Cardiologie", value: 40 },
  { name: "Pédiatrie", value: 25 },
  { name: "Urgences", value: 30 },
  { name: "Chirurgie", value: 15 },
];

const patientRegionData = [
  { name: "Bamako", value: 40 },
  { name: "Sikasso", value: 20 },
  { name: "Kayes", value: 15 },
  { name: "Mopti", value: 10 },
  { name: "Ségou", value: 8 },
  { name: "Autres", value: 7 },
];


// Colors for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];

// KPI cards data
const kpiData = [
  {
    title: "Utilisateurs totaux",
    value: "24,892",
    change: "+12.5%",
    trend: "up",
    period: "vs mois dernier",
    icon: Users,
    color: "blue",
  },
  {
    title: "Nouveaux utilisateurs",
    value: "1,253",
    change: "+8.2%",
    trend: "up",
    period: "vs mois dernier",
    icon: Activity,
    color: "green",
  },
  {
    title: "Rendez-vous",
    value: "8,472",
    change: "-3.1%",
    trend: "down",
    period: "vs mois dernier",
    icon: Calendar,
    color: "amber",
  },
  {
    title: "Revenus",
    value: "€89,432",
    change: "+15.3%",
    trend: "up",
    period: "vs mois dernier",
    icon: LineChart,
    color: "emerald",
  },
];

export default function StatisticsPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });
  const [selectedPeriod, setSelectedPeriod] = useState("6m");
  const [selectedMetric, setSelectedMetric] = useState("users");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);

    let from: Date | undefined;
    const to = new Date();

    switch (period) {
      case "1m":
        from = subMonths(new Date(), 1);
        break;
      case "3m":
        from = subMonths(new Date(), 3);
        break;
      case "6m":
        from = subMonths(new Date(), 6);
        break;
      case "1y":
        from = subYears(new Date(), 1);
        break;
      case "all":
        from = undefined;
        break;
      default:
        from = subMonths(new Date(), 6);
    }

    setDateRange({ from, to });
  };

  // Simulate data refresh
  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange({ from: range[0], to: range[1] });
    } else {
      setDateRange({ from: undefined, to: undefined });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Statistiques & Analyses
          </h2>
          <p className="text-muted-foreground">
            Visualisez et analysez les données de performance de la plateforme
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
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
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Sélectionner une période</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" /> Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileDown className="mr-2 h-4 w-4" /> Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileDown className="mr-2 h-4 w-4" /> Exporter en Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileDown className="mr-2 h-4 w-4" /> Exporter en CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={index}
              className={`border-l-4 border-l-${kpi.color}-500`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <Icon className={`h-4 w-4 text-${kpi.color}-500`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center mt-1">
                  <Badge
                    variant={kpi.trend === "up" ? "default" : "destructive"}
                    className="text-xs font-normal"
                  >
                    {kpi.trend === "up" ? (
                      <ArrowUp className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDown className="mr-1 h-3 w-3" />
                    )}
                    {kpi.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">
                    {kpi.period}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts */}
      <Tabs
        defaultValue="users"
        className="space-y-4"
        onValueChange={setSelectedMetric}
      >
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader className="flex flex-row items-center">
            <div>
              <CardTitle>
                {selectedMetric === "users" && "Évolution des utilisateurs"}
                {selectedMetric === "appointments" &&
                  "Évolution des rendez-vous"}
                
              </CardTitle>
              <CardDescription>
                {selectedMetric === "users" &&
                  "Nombre d'utilisateurs inscrits sur la plateforme"}
                {selectedMetric === "appointments" &&
                  "Nombre de rendez-vous pris sur la plateforme"}
                
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Select defaultValue="monthly">
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Affichage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Journalier</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {selectedMetric === "users" ? (
                <AreaChart
                  data={userRegistrationsData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0088FE"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="Nouveaux utilisateurs"
                  />
                </AreaChart>
              ) : selectedMetric === "appointments" ? (
                <BarChart
                  data={appointmentsData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name="Rendez-vous"
                    fill="#00C49F"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              
              ) : (
                <RechartsLineChart
                  data={activeUsersData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#FF8042"
                    name="Utilisateurs actifs"
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {selectedMetric === "users" && "Total: 24,892 utilisateurs"}
                  {selectedMetric === "appointments" &&
                    "Total: 8,472 rendez-vous"}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Dernière mise à jour:{" "}
                {format(new Date(), "d MMMM yyyy à HH:mm", { locale: fr })}
              </span>
            </div>
          </CardFooter>
        </Card>
      </Tabs>

      {/* Distribution Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Distribution des utilisateurs</CardTitle>
            <CardDescription>
              Répartition par type d&apos;utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {userTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, ""]} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="w-full space-y-1">
              {userTypeData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="h-3 w-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium">{entry.value}%</span>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>
        <Card>
        <CardHeader>
          <CardTitle>Types de Consultations</CardTitle>
          <CardDescription>Répartition des consultations médicales</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={consultationTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {consultationTypeData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, ""]} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          <div className="w-full space-y-1">
            {consultationTypeData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="h-3 w-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
                <span className="text-sm font-medium">{entry.value}%</span>
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Répartition des Patients</CardTitle>
          <CardDescription>Nombre de patients par service médical</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={patientServiceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {patientServiceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, ""]} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          <div className="w-full space-y-1">
            {patientServiceData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="h-3 w-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
                <span className="text-sm font-medium">{entry.value}%</span>
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>

      </div>

      {/* Regional Distribution */}
      <Card>
  <CardHeader>
    <CardTitle>Répartition géographique des patients</CardTitle>
    <CardDescription>
      Nombre de patients par région
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={patientRegionData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip
              formatter={(value) => [`${value}%`, "Patients"]}
            />
            <Bar
              dataKey="value"
              fill="#8884d8"
              name="Patients (%)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium">
          Top régions par nombre de patients
        </h4>
        <div className="space-y-4">
          {patientRegionData
            .sort((a, b) => b.value - a.value)
            .map((region, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {region.name}
                  </span>
                  <span className="text-sm">{region.value}%</span>
                </div>
                <Progress value={region.value} className="h-2" />
              </div>
            ))}
        </div>
      </div>
    </div>
  </CardContent>
  <CardFooter className="border-t px-6 py-3">
    <div className="flex items-center justify-between w-full">
      <Badge variant="outline">Total: 12,345 patients</Badge>
      <Button variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Télécharger le rapport complet
      </Button>
    </div>
  </CardFooter>
</Card>

    </div>
  );
}
