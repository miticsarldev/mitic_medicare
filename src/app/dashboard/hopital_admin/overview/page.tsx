"use client";

import { useEffect, useState } from "react";
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

// Colors for charts
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
  status?: string;
  specialization?: string;
  totalAppointments?: number;
  cancelledAppointments?: number;
  cancellationRate?: number;
};

type DepartmentData = {
  name: string;
  value: number;
};

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeAppointmentTab, setActiveAppointmentTab] = useState("status");

  const fetchData = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      // Fetch main stats
      const statsResponse = await fetch(
        "/api/hospital_admin/dashboard/analytics"
      );
      if (!statsResponse.ok) throw new Error("Failed to fetch stats");
      const statsData = await statsResponse.json();

      // Fetch appointment data
      const appointmentResponses = await Promise.all([
        fetch(
          "/api/hospital_admin/dashboard/graphique?type=appointments&subType=statusDistribution"
        ),
        fetch(
          "/api/hospital_admin/dashboard/graphique?type=appointments&subType=timeSeries&range=weekly"
        ),
        fetch(
          "/api/hospital_admin/dashboard/graphique?type=appointments&subType=topDoctors"
        ),
        fetch(
          "/api/hospital_admin/dashboard/graphique?type=appointments&subType=cancellationRate"
        ),
      ]);

      const [statusData, timeSeriesData, topDoctorsData, cancellationRateData] =
        await Promise.all(appointmentResponses.map((res) => res.json()));

      // Fetch patients by department
      const departmentResponse = await fetch(
        "/api/hospital_admin/dashboard/graphique?type=patientsByDepartment"
      );
      const departmentData = await departmentResponse.json();

      setStats({
        totalDoctors: statsData.stats?.totalDoctors || 0,
        totalPatients: statsData.stats?.totalPatients || 0,
        totalAppointmentsToday: statsData.stats?.totalAppointmentsToday || 0,
        totalPrescriptionsToday: statsData.stats?.totalPrescriptionsToday || 0,
      });

      setDoctors(statsData.doctors || []);
      setAppointmentData({
        statusDistribution: statusData,
        timeSeries: timeSeriesData,
        topDoctors: topDoctorsData,
        cancellationRate: cancellationRateData,
      });
      setPatientDepartementData(departmentData || []);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la récupération des données");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

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
      title: "Rendez-vous du jour",
      value: stats.totalAppointmentsToday,
      icon: Activity,
      color: "bg-purple-500",
    },
    {
      title: "Prescriptions du jour",
      value: stats.totalPrescriptionsToday,
      icon: Calendar,
      color: "bg-amber-500",
    },
  ];

  const statusIcons = {
    PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
    CONFIRMED: <CheckCircle className="h-4 w-4 text-green-500" />,
    CANCELLED: <XCircle className="h-4 w-4 text-red-500" />,
    COMPLETED: <CheckCircle className="h-4 w-4 text-blue-500" />,
    NO_SHOW: <AlertCircle className="h-4 w-4 text-orange-500" />,
  };

  const STATUS_TRANSLATIONS = {
    PENDING: "En attente",
    CONFIRMED: "Confirmé",
    COMPLETED: "Terminé",
    CANCELED: "Annulé",
    NO_SHOW: "Non presente",
  };

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {loading ? (
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
                Bienvenue dans votre espace d&apos;administration. Voici un
                aperçu de votre plateforme.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>
          </>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading
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

      <div className="flex flex-col md:flex-row gap-4">
        {/* Appointments Dashboard */}
        <Card className="flex-1">
          <CardHeader>
            {loading ? (
              <>
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
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
            {loading ? (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton
                      key={`tab-skeleton-${i}`}
                      className="h-9 w-[100px]"
                    />
                  ))}
                </div>
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : (
              <>
                <div className="flex space-x-2 mb-4">
                  <Button
                    variant={
                      activeAppointmentTab === "status" ? "default" : "outline"
                    }
                    size="sm"
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
                    onClick={() => setActiveAppointmentTab("evolution")}
                  >
                    Évolution
                  </Button>
                  <Button
                    variant={
                      activeAppointmentTab === "doctors" ? "default" : "outline"
                    }
                    size="sm"
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
                    onClick={() => setActiveAppointmentTab("cancellation")}
                  >
                    Annulations
                  </Button>
                </div>

                {activeAppointmentTab === "status" && (
                  <div className="bg-card border rounded-xl shadow-sm p-4 h-[400px] flex flex-col">
                    {appointmentData.statusDistribution?.length ? (
                      <>
                        <div className="flex-1 min-h-0">
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
                                label={({ name, percent }) =>
                                  `${STATUS_TRANSLATIONS[name as keyof typeof STATUS_TRANSLATIONS] || name} ${(percent * 100).toFixed(0)}%`
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

                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 overflow-y-auto">
                          {appointmentData.statusDistribution.map(
                            (entry, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <div className="flex-shrink-0">
                                  {
                                    statusIcons[
                                      entry.name as keyof typeof statusIcons
                                    ]
                                  }
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {STATUS_TRANSLATIONS[
                                      entry.name as keyof typeof STATUS_TRANSLATIONS
                                    ] || entry.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {entry.value} rdv
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">
                          Aucune donnée disponible
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeAppointmentTab === "evolution" && (
                  <div className="h-[400px]">
                    {appointmentData.timeSeries?.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={appointmentData.timeSeries}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
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
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">
                          Aucune donnée disponible
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeAppointmentTab === "doctors" && (
                  <div className="h-[400px]">
                    {appointmentData.topDoctors?.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={appointmentData.topDoctors}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 40,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={80}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => {
                              const maxLength = 15;
                              return value.length > maxLength
                                ? `${value.substring(0, maxLength)}...`
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
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">
                          Aucune donnée disponible
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeAppointmentTab === "cancellation" && (
                  <div className="h-[400px] flex flex-col items-center justify-center">
                    {appointmentData.cancellationRate ? (
                      <>
                        <div className="text-4xl font-bold mb-2">
                          {appointmentData.cancellationRate.cancellationRate?.toFixed(
                            1
                          )}
                          %
                        </div>
                        <p className="text-lg text-muted-foreground mb-6">
                          Taux d&apos;annulation
                        </p>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
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

        {/* Patients by Department Chart */}
        <Card className="flex-1">
          <CardHeader>
            {loading ? (
              <>
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
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
          <CardContent className="h-[300px] flex items-center justify-center">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : patientDepartementData.length === 0 ? (
              <p className="text-muted-foreground text-sm">
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
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
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
          {!loading && patientDepartementData.length > 0 && (
            <CardFooter className="border-t px-6 py-3">
              <div className="w-full space-y-1">
                {patientDepartementData.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="h-3 w-3 rounded-full mr-2"
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
      <Card>
        <CardHeader className="flex flex-row items-center">
          {loading ? (
            <>
              <div className="flex-1 gap-5">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
              <Skeleton className="h-9 w-[100px]" />
            </>
          ) : (
            <>
              <div className="flex-1 gap-5">
                <CardTitle>Médecins de l&apos;Hôpital</CardTitle>
                <CardDescription>
                  Liste des médecin et leurs activités du jour
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
          {loading ? (
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
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-5 w-[80px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucun médecin trouvé
            </p>
          ) : (
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={doctor.avatar} alt={doctor.name} />
                      <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{doctor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doctor.specialization} • {doctor.department}
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
      <Card>
        <CardHeader>
          {loading ? (
            <>
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-4 w-[300px]" />
            </>
          ) : (
            <>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>
                Accédez rapidement aux fonctionnalités principales
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={`action-skeleton-${i}`}
                  className="h-[100px] w-full"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <Button
                variant="outline"
                className="h-auto flex-col items-center justify-center p-4 gap-2"
                asChild
              >
                <Link href="/dashboard/hopital_admin/doctors/list">
                  <Users className="h-6 w-6 text-blue-500" />
                  <span>Gérer les Médecins</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-center justify-center p-4 gap-2"
                asChild
              >
                <Link href="/dashboard/hopital_admin/patients/list">
                  <User className="h-6 w-6 text-green-500" />
                  <span>Gérer les Patients</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-center justify-center p-4 gap-2"
                asChild
              >
                <Link href="/dashboard/hopital_admin/management/services">
                  <LifeBuoy className="h-6 w-6 text-cyan-500" />
                  <span>Services</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-center justify-center p-4 gap-2"
                asChild
              >
                <Link href="/dashboard/hopital_admin/settings/profile">
                  <Settings className="h-6 w-6 text-gray-500" />
                  <span>Profil</span>
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
