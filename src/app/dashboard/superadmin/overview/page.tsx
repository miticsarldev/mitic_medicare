"use client";

import { useState } from "react";
import { format, subDays, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Calendar,
  Check,
  Download,
  FileText,
  LifeBuoy,
  LineChart,
  MoreHorizontal,
  RefreshCw,
  Settings,
  ShieldCheck,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "@/components/ui/charts";

// Sample data for the dashboard
const overviewStats = [
  {
    title: "Utilisateurs Totaux",
    value: "24,892",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    title: "Nouveaux Patients",
    value: "1,294",
    change: "+18.2%",
    trend: "up",
    icon: User,
    color: "bg-green-500",
  },
  {
    title: "Médecins Actifs",
    value: "3,721",
    change: "+5.3%",
    trend: "up",
    icon: Activity,
    color: "bg-purple-500",
  },
  {
    title: "Rendez-vous",
    value: "8,294",
    change: "-2.1%",
    trend: "down",
    icon: Calendar,
    color: "bg-amber-500",
  },
];

// Sample data for user growth chart
const userGrowthData = Array.from({ length: 12 }, (_, i) => {
  const month = format(subMonths(new Date(), 11 - i), "MMM", { locale: fr });
  return {
    month,
    patients: 500 + Math.floor(Math.random() * 300) + i * 50,
    doctors: 100 + Math.floor(Math.random() * 50) + i * 10,
    hospitals: 20 + Math.floor(Math.random() * 10) + i * 2,
  };
});

// Sample data for revenue chart
const revenueData = Array.from({ length: 30 }, (_, i) => {
  const date = format(subDays(new Date(), 29 - i), "dd/MM");
  return {
    date,
    subscriptions: 5000 + Math.floor(Math.random() * 2000) + i * 100,
    services: 3000 + Math.floor(Math.random() * 1000) + i * 50,
    total: 8000 + Math.floor(Math.random() * 3000) + i * 150,
  };
});

// Sample data for user distribution
const userDistributionData = [
  { name: "Patients", value: 65 },
  { name: "Médecins", value: 25 },
  { name: "Hôpitaux", value: 10 },
];

// Sample data for recent activities
const recentActivities = [
  {
    id: "act1",
    user: {
      name: "Dr. Sophie Martin",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    action: "a créé un nouveau compte",
    time: "Il y a 10 minutes",
    type: "user",
  },
  {
    id: "act2",
    user: {
      name: "Hôpital Saint-Louis",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    action: "a mis à jour son profil",
    time: "Il y a 25 minutes",
    type: "hospital",
  },
  {
    id: "act3",
    user: {
      name: "Thomas Dubois",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    action: "a pris un rendez-vous",
    time: "Il y a 45 minutes",
    type: "patient",
  },
  {
    id: "act4",
    user: {
      name: "Dr. Jean Dupont",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    action: "a confirmé un rendez-vous",
    time: "Il y a 1 heure",
    type: "doctor",
  },
  {
    id: "act5",
    user: {
      name: "Marie Lefevre",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    action: "a laissé un avis 5 étoiles",
    time: "Il y a 2 heures",
    type: "review",
  },
];

// Sample data for pending verifications
const pendingVerifications = [
  {
    id: "ver1",
    name: "Dr. Antoine Moreau",
    type: "Médecin",
    specialty: "Cardiologue",
    submittedAt: "2024-03-05T10:30:00",
    documents: 3,
    status: "En attente",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "ver2",
    name: "Clinique des Champs-Élysées",
    type: "Hôpital",
    specialty: "Clinique privée",
    submittedAt: "2024-03-04T14:15:00",
    documents: 5,
    status: "En attente",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "ver3",
    name: "Dr. Claire Petit",
    type: "Médecin",
    specialty: "Dermatologue",
    submittedAt: "2024-03-03T09:45:00",
    documents: 4,
    status: "En attente",
    avatar: "/placeholder.svg?height=32&width=32",
  },
];

// Sample data for system health
const systemHealth = [
  {
    name: "CPU",
    value: 28,
    status: "normal",
  },
  {
    name: "Mémoire",
    value: 62,
    status: "normal",
  },
  {
    name: "Stockage",
    value: 78,
    status: "warning",
  },
  {
    name: "Bande passante",
    value: 41,
    status: "normal",
  },
];

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
              <div className="flex items-center pt-1 text-xs">
                {stat.trend === "up" ? (
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    stat.trend === "up" ? "text-green-500" : "text-red-500"
                  }
                >
                  {stat.change}
                </span>
                <span className="ml-1 text-muted-foreground">
                  vs période précédente
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center">
            <div className="flex-1">
              <CardTitle>Croissance des Utilisateurs</CardTitle>
              <CardDescription>
                Évolution du nombre d&apos;utilisateurs par catégorie
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger PNG
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Exporter CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userGrowthData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} utilisateurs`, ""]}
                  labelFormatter={(label) => `Mois: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="patients"
                  name="Patients"
                  fill="#0088FE"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="doctors"
                  name="Médecins"
                  fill="#00C49F"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="hospitals"
                  name="Hôpitaux"
                  fill="#FFBB28"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center">
            <div className="flex-1">
              <CardTitle>Revenus</CardTitle>
              <CardDescription>
                Revenus générés par les abonnements et services
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger PNG
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Exporter CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorSubscriptions"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorServices"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} €`, ""]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="subscriptions"
                  name="Abonnements"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorSubscriptions)"
                />
                <Area
                  type="monotone"
                  dataKey="services"
                  name="Services"
                  stroke="#82ca9d"
                  fillOpacity={1}
                  fill="url(#colorServices)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Sections */}
      <div className="grid gap-4 md:grid-cols-12">
        {/* Recent Activities */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Activités Récentes</CardTitle>
            <CardDescription>
              Les dernières actions effectuées sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-auto">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={activity.user.avatar}
                      alt={activity.user.name}
                    />
                    <AvatarFallback>
                      {activity.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium">
                        <span className="font-semibold">
                          {activity.user.name}
                        </span>{" "}
                        {activity.action}
                      </p>
                      <Badge
                        variant="outline"
                        className={`ml-2 ${
                          activity.type === "doctor"
                            ? "border-blue-500 text-blue-500"
                            : activity.type === "patient"
                            ? "border-green-500 text-green-500"
                            : activity.type === "hospital"
                            ? "border-purple-500 text-purple-500"
                            : "border-amber-500 text-amber-500"
                        }`}
                      >
                        {activity.type === "doctor"
                          ? "Médecin"
                          : activity.type === "patient"
                          ? "Patient"
                          : activity.type === "hospital"
                          ? "Hôpital"
                          : "Avis"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 px-6 py-3">
            <Button variant="ghost" className="w-full" asChild>
              <a href="/dashboard/superadmin/activity-logs">
                Voir toutes les activités{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardFooter>
        </Card>

        {/* User Distribution & System Health */}
        <div className="grid gap-4 md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribution des Utilisateurs</CardTitle>
              <CardDescription>
                Répartition par type d&apos;utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={userDistributionData}
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
                    {userDistributionData.map((entry, index) => (
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
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Santé du Système</CardTitle>
              <CardDescription>
                État actuel des ressources système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemHealth.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span
                      className={`text-xs font-medium ${
                        item.status === "normal"
                          ? "text-green-500"
                          : item.status === "warning"
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {item.value}%
                    </span>
                  </div>
                  <Progress
                    value={item.value}
                    className={`h-2 ${
                      item.status === "normal"
                        ? "bg-muted"
                        : item.status === "warning"
                        ? "bg-amber-100"
                        : "bg-red-100"
                    }`}
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <Button variant="ghost" className="w-full" asChild>
                <a href="/dashboard/superadmin/system/performance">
                  Voir les détails <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Pending Verifications */}
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="flex-1">
            <CardTitle>Vérifications en Attente</CardTitle>
            <CardDescription>
              Demandes de vérification nécessitant votre attention
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/superadmin/users/verifications">
              Voir tout <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingVerifications.map((verification) => (
              <div
                key={verification.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={verification.avatar}
                      alt={verification.name}
                    />
                    <AvatarFallback>
                      {verification.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{verification.name}</p>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {verification.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {verification.specialty}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm">
                      {format(new Date(verification.submittedAt), "dd/MM/yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {verification.documents} documents
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Check className="mr-1 h-4 w-4" />
                      Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive"
                    >
                      Refuser
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              <a href="/dashboard/superadmin/users/doctors">
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
              <a href="/dashboard/superadmin/users/subscriptions">
                <BarChart3 className="h-6 w-6 text-purple-500" />
                <span>Abonnements</span>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 gap-2"
              asChild
            >
              <a href="/dashboard/superadmin/content/blogs">
                <FileText className="h-6 w-6 text-amber-500" />
                <span>Gérer le Contenu</span>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 gap-2"
              asChild
            >
              <a href="/dashboard/superadmin/system/security">
                <ShieldCheck className="h-6 w-6 text-red-500" />
                <span>Sécurité</span>
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
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 gap-2"
              asChild
            >
              <a href="/dashboard/superadmin/statistics">
                <LineChart className="h-6 w-6 text-indigo-500" />
                <span>Statistiques</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
