"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Calendar,
  Download,
  FileText,
  LifeBuoy,
  MoreHorizontal,
  RefreshCw,
  Settings,
  User,
  Users,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "@/components/ui/charts";


// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function SuperAdminOverviewPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  //interface pour le docteur 
  interface Doctor {
    id: string;
    name: string;
    specialization: string;
    department: string;
    status: string;
    patientsToday: number;
    avatar?: string;
  }

  type ConsultationType = {
    name: string;
    value: number;
  };

  type DepartmentData = {
    name: string;
    value: number;
  };

  // useState pour recuperer les total patients et médecins
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalAppointment, setTotalAppointment] = useState(0);
  const [totalPrescription, setTotalPrescription] = useState(0);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [consultationTypeData, setConsultationTypeData] = useState<ConsultationType[]>([]);
  const [patientDepartementData, setPatientDepartementData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const patientServiceData = [
    { name: "Cardiologie", value: 40 },
    { name: "Pédiatrie", value: 25 },
    { name: "Urgences", value: 30 },
    { name: "Chirurgie", value: 15 },
  ];

  // useEffect pour recuperer les données des patients et médecins
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/hospital_admin/dashboard/analytics`);
        const data = await response.json();

        // Appel pour les types de consultations du jour
        const responseTypeAppoinment = await fetch(`/api/hospital_admin/dashboard/graphique?type=consultationTypesToday`);
        const dataTypeAppoinment = await responseTypeAppoinment.json();

        // Appel pour la répartition des patients par département
        const responsePatientDepartement = await fetch(`/api/hospital_admin/dashboard/graphique?type=patientsByDepartment`);
        const dataPatientDepartement = await responsePatientDepartement.json();

        setPatientDepartementData(dataPatientDepartement || []);
        setConsultationTypeData(dataTypeAppoinment.consultationTypeData || []);

        if (!response.ok) throw new Error(data.error || "Erreur inconnue");

        setTotalPatients(data.totalPatients);
        setTotalDoctors(data.totalDoctors);
        setTotalAppointment(data.totalAppointmentsToday);
        setTotalPrescription(data.totalPrescriptionsToday);
        setDoctors(data.doctors || []);
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la récupération des statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  // Sample data for the dashboard
  const overviewStats = [
    {
      title: "Total de Medecin",
      value: totalDoctors,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total des Patients",
      value: totalPatients,
      icon: User,
      color: "bg-green-500",
    },
    {
      title: "Nombre de rendez-vous du jour",
      value: totalAppointment,
      icon: Activity,
      color: "bg-purple-500",
    },
    {
      title: "Nombre de prescription",
      value: totalPrescription,
      icon: Calendar,
      color: "bg-amber-500",
    },
  ];

  //gestion du loading et des erreurs
  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  if (error && error !== "") {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
          <p className="text-muted-foreground">
            Bienvenue dans votre espace d&apos;administration. Voici un aperçu
            de votre plateforme.
          </p>
        </div>
        {/* select time zone sectiom */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Dernières 24 heures</SelectItem>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">Année en cours</SelectItem>
            </SelectContent>
          </Select>
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
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
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

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Types de Consultations</CardTitle>
            <CardDescription>Répartition des consultations médicales</CardDescription>
          </CardHeader>

          <CardContent className="h-[300px] flex items-center justify-center">
            {consultationTypeData.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune donnée disponible pour le moment.</p>
            ) : (
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
                    {consultationTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, ""]} />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>

          {consultationTypeData.length > 0 && (
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
          )}
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>Répartition des Patients</CardTitle>
            <CardDescription>Nombre de patients par département</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : patientDepartementData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun patient trouvé pour l’instant.
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
                    {patientDepartementData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}`, "Patients"]} />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
          {patientDepartementData.length > 0 && (
            <CardFooter className="border-t px-6 py-3">
              <div className="w-full space-y-1">
                {patientDepartementData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
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

      {/* Liste des Médecins */}
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="flex-1 gap-5">
            <CardTitle>Médecins de l&apos;Hôpital</CardTitle>
            <CardDescription>
              Gérez les médecins et leurs disponibilités
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/hospital-admin/doctors">
              Voir tout <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement en cours...</p>
          ) : doctors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun médecin enregistré pour le moment.
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
                      <AvatarImage src={doctor.avatar || ""} alt={doctor.name} />
                      <AvatarFallback>
                        {doctor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{doctor.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {doctor.specialization}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      Patients aujourd&apos;hui: {doctor.patientsToday}
                    </p>
                    <Badge
                      variant={
                        doctor.status === "Disponible"
                          ? "default"
                          : doctor.status === "Absent"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {doctor.status}
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
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Accédez rapidement aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 gap-2"
              asChild
            >
              <a href="/dashboard/hopital_admin/doctors/list">
                <Users className="h-6 w-6 text-blue-500" />
                <span>Gérer les Médecins</span>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 gap-2"
              asChild
            >
              <a href="/dashboard/superadmin/users/patients">
                <User className="h-6 w-6 text-green-500" />
                <span>Gérer les Patients</span>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 gap-2"
              asChild
            >
              <a href="/dashboard/superadmin/notifications/tickets">
                <LifeBuoy className="h-6 w-6 text-cyan-500" />
                <span>Support</span>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 gap-2"
              asChild
            >
              <a href="/dashboard/superadmin/system/settings">
                <Settings className="h-6 w-6 text-gray-500" />
                <span>Paramètres</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
