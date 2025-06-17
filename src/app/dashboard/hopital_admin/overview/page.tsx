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
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
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

type ConsultationType = {
  name: string;
  value: number;
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
  const [consultationTypeData, setConsultationTypeData] = useState<ConsultationType[]>([]);
  const [patientDepartementData, setPatientDepartementData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      // Fetch main stats
      const statsResponse = await fetch('/api/hospital_admin/dashboard/analytics');
      if (!statsResponse.ok) throw new Error("Failed to fetch stats");
      const statsData = await statsResponse.json();

      // Fetch consultation types
      const consultationResponse = await fetch('/api/hospital_admin/dashboard/graphique?type=consultationTypesAllTime');
      const consultationData = await consultationResponse.json();

      // Fetch patients by department
      const departmentResponse = await fetch('/api/hospital_admin/dashboard/graphique?type=patientsByDepartment');
      const departmentData = await departmentResponse.json();

      setStats({
        totalDoctors: statsData.stats?.totalDoctors || 0,
        totalPatients: statsData.stats?.totalPatients || 0,
        totalAppointmentsToday: statsData.stats?.totalAppointmentsToday || 0,
        totalPrescriptionsToday: statsData.stats?.totalPrescriptionsToday || 0,
      });

      setDoctors(statsData.doctors || []);
      setConsultationTypeData(consultationData || []);
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

  if (loading && !isRefreshing) {
    return <div className="text-center py-8">Chargement en cours...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
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

        <div className="flex flex-col gap-2 sm:flex-row">
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
        {/* Consultation Types Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Types de Consultations</CardTitle>
            <CardDescription>Répartition des consultations du jour</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {consultationTypeData.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune donnée disponible</p>
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
                  <Tooltip
                    formatter={(value: number) => [`${value}`, "Consultations"]}
                  />
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
                    <span className="text-sm font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Patients by Department Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Patients</CardTitle>
            <CardDescription>Nombre de patients par département</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {patientDepartementData.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune donnée disponible</p>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}`, "Patients"]}
                  />
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
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
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
        </CardHeader>
        <CardContent>
          {doctors.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun médecin trouvé</p>
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
                      <AvatarFallback>
                        {doctor.name.charAt(0)}
                      </AvatarFallback>
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
                      variant={doctor.availableToday ? "default" : "destructive"}
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
        </CardContent>
      </Card>
    </div>
  );
}