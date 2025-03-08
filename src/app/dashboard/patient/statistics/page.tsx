"use client";

import { useState } from "react";
import { format, subDays, subMonths, subYears } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  Calendar,
  Filter,
  Heart,
  Pill,
  Printer,
  Save,
  Stethoscope,
  Weight,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "@/components/ui/charts";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Generate sample data for health metrics
const generateHealthData = (
  days: number,
  baseValue: number,
  variance: number
) => {
  return Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd"),
    value: Math.floor(baseValue + Math.random() * variance * 2 - variance),
  }));
};

// Generate sample data for appointments
const generateAppointmentData = () => {
  const specialties = [
    "Cardiologie",
    "Dermatologie",
    "Médecine générale",
    "Ophtalmologie",
    "Endocrinologie",
    "Neurologie",
    "Orthopédie",
  ];

  const statuses = ["Terminé", "Annulé", "Reporté"];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Array.from({ length: 24 }, (_) => ({
    date: format(
      subDays(new Date(), Math.floor(Math.random() * 365)),
      "yyyy-MM-dd"
    ),
    specialty: specialties[Math.floor(Math.random() * specialties.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    duration: Math.floor(Math.random() * 30) + 15,
  }));
};

// Generate sample data for medications
const generateMedicationData = () => {
  const medications = [
    "Lisinopril",
    "Atorvastatine",
    "Metformine",
    "Amoxicilline",
    "Oméprazole",
    "Paracétamol",
    "Ibuprofène",
  ];

  return Array.from({ length: 12 }, (_, i) => ({
    month: format(subMonths(new Date(), 11 - i), "MMM", { locale: fr }),
    name: medications[Math.floor(Math.random() * medications.length)],
    adherence: Math.floor(Math.random() * 30) + 70,
  }));
};

// Sample data
const heartRateData = generateHealthData(90, 72, 8);
const bloodPressureData = Array.from({ length: 90 }, (_, i) => ({
  date: format(subDays(new Date(), 89 - i), "yyyy-MM-dd"),
  systolic: Math.floor(120 + Math.random() * 20 - 10),
  diastolic: Math.floor(80 + Math.random() * 10 - 5),
}));
const weightData = Array.from({ length: 12 }, (_, i) => ({
  month: format(subMonths(new Date(), 11 - i), "MMM", { locale: fr }),
  weight: Math.floor(76 + Math.random() * 2 - 1),
}));
const appointmentData = generateAppointmentData();
const medicationData = generateMedicationData();

// Aggregate data for charts
const appointmentsBySpecialty = appointmentData.reduce((acc, curr) => {
  acc[curr.specialty] = (acc[curr.specialty] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const appointmentsByStatus = appointmentData.reduce((acc, curr) => {
  acc[curr.status] = (acc[curr.status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const appointmentsByMonth = Array.from({ length: 12 }, (_, i) => {
  const month = format(subMonths(new Date(), 11 - i), "MMM", { locale: fr });
  const count = appointmentData.filter((a) => {
    const appointmentDate = new Date(a.date);
    return (
      appointmentDate.getMonth() === subMonths(new Date(), 11 - i).getMonth() &&
      appointmentDate.getFullYear() ===
        subMonths(new Date(), 11 - i).getFullYear()
    );
  }).length;

  return { month, count };
});

// Health radar data
const healthRadarData = [
  { subject: "Cardio", A: 85, fullMark: 100 },
  { subject: "Nutrition", A: 70, fullMark: 100 },
  { subject: "Sommeil", A: 75, fullMark: 100 },
  { subject: "Stress", A: 60, fullMark: 100 },
  { subject: "Activité", A: 80, fullMark: 100 },
  { subject: "Hydratation", A: 90, fullMark: 100 },
];

// Colors for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
];

export default function PatientStatisticsPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });
  const [selectedMetric, setSelectedMetric] = useState("heart-rate");
  const [selectedPeriod, setSelectedPeriod] = useState("3m");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Filter data based on date range
  const filteredHeartRateData = heartRateData.filter((item) => {
    const date = new Date(item.date);
    return (
      (!dateRange.from || date >= dateRange.from) &&
      (!dateRange.to || date <= dateRange.to)
    );
  });

  const filteredBloodPressureData = bloodPressureData.filter((item) => {
    const date = new Date(item.date);
    return (
      (!dateRange.from || date >= dateRange.from) &&
      (!dateRange.to || date <= dateRange.to)
    );
  });

  // Set date range based on period selection
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
        from = subMonths(new Date(), 3);
    }

    setDateRange({ from, to });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Statistiques & Suivi
          </h2>
          <p className="text-muted-foreground">
            Analysez vos données de santé et suivez votre progression
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
          <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filtres avancés
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filtres avancés</DialogTitle>
                <DialogDescription>
                  Personnalisez la période et les métriques à afficher
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Période personnalisée</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">
                        Date de début
                      </span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {dateRange.from ? (
                              format(dateRange.from, "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) =>
                              setDateRange({ ...dateRange, from: date })
                            }
                            initialFocus
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">
                        Date de fin
                      </span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {dateRange.to ? (
                              format(dateRange.to, "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) =>
                              setDateRange({ ...dateRange, to: date })
                            }
                            initialFocus
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Métriques à afficher</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="heart-rate"
                        className="h-4 w-4"
                        defaultChecked
                      />
                      <label htmlFor="heart-rate" className="text-sm">
                        Fréquence cardiaque
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="blood-pressure"
                        className="h-4 w-4"
                        defaultChecked
                      />
                      <label htmlFor="blood-pressure" className="text-sm">
                        Tension artérielle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="weight"
                        className="h-4 w-4"
                        defaultChecked
                      />
                      <label htmlFor="weight" className="text-sm">
                        Poids
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="appointments"
                        className="h-4 w-4"
                        defaultChecked
                      />
                      <label htmlFor="appointments" className="text-sm">
                        Rendez-vous
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="medications"
                        className="h-4 w-4"
                        defaultChecked
                      />
                      <label htmlFor="medications" className="text-sm">
                        Médicaments
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setFilterDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button onClick={() => setFilterDialogOpen(false)}>
                  Appliquer les filtres
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Save className="mr-2 h-4 w-4" /> Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Save className="mr-2 h-4 w-4" /> Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Save className="mr-2 h-4 w-4" /> Exporter en CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="mr-2 h-4 w-4" /> Imprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendances des signes vitaux</CardTitle>
          <CardDescription>
            Évolution de vos signes vitaux sur la période sélectionnée
          </CardDescription>
          <Tabs
            defaultValue="heart-rate"
            className="mt-4"
            onValueChange={setSelectedMetric}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="heart-rate">Fréquence cardiaque</TabsTrigger>
              <TabsTrigger value="blood-pressure">
                Tension artérielle
              </TabsTrigger>
              <TabsTrigger value="weight">Poids</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="h-[400px] pt-4">
          {selectedMetric === "heart-rate" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredHeartRateData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="heartRateGradientFull"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), "dd/MM")}
                />
                <YAxis domain={[60, 90]} />
                <Tooltip
                  labelFormatter={(date) =>
                    format(new Date(date), "d MMMM yyyy", { locale: fr })
                  }
                  formatter={(value) => [`${value} bpm`, "Fréquence cardiaque"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#heartRateGradientFull)"
                  name="Fréquence cardiaque"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {selectedMetric === "blood-pressure" && (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={filteredBloodPressureData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), "dd/MM")}
                />
                <YAxis domain={[60, 140]} />
                <Tooltip
                  labelFormatter={(date) =>
                    format(new Date(date), "d MMMM yyyy", { locale: fr })
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke="#3b82f6"
                  name="Systolique (mmHg)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#93c5fd"
                  name="Diastolique (mmHg)"
                  strokeWidth={2}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          )}
          {selectedMetric === "weight" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weightData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[70, 80]} />
                <Tooltip formatter={(value) => [`${value} kg`, "Poids"]} />
                <Bar
                  dataKey="weight"
                  fill="#10b981"
                  name="Poids (kg)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {selectedMetric === "heart-rate" && (
                <>
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span className="text-sm font-medium">Moyenne: 72 bpm</span>
                </>
              )}
              {selectedMetric === "blood-pressure" && (
                <>
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    Moyenne: 120/80 mmHg
                  </span>
                </>
              )}
              {selectedMetric === "weight" && (
                <>
                  <Weight className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Moyenne: 76 kg</span>
                </>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              Dernière mise à jour:{" "}
              {format(new Date(), "d MMMM yyyy", { locale: fr })}
            </span>
          </div>
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Analyse des rendez-vous</CardTitle>
            <CardDescription>
              Répartition de vos rendez-vous médicaux
            </CardDescription>
            <Tabs defaultValue="specialty" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="specialty">Par spécialité</TabsTrigger>
                <TabsTrigger value="status">Par statut</TabsTrigger>
                <TabsTrigger value="timeline">Chronologie</TabsTrigger>
              </TabsList>
              <TabsContent value="specialty" className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(appointmentsBySpecialty).map(
                        ([name, value]) => ({
                          name,
                          value,
                        })
                      )}
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
                      {Object.entries(appointmentsBySpecialty).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} rendez-vous`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="status" className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(appointmentsByStatus).map(
                        ([name, value]) => ({
                          name,
                          value,
                        })
                      )}
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
                      {Object.entries(appointmentsByStatus).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry[0] === "Terminé"
                                ? "#10b981"
                                : entry[0] === "Annulé"
                                ? "#ef4444"
                                : "#f59e0b"
                            }
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} rendez-vous`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="timeline" className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={appointmentsByMonth}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} rendez-vous`, ""]}
                    />
                    <Bar
                      dataKey="count"
                      fill="#8884d8"
                      name="Nombre de rendez-vous"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardFooter className="border-t px-6 py-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Total: {appointmentData.length} rendez-vous
                </span>
              </div>
              <Button variant="outline" size="sm">
                Voir tous les rendez-vous
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profil de santé</CardTitle>
            <CardDescription>Évaluation globale de votre santé</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={healthRadarData}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Santé"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip formatter={(value) => [`${value}/100`, ""]} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <span className="text-sm font-medium">
                  Score global: 78/100
                </span>
              </div>
              <Button variant="outline" size="sm">
                Voir le détail
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suivi des médicaments</CardTitle>
          <CardDescription>
            Analyse de l&apos;observance de vos traitements
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={medicationData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="month" type="category" width={80} />
              <Tooltip formatter={(value) => [`${value}%`, "Observance"]} />
              <Legend />
              <Bar
                dataKey="adherence"
                name="Observance (%)"
                fill="#8884d8"
                radius={[0, 4, 4, 0]}
              >
                {medicationData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.adherence >= 90
                        ? "#10b981"
                        : entry.adherence >= 70
                        ? "#f59e0b"
                        : "#ef4444"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Observance moyenne: 85%
              </span>
            </div>
            <Button variant="outline" size="sm">
              Gérer mes médicaments
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
