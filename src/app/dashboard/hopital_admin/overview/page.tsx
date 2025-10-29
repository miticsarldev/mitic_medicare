"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Calendar,
  LifeBuoy,
  RefreshCw,
  Settings,
  User,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "@/components/ui/charts";
import Link from "next/link";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getSpecializationLabel } from "@/utils/function";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  availableToday: boolean;
  patientsToday: number;
  avatar?: string;
}

type AppointmentData = {
  name?: string;
  period?: string;
  value?: number;
  appointments?: number;
  specialization?: string;
  totalAppointments?: number;
  cancelledAppointments?: number;
  cancellationRate?: number;
};

type DepartmentData = {
  name: string;
  value: number;
};

type WindowValue =
  | "all"
  | "1d"
  | "3d"
  | "1w"
  | "1m"
  | "2m"
  | "3m"
  | "6m"
  | "1y"
  | "custom";

type BucketValue = "daily" | "weekly" | "monthly";

export default function HospitalAdminOverviewPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointmentsToday: 0,
    totalPrescriptionsToday: 0,
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointmentData, setAppointmentData] = useState<{
    statusDistribution?: AppointmentData[];
    timeSeries?: AppointmentData[];
    topDoctors?: AppointmentData[];
    cancellationRate?: AppointmentData;
  }>({});
  const [patientDepartementData, setPatientDepartementData] = useState<
    DepartmentData[]
  >([]);
  const [error, setError] = useState("");
  const [activeAppointmentTab, setActiveAppointmentTab] = useState<
    "status" | "evolution" | "doctors" | "cancellation"
  >("status");
  const [statsLoading, setStatsLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  // Filters
  const [windowFilter, setWindowFilter] = useState<WindowValue>("all");
  const [bucket, setBucket] = useState<BucketValue>("weekly");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const querySuffix = useMemo(() => {
    const p = new URLSearchParams();
    if (windowFilter === "custom") {
      if (from) p.set("from", from);
      if (to) p.set("to", to);
    } else {
      p.set("window", windowFilter);
    }
    return p.toString();
  }, [windowFilter, from, to]);

  const fetchData = async () => {
    setIsRefreshing(true);

    const pStats = (async () => {
      setStatsLoading(true);
      setDoctorsLoading(true);
      try {
        const res = await fetch(
          `/api/hospital_admin/dashboard/analytics?${querySuffix}`
        );
        if (!res.ok) throw new Error("Failed to fetch stats");
        const statsData = await res.json();

        setStats({
          totalDoctors: statsData.stats?.totalDoctors || 0,
          totalPatients: statsData.stats?.totalPatients || 0,
          totalAppointmentsToday: statsData.stats?.totalAppointmentsToday || 0,
          totalPrescriptionsToday:
            statsData.stats?.totalPrescriptionsToday || 0,
        });
        setDoctors(statsData.doctors || []);
      } finally {
        setStatsLoading(false);
        setDoctorsLoading(false);
      }
    })();

    const pAppointments = (async () => {
      setAppointmentsLoading(true);
      try {
        const [statusRes, tsRes, topRes, cancelRes] = await Promise.all([
          fetch(
            `/api/hospital_admin/dashboard/graphique?type=appointments&subType=statusDistribution&${querySuffix}`
          ),
          fetch(
            `/api/hospital_admin/dashboard/graphique?type=appointments&subType=timeSeries&range=${bucket}&${querySuffix}`
          ),
          fetch(
            `/api/hospital_admin/dashboard/graphique?type=appointments&subType=topDoctors&${querySuffix}`
          ),
          fetch(
            `/api/hospital_admin/dashboard/graphique?type=appointments&subType=cancellationRate&${querySuffix}`
          ),
        ]);
        const [
          statusData,
          timeSeriesData,
          topDoctorsData,
          cancellationRateData,
        ] = await Promise.all([
          statusRes.json(),
          tsRes.json(),
          topRes.json(),
          cancelRes.json(),
        ]);
        setAppointmentData({
          statusDistribution: statusData,
          timeSeries: timeSeriesData,
          topDoctors: topDoctorsData,
          cancellationRate: cancellationRateData,
        });
      } finally {
        setAppointmentsLoading(false);
      }
    })();

    const pDepartments = (async () => {
      setDepartmentsLoading(true);
      try {
        const departmentResponse = await fetch(
          `/api/hospital_admin/dashboard/graphique?type=patientsByDepartment&${querySuffix}`
        );
        const departmentData = await departmentResponse.json();
        setPatientDepartementData(departmentData || []);
      } finally {
        setDepartmentsLoading(false);
      }
    })();

    try {
      await Promise.all([pStats, pAppointments, pDepartments]);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la récupération des données");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => fetchData();

  const overviewStats = [
    {
      title: "Total de Médecins",
      value: stats.totalDoctors,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total des Patients",
      value: stats.totalPatients,
      icon: User,
      color: "bg-green-500",
    },
    {
      title: "Rendez-vous (fenêtre)",
      value: stats.totalAppointmentsToday,
      icon: Activity,
      color: "bg-purple-500",
    },
    {
      title: "Prescriptions (fenêtre)",
      value: stats.totalPrescriptionsToday,
      icon: Calendar,
      color: "bg-amber-500",
    },
  ];

  const statusIcons = {
    PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
    CONFIRMED: <CheckCircle className="h-4 w-4 text-green-500" />,
    CANCELED: <XCircle className="h-4 w-4 text-red-500" />,
    COMPLETED: <CheckCircle className="h-4 w-4 text-blue-500" />,
    NO_SHOW: <AlertCircle className="h-4 w-4 text-orange-500" />,
  };

  const STATUS_TRANSLATIONS: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmé",
    COMPLETED: "Terminé",
    CANCELED: "Annulé",
    NO_SHOW: "Non présenté",
  };

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div className="space-y-4 p-2 sm:p-4">
      {/* Header + Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {statsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Tableau de bord
              </h2>
              <p className="text-muted-foreground">
                Bienvenue dans votre espace d&apos;administration.
              </p>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:flex-wrap">
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />

                    {/* Window */}
                    <Select
                      value={windowFilter}
                      onValueChange={(v: WindowValue) => setWindowFilter(v)}
                    >
                      <SelectTrigger className="w-full sm:min-w-[160px]">
                        <SelectValue placeholder="Période" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tout le temps</SelectItem>
                        <SelectItem value="1d">1 jour</SelectItem>
                        <SelectItem value="3d">3 jours</SelectItem>
                        <SelectItem value="1w">1 semaine</SelectItem>
                        <SelectItem value="1m">1 mois</SelectItem>
                        <SelectItem value="2m">2 mois</SelectItem>
                        <SelectItem value="3m">Trimestre</SelectItem>
                        <SelectItem value="6m">6 mois</SelectItem>
                        <SelectItem value="1y">1 an</SelectItem>
                        <SelectItem value="custom">Personnalisé</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Bucket */}
                    <Select
                      value={bucket}
                      onValueChange={(v: BucketValue) => setBucket(v)}
                    >
                      <SelectTrigger className="w-full sm:min-w-[140px]">
                        <SelectValue placeholder="Granularité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Jour</SelectItem>
                        <SelectItem value="weekly">Semaine</SelectItem>
                        <SelectItem value="monthly">Mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {windowFilter === "custom" && (
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                      <Input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="w-full sm:w-[160px]"
                        placeholder="De"
                      />
                      <Input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="w-full sm:w-[160px]"
                        placeholder="À"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleApplyFilters}
                disabled={isRefreshing}
                className="w-full sm:w-auto"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Appliquer
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={`stat-skeleton-${i}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[50px]" />
                </CardContent>
              </Card>
            ))
          : overviewStats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.color} rounded-full p-2 text-white`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        {/* Appointments Dashboard */}
        <Card className="flex-1 min-w-0">
          <CardHeader>
            {appointmentsLoading ? (
              <>
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-4 w-[250px]" />
              </>
            ) : (
              <>
                <CardTitle>Statistiques des Rendez-vous</CardTitle>
                <CardDescription>
                  Analyse des rendez-vous et consultations
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton
                      key={`tab-skeleton-${i}`}
                      className="h-9 w-[100px]"
                    />
                  ))}
                </div>
                <Skeleton className="h-[240px] w-full sm:h-[300px] md:h-[360px]" />
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Button
                    variant={
                      activeAppointmentTab === "status" ? "default" : "outline"
                    }
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => setActiveAppointmentTab("status")}
                  >
                    Par Statut
                  </Button>
                  <Button
                    variant={
                      activeAppointmentTab === "evolution"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => setActiveAppointmentTab("evolution")}
                  >
                    Évolution
                  </Button>
                  <Button
                    variant={
                      activeAppointmentTab === "doctors" ? "default" : "outline"
                    }
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => setActiveAppointmentTab("doctors")}
                  >
                    Top Médecins
                  </Button>
                  <Button
                    variant={
                      activeAppointmentTab === "cancellation"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => setActiveAppointmentTab("cancellation")}
                  >
                    Annulations
                  </Button>
                </div>

                {activeAppointmentTab === "status" && (
                  <div className="flex h-[260px] flex-col rounded-xl border bg-card p-4 shadow-sm sm:h-[320px] md:h-[400px]">
                    {appointmentData.statusDistribution?.length ? (
                      <>
                        <div className="min-h-0 flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={appointmentData.statusDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name = "", percent }) =>
                                  `${STATUS_TRANSLATIONS[name] || name} ${((percent || 0) * 100).toFixed(0)}%`
                                }
                              >
                                {appointmentData.statusDistribution.map(
                                  (_, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  )
                                )}
                              </Pie>
                              <Tooltip
                                formatter={(value: number) => [
                                  `${value}`,
                                  "Rendez-vous",
                                ]}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {appointmentData.statusDistribution.map(
                            (entry, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-center space-x-2 text-xs"
                              >
                                <div className="flex-shrink-0 text-xs">
                                  {
                                    statusIcons[
                                      (entry.name ||
                                        "") as keyof typeof statusIcons
                                    ]
                                  }
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-medium">
                                    {STATUS_TRANSLATIONS[entry.name || ""] ||
                                      entry.name}
                                  </p>
                                  <p className="text-center text-xs text-muted-foreground">
                                    {entry.value} rdv
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">
                          Aucune donnée disponible
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeAppointmentTab === "evolution" && (
                  <div className="h-[260px] sm:h-[320px] md:h-[400px]">
                    {appointmentData.timeSeries?.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={appointmentData.timeSeries}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="appointments"
                            fill="#8884d8"
                            name="Rendez-vous"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">
                          Aucune donnée disponible
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeAppointmentTab === "doctors" && (
                  <div className="h-[260px] sm:h-[320px] md:h-[400px]">
                    {appointmentData.topDoctors?.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={appointmentData.topDoctors}
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value: string) => {
                              if (!value) return "—";
                              const maxLength = 18;
                              return value.length > maxLength
                                ? `${value.substring(0, maxLength)}…`
                                : value;
                            }}
                          />
                          <Tooltip
                            formatter={(value) => [`${value}`, "Rendez-vous"]}
                            labelFormatter={(value) => `Dr. ${value}`}
                          />
                          <Legend />
                          <Bar
                            dataKey="appointments"
                            fill="#8884d8"
                            name="Rendez-vous"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">
                          Aucune donnée disponible
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeAppointmentTab === "cancellation" && (
                  <div className="flex h-[260px] flex-col items-center justify-center sm:h-[320px] md:h-[400px]">
                    {appointmentData.cancellationRate ? (
                      <>
                        <div className="mb-2 text-4xl font-bold">
                          {appointmentData.cancellationRate.cancellationRate?.toFixed(
                            1
                          )}
                          %
                        </div>
                        <p className="mb-6 text-lg text-muted-foreground">
                          Taux d&apos;annulation
                        </p>
                        <div className="grid w-full max-w-md grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardDescription>Total RDV</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {
                                  appointmentData.cancellationRate
                                    .totalAppointments
                                }
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardDescription>Annulations</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-red-500">
                                {
                                  appointmentData.cancellationRate
                                    .cancelledAppointments
                                }
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">
                        Aucune donnée disponible
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Patients by Department */}
        <Card className="flex-1 min-w-0">
          <CardHeader>
            {departmentsLoading ? (
              <>
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-4 w-[250px]" />
              </>
            ) : (
              <>
                <CardTitle>Répartition des Patients</CardTitle>
                <CardDescription>
                  Nombre de patients par département
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="flex h-[260px] items-center justify-center sm:h-[300px]">
            {departmentsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : patientDepartementData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune donnée disponible
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={patientDepartementData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name = "", percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {patientDepartementData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}`, "Patients"]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
          {!departmentsLoading && patientDepartementData.length > 0 && (
            <CardFooter className="px-6 py-3">
              <div className="w-full space-y-1">
                {patientDepartementData.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="mr-2 h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-sm">{entry.name}</span>
                    </div>
                    <span className="text-sm font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Doctors List */}
      <Card className="min-w-0">
        <CardHeader className="flex flex-row items-center">
          {doctorsLoading ? (
            <>
              <div className="flex-1 gap-5">
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
              <Skeleton className="h-9 w-[100px]" />
            </>
          ) : (
            <>
              <div className="flex-1 gap-5">
                <CardTitle>Médecins de l&apos;Hôpital</CardTitle>
                <CardDescription>
                  Liste des médecins et leurs activités du jour
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/hopital_admin/doctors/list">
                  Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </CardHeader>
        <CardContent>
          {doctorsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`doctor-skeleton-${i}`}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[200px]" />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-5 w-[80px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun médecin trouvé
            </p>
          ) : (
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={doctor.avatar}
                        alt={doctor.name}
                        className="object-contain"
                      />
                      <AvatarFallback>
                        {doctor.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {doctor.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getSpecializationLabel(doctor.specialization)} • {doctor.department}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      Patients aujourd&apos;hui: {doctor.patientsToday}
                    </p>
                    <Badge
                      variant={
                        doctor.availableToday ? "default" : "destructive"
                      }
                      className="mt-1"
                    >
                      {doctor.availableToday ? "Disponible" : "Indisponible"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Accédez rapidement aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto gap-2 p-4 flex-col items-center justify-center"
              asChild
            >
              <Link href="/dashboard/hopital_admin/doctors/list">
                <Users className="h-6 w-6 text-blue-500" />
                <span>Gérer les Médecins</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto gap-2 p-4 flex-col items-center justify-center"
              asChild
            >
              <Link href="/dashboard/hopital_admin/patients/list">
                <User className="h-6 w-6 text-green-500" />
                <span>Gérer les Patients</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto gap-2 p-4 flex-col items-center justify-center"
              asChild
            >
              <Link href="/dashboard/hopital_admin/management/services">
                <LifeBuoy className="h-6 w-6 text-cyan-500" />
                <span>Services</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto gap-2 p-4 flex-col items-center justify-center"
              asChild
            >
              <Link href="/dashboard/hopital_admin/settings/profile">
                <Settings className="h-6 w-6 text-gray-500" />
                <span>Profil</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
