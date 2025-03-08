"use client";

import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  Calendar,
  Clock,
  Heart,
  Pill,
  Plus,
  Stethoscope,
  ThermometerSun,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/charts";

// Sample patient data
const patientData = {
  name: "Thomas Dubois",
  age: 42,
  bloodType: "A+",
  height: 178,
  weight: 76,
  bmi: 24.0,
  avatar: "/placeholder.svg?height=128&width=128",
  nextAppointment: {
    doctor: "Dr. Sophie Martin",
    specialty: "Cardiologie",
    date: new Date(2025, 2, 15, 10, 30),
    location: "Hôpital Saint-Louis, Paris",
  },
  vitals: {
    heartRate: 72,
    bloodPressure: "120/80",
    temperature: 36.6,
    oxygenSaturation: 98,
  },
  medications: [
    {
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "1x par jour",
      remaining: 12,
    },
    {
      name: "Atorvastatine",
      dosage: "20mg",
      frequency: "1x par jour",
      remaining: 8,
    },
    {
      name: "Metformine",
      dosage: "500mg",
      frequency: "2x par jour",
      remaining: 24,
    },
  ],
  recentActivity: [
    {
      type: "appointment",
      description: "Rendez-vous avec Dr. Thomas Dubois",
      date: subDays(new Date(), 3),
    },
    {
      type: "medication",
      description: "Renouvellement d'ordonnance",
      date: subDays(new Date(), 5),
    },
    {
      type: "test",
      description: "Analyse de sang",
      date: subDays(new Date(), 7),
    },
    {
      type: "appointment",
      description: "Rendez-vous avec Dr. Marie Lefevre",
      date: subDays(new Date(), 14),
    },
  ],
  healthScore: 82,
  healthGoals: [
    { name: "Activité physique", progress: 65, target: "30 min/jour" },
    { name: "Consommation d'eau", progress: 80, target: "2L/jour" },
    { name: "Sommeil", progress: 70, target: "8h/nuit" },
  ],
};

// Sample chart data
const heartRateData = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), "dd/MM"),
  value: Math.floor(Math.random() * 15) + 65,
}));

const bloodPressureData = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), "dd/MM"),
  systolic: Math.floor(Math.random() * 20) + 110,
  diastolic: Math.floor(Math.random() * 15) + 70,
}));

const weightData = Array.from({ length: 12 }, (_, i) => ({
  month: format(new Date(2024, i, 1), "MMM", { locale: fr }),
  weight: Math.floor(Math.random() * 3) + 75,
}));

export default function PatientOverviewPage() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
          <p className="text-muted-foreground">
            Bienvenue, {patientData.name}. Voici un aperçu de votre santé.
          </p>
        </div>
        <Button asChild>
          <a href="/dashboard/patient/appointments/book">
            <Plus className="mr-2 h-4 w-4" /> Prendre un rendez-vous
          </a>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Fréquence cardiaque
            </CardTitle>
            <Heart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patientData.vitals.heartRate}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                bpm
              </span>
            </div>
            <div className="mt-4 h-[60px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={heartRateData.slice(-7)}
                  margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="heartRateGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#heartRateGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tension artérielle
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patientData.vitals.bloodPressure}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                mmHg
              </span>
            </div>
            <div className="mt-4 h-[60px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={bloodPressureData.slice(-7)}
                  margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                >
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#93c5fd"
                    strokeWidth={2}
                    dot={false}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Température</CardTitle>
            <ThermometerSun className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patientData.vitals.temperature}°C
            </div>
            <div className="mt-4 flex items-center">
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-amber-500"
                  style={{
                    width: `${(patientData.vitals.temperature / 40) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <div>35.0°C</div>
              <div>37.5°C</div>
              <div>40.0°C</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Saturation en oxygène
            </CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patientData.vitals.oxygenSaturation}%
            </div>
            <div className="mt-4 flex items-center">
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${patientData.vitals.oxygenSaturation}%` }}
                />
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <div>90%</div>
              <div>95%</div>
              <div>100%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Prochain rendez-vous</CardTitle>
            <CardDescription>
              Votre prochain rendez-vous médical programmé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" alt="Doctor" />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-semibold">
                  {patientData.nextAppointment.doctor}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {patientData.nextAppointment.specialty}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-2">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(
                    patientData.nextAppointment.date,
                    "EEEE d MMMM yyyy",
                    { locale: fr }
                  )}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(patientData.nextAppointment.date, "HH:mm")}
                </span>
              </div>
              <div className="flex items-center">
                <Stethoscope className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {patientData.nextAppointment.location}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Voir tous les rendez-vous
            </Button>
          </CardFooter>
        </Card>
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Score de santé</CardTitle>
            <CardDescription>
              Votre score de santé global basé sur vos données médicales
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-muted p-6">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="stroke-muted-foreground/20"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    className="stroke-primary"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={
                      2 * Math.PI * 40 * (1 - patientData.healthScore / 100)
                    }
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">
                    {patientData.healthScore}
                  </span>
                  <span className="text-xs text-muted-foreground">sur 100</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Votre santé est bonne</p>
                <p className="text-xs text-muted-foreground">
                  Continuez à suivre vos objectifs de santé pour améliorer votre
                  score
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {patientData.healthGoals.map((goal) => (
                <div key={goal.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {goal.target}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={goal.progress} className="h-2" />
                    <span className="text-sm font-medium">
                      {goal.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Tendances de santé</CardTitle>
            <CardDescription>
              Suivez l&apos;évolution de vos indicateurs de santé au fil du
              temps
            </CardDescription>
            <Tabs defaultValue="heart-rate" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="heart-rate">
                  Fréquence cardiaque
                </TabsTrigger>
                <TabsTrigger value="blood-pressure">
                  Tension artérielle
                </TabsTrigger>
                <TabsTrigger value="weight">Poids</TabsTrigger>
              </TabsList>
              <TabsContent value="heart-rate" className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={heartRateData}
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
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis domain={[60, 90]} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#heartRateGradientFull)"
                      name="Fréquence cardiaque (bpm)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="blood-pressure" className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={bloodPressureData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[60, 140]} />
                    <Tooltip />
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
              </TabsContent>
              <TabsContent value="weight" className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weightData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[70, 80]} />
                    <Tooltip />
                    <Bar
                      dataKey="weight"
                      fill="#10b981"
                      name="Poids (kg)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Médicaments</CardTitle>
            <CardDescription>
              Vos médicaments actuels et leur suivi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patientData.medications.map((medication) => (
                <div
                  key={medication.name}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{medication.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {medication.dosage} - {medication.frequency}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Restant</p>
                    <p
                      className={`text-sm ${
                        medication.remaining < 10
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {medication.remaining} comprimés
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Gérer mes médicaments
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>
            Historique de vos activités médicales récentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {patientData.recentActivity.map((activity, index) => (
              <div key={index} className="flex">
                <div className="relative mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  {activity.type === "appointment" && (
                    <Calendar className="h-6 w-6" />
                  )}
                  {activity.type === "medication" && (
                    <Pill className="h-6 w-6" />
                  )}
                  {activity.type === "test" && <Activity className="h-6 w-6" />}
                  {index < patientData.recentActivity.length - 1 && (
                    <div className="absolute bottom-0 left-1/2 h-full w-px -translate-x-1/2 translate-y-full bg-muted" />
                  )}
                </div>
                <div className="flex flex-col pb-8">
                  <span className="text-sm font-medium">
                    {activity.description}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(activity.date, "d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
