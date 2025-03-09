"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  AlertCircle,
  ArrowDownUp,
  ArrowUp,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  HardDrive,
  LineChart,
  MemoryStickIcon as Memory,
  Network,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Upload,
  Wifi,
  FileText,
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
} from "recharts";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Sample data for server status
const serverStatus = {
  status: "operational", // operational, degraded, maintenance, outage
  uptime: "99.98%",
  uptimeDays: 124,
  lastRestart: "2024-02-15T08:30:00",
  version: "v2.5.3",
  environment: "Production",
  location: "Paris, France",
  provider: "AWS",
  instanceType: "t3.xlarge",
  ipAddress: "192.168.1.1",
  services: [
    { name: "API Gateway", status: "operational", uptime: "99.99%" },
    { name: "Authentication Service", status: "operational", uptime: "99.97%" },
    { name: "Database Cluster", status: "operational", uptime: "99.95%" },
    { name: "File Storage", status: "operational", uptime: "100%" },
    { name: "Email Service", status: "degraded", uptime: "98.75%" },
    { name: "Search Engine", status: "operational", uptime: "99.92%" },
    { name: "Background Jobs", status: "operational", uptime: "99.89%" },
    { name: "CDN", status: "operational", uptime: "99.99%" },
  ],
  resources: {
    cpu: {
      usage: 42,
      cores: 8,
      temperature: 58,
      history: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: Math.floor(Math.random() * 60) + 20,
      })),
    },
    memory: {
      usage: 68,
      total: "32GB",
      free: "10.24GB",
      history: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: Math.floor(Math.random() * 40) + 40,
      })),
    },
    disk: {
      usage: 76,
      total: "500GB",
      free: "120GB",
      readSpeed: "210 MB/s",
      writeSpeed: "180 MB/s",
      history: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: Math.floor(Math.random() * 20) + 65,
      })),
    },
    network: {
      incoming: "1.2 GB/s",
      outgoing: "0.8 GB/s",
      latency: "12ms",
      packetLoss: "0.01%",
      history: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        incoming: Math.floor(Math.random() * 2000) + 500,
        outgoing: Math.floor(Math.random() * 1500) + 300,
      })),
    },
  },
  incidents: [
    {
      id: "INC-2024-03-15",
      title: "Email Service Degradation",
      status: "investigating",
      severity: "minor",
      startTime: "2024-03-15T14:30:00",
      endTime: null,
      description:
        "We're experiencing delays in email delivery. Our team is investigating the issue.",
      updates: [
        {
          time: "2024-03-15T14:35:00",
          message:
            "Issue identified with the email queue processor. Engineers are working on a fix.",
        },
        {
          time: "2024-03-15T15:00:00",
          message:
            "The root cause has been identified as high load on the email service. We're scaling up resources.",
        },
      ],
    },
    {
      id: "INC-2024-03-10",
      title: "Database Performance Degradation",
      status: "resolved",
      severity: "major",
      startTime: "2024-03-10T09:15:00",
      endTime: "2024-03-10T11:45:00",
      description:
        "Users experienced slow response times due to database performance issues.",
      updates: [
        {
          time: "2024-03-10T09:20:00",
          message: "Investigating slow response times across the platform.",
        },
        {
          time: "2024-03-10T09:45:00",
          message:
            "Identified high load on the database cluster. Optimizing queries and scaling up resources.",
        },
        {
          time: "2024-03-10T11:30:00",
          message:
            "Performance has been restored. Monitoring the situation closely.",
        },
        {
          time: "2024-03-10T11:45:00",
          message:
            "Issue fully resolved. Added additional database capacity and optimized slow queries.",
        },
      ],
    },
  ],
  maintenanceWindows: [
    {
      id: "MW-2024-03-20",
      title: "Scheduled Database Maintenance",
      status: "scheduled",
      startTime: "2024-03-20T02:00:00",
      endTime: "2024-03-20T04:00:00",
      description:
        "Database optimization and index rebuilding. Expected downtime: 15 minutes.",
      services: ["Database Cluster"],
    },
    {
      id: "MW-2024-03-25",
      title: "System Upgrade",
      status: "scheduled",
      startTime: "2024-03-25T01:00:00",
      endTime: "2024-03-25T03:00:00",
      description:
        "Upgrading to the latest version with security patches and performance improvements.",
      services: ["API Gateway", "Authentication Service", "Background Jobs"],
    },
  ],
};

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case "operational":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">Opérationnel</Badge>
      );
    case "degraded":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">Dégradé</Badge>
      );
    case "maintenance":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">Maintenance</Badge>
      );
    case "outage":
      return <Badge className="bg-red-500 hover:bg-red-600">Panne</Badge>;
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};

// Helper function to get incident severity badge
const getIncidentSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return <Badge className="bg-red-500 hover:bg-red-600">Critique</Badge>;
    case "major":
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600">Majeur</Badge>
      );
    case "minor":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">Mineur</Badge>
      );
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};

// Helper function to get incident status badge
const getIncidentStatusBadge = (status: string) => {
  switch (status) {
    case "investigating":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          En cours d&apos;investigation
        </Badge>
      );
    case "identified":
      return (
        <Badge className="bg-purple-500 hover:bg-purple-600">Identifié</Badge>
      );
    case "monitoring":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          Surveillance
        </Badge>
      );
    case "resolved":
      return <Badge className="bg-green-500 hover:bg-green-600">Résolu</Badge>;
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};

export default function ServerStatusPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("24h");
  const [showNotifications, setShowNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [maintenanceTitle, setMaintenanceTitle] = useState("");
  const [maintenanceDescription, setMaintenanceDescription] = useState("");
  const [maintenanceStartDate, setMaintenanceStartDate] = useState("");
  const [maintenanceStartTime, setMaintenanceStartTime] = useState("");
  const [maintenanceEndDate, setMaintenanceEndDate] = useState("");
  const [maintenanceEndTime, setMaintenanceEndTime] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Simulate refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Données actualisées",
        description: "Les informations de statut ont été mises à jour.",
      });
    }, 1500);
  };

  // Auto-update timer
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (autoRefresh) {
      timer = setInterval(() => {
        setLastUpdated(new Date());
      }, 60000); // Update every minute
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRefresh]);

  // Handle maintenance form submission
  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !maintenanceTitle ||
      !maintenanceDescription ||
      !maintenanceStartDate ||
      !maintenanceStartTime ||
      !maintenanceEndDate ||
      !maintenanceEndTime ||
      selectedServices.length === 0
    ) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Maintenance planifiée",
      description: "La fenêtre de maintenance a été planifiée avec succès.",
    });

    // Reset form
    setMaintenanceTitle("");
    setMaintenanceDescription("");
    setMaintenanceStartDate("");
    setMaintenanceStartTime("");
    setMaintenanceEndDate("");
    setMaintenanceEndTime("");
    setSelectedServices([]);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Statut du Serveur
            </h2>
            <p className="text-muted-foreground">
              Surveillance en temps réel de l&apos;infrastructure et des
              services
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Dernière heure</SelectItem>
                <SelectItem value="6h">6 dernières heures</SelectItem>
                <SelectItem value="24h">24 dernières heures</SelectItem>
                <SelectItem value="7d">7 derniers jours</SelectItem>
                <SelectItem value="30d">30 derniers jours</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Actualisation...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualiser
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className={`border-l-4 ${
              serverStatus.status === "operational"
                ? "border-l-green-500"
                : serverStatus.status === "degraded"
                ? "border-l-yellow-500"
                : serverStatus.status === "maintenance"
                ? "border-l-blue-500"
                : "border-l-red-500"
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Statut Système
              </CardTitle>
              {serverStatus.status === "operational" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : serverStatus.status === "degraded" ? (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              ) : serverStatus.status === "maintenance" ? (
                <Settings className="h-4 w-4 text-blue-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {serverStatus.status === "operational"
                  ? "Opérationnel"
                  : serverStatus.status === "degraded"
                  ? "Partiellement dégradé"
                  : serverStatus.status === "maintenance"
                  ? "En maintenance"
                  : "Panne"}
              </div>
              <p className="text-xs text-muted-foreground">
                Dernière mise à jour:{" "}
                {format(lastUpdated, "HH:mm:ss", { locale: fr })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serverStatus.uptime}</div>
              <p className="text-xs text-muted-foreground">
                {serverStatus.uptimeDays} jours sans interruption
              </p>
              <div className="mt-3">
                <Progress
                  value={Number.parseFloat(serverStatus.uptime)}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ressources</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span>CPU</span>
                    <span className="font-medium">
                      {serverStatus.resources.cpu.usage}%
                    </span>
                  </div>
                  <Progress
                    value={serverStatus.resources.cpu.usage}
                    className="h-1"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Mémoire</span>
                    <span className="font-medium">
                      {serverStatus.resources.memory.usage}%
                    </span>
                  </div>
                  <Progress
                    value={serverStatus.resources.memory.usage}
                    className="h-1"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Disque</span>
                    <span className="font-medium">
                      {serverStatus.resources.disk.usage}%
                    </span>
                  </div>
                  <Progress
                    value={serverStatus.resources.disk.usage}
                    className="h-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Réseau</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Upload className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">Sortant</span>
                </div>
                <span className="text-sm font-medium">
                  {serverStatus.resources.network.outgoing}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">Entrant</span>
                </div>
                <span className="text-sm font-medium">
                  {serverStatus.resources.network.incoming}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">Latence</span>
                <span className="text-xs font-medium">
                  {serverStatus.resources.network.latency}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="resources">Ressources</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informations du Serveur</CardTitle>
                  <CardDescription>
                    Détails de l&apos;infrastructure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Version
                          </span>
                          <span className="text-sm font-medium">
                            {serverStatus.version}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Environnement
                          </span>
                          <span className="text-sm font-medium">
                            {serverStatus.environment}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Localisation
                          </span>
                          <span className="text-sm font-medium">
                            {serverStatus.location}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Fournisseur
                          </span>
                          <span className="text-sm font-medium">
                            {serverStatus.provider}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Type d&apos;instance
                          </span>
                          <span className="text-sm font-medium">
                            {serverStatus.instanceType}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Adresse IP
                          </span>
                          <span className="text-sm font-medium">
                            {serverStatus.ipAddress}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Dernier redémarrage
                          </span>
                          <span className="text-sm font-medium">
                            {format(
                              new Date(serverStatus.lastRestart),
                              "dd/MM/yyyy HH:mm",
                              { locale: fr }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Uptime
                          </span>
                          <span className="text-sm font-medium">
                            {serverStatus.uptimeDays} jours
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button variant="outline" className="w-full">
                    <Server className="mr-2 h-4 w-4" />
                    Détails complets du serveur
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statut des Services</CardTitle>
                  <CardDescription>
                    Vue d&apos;ensemble des services critiques
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Opérationnel",
                                value: serverStatus.services.filter(
                                  (s) => s.status === "operational"
                                ).length,
                              },
                              {
                                name: "Dégradé",
                                value: serverStatus.services.filter(
                                  (s) => s.status === "degraded"
                                ).length,
                              },
                              {
                                name: "Maintenance",
                                value: serverStatus.services.filter(
                                  (s) => s.status === "maintenance"
                                ).length,
                              },
                              {
                                name: "Panne",
                                value: serverStatus.services.filter(
                                  (s) => s.status === "outage"
                                ).length,
                              },
                            ]}
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
                            {[
                              { name: "Opérationnel", color: "#10b981" },
                              { name: "Dégradé", color: "#f59e0b" },
                              { name: "Maintenance", color: "#3b82f6" },
                              { name: "Panne", color: "#ef4444" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex items-center">
                        <div className="mr-1.5 h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-xs">Opérationnel</span>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-1.5 h-3 w-3 rounded-full bg-yellow-500"></div>
                        <span className="text-xs">Dégradé</span>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-1.5 h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs">Maintenance</span>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-1.5 h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-xs">Panne</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button variant="outline" className="w-full">
                    <Activity className="mr-2 h-4 w-4" />
                    Voir tous les services
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Utilisation des Ressources</CardTitle>
                <CardDescription>
                  Tendances sur les dernières 24 heures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={Array.from({ length: 24 }, (_, i) => ({
                        time: `${i}:00`,
                        cpu: serverStatus.resources.cpu.history[i].value,
                        memory: serverStatus.resources.memory.history[i].value,
                        disk: serverStatus.resources.disk.history[i].value,
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="cpu"
                        stroke="#ef4444"
                        name="CPU (%)"
                      />
                      <Line
                        type="monotone"
                        dataKey="memory"
                        stroke="#3b82f6"
                        name="Mémoire (%)"
                      />
                      <Line
                        type="monotone"
                        dataKey="disk"
                        stroke="#10b981"
                        name="Disque (%)"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Incidents Récents</CardTitle>
                  <CardDescription>Derniers problèmes signalés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serverStatus.incidents.length > 0 ? (
                      serverStatus.incidents.map((incident) => (
                        <div
                          key={incident.id}
                          className="rounded-lg border p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{incident.title}</div>
                            {getIncidentStatusBadge(incident.status)}
                          </div>
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <Clock className="mr-1.5 h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {format(
                                  new Date(incident.startTime),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: fr }
                                )}
                              </span>
                            </div>
                            {getIncidentSeverityBadge(incident.severity)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <h3 className="mt-2 text-sm font-medium">
                          Aucun incident récent
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Tous les systèmes fonctionnent normalement.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button variant="outline" className="w-full">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Voir tous les incidents
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Planifiée</CardTitle>
                  <CardDescription>Interventions à venir</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serverStatus.maintenanceWindows.length > 0 ? (
                      serverStatus.maintenanceWindows.map((maintenance) => (
                        <div
                          key={maintenance.id}
                          className="rounded-lg border p-3"
                        >
                          <div className="font-medium">{maintenance.title}</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {maintenance.description}
                          </div>
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <Clock className="mr-1.5 h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {format(
                                  new Date(maintenance.startTime),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: fr }
                                )}
                              </span>
                            </div>
                            <Badge variant="outline">Planifié</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Settings className="h-8 w-8 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-medium">
                          Aucune maintenance planifiée
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Aucune intervention n&apos;est prévue pour le moment.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Voir toutes les maintenances
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Statut des Services</CardTitle>
                <CardDescription>
                  État actuel de tous les services de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serverStatus.services.map((service) => (
                    <div
                      key={service.name}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center">
                        {service.status === "operational" ? (
                          <CheckCircle2 className="mr-3 h-5 w-5 text-green-500" />
                        ) : service.status === "degraded" ? (
                          <AlertCircle className="mr-3 h-5 w-5 text-yellow-500" />
                        ) : service.status === "maintenance" ? (
                          <Settings className="mr-3 h-5 w-5 text-blue-500" />
                        ) : (
                          <AlertCircle className="mr-3 h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Uptime: {service.uptime}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="mr-1.5 h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-xs">Opérationnel</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1.5 h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="text-xs">Dégradé</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1.5 h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs">Maintenance</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1.5 h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-xs">Panne</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Configurer les alertes
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Historique d&apos;Uptime</CardTitle>
                  <CardDescription>
                    Disponibilité des services sur les 30 derniers jours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={serverStatus.services.map((service) => ({
                          name: service.name,
                          uptime: Number.parseFloat(
                            service.uptime.replace("%", "")
                          ),
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[95, 100]} />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Uptime"]}
                        />
                        <Bar
                          dataKey="uptime"
                          fill="#10b981"
                          radius={[0, 4, 4, 0]}
                        >
                          {serverStatus.services.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                serverStatus.services[index].uptime === "100%"
                                  ? "#10b981"
                                  : Number.parseFloat(
                                      serverStatus.services[
                                        index
                                      ].uptime.replace("%", "")
                                    ) >= 99.9
                                  ? "#34d399"
                                  : Number.parseFloat(
                                      serverStatus.services[
                                        index
                                      ].uptime.replace("%", "")
                                    ) >= 99.5
                                  ? "#f59e0b"
                                  : "#ef4444"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dépendances des Services</CardTitle>
                  <CardDescription>
                    Relations entre les services de la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <Server className="h-10 w-10 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Diagramme des dépendances
                      </p>
                      <Button variant="outline" className="mt-4">
                        <LineChart className="mr-2 h-4 w-4" />
                        Afficher le diagramme
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Utilisation CPU</CardTitle>
                  <CardDescription>
                    {serverStatus.resources.cpu.cores} cœurs | Température:{" "}
                    {serverStatus.resources.cpu.temperature}°C
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-medium">
                          Utilisation actuelle
                        </span>
                        <div className="flex items-center">
                          <Cpu className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-2xl font-bold">
                            {serverStatus.resources.cpu.usage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-16 w-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "Utilisé",
                                  value: serverStatus.resources.cpu.usage,
                                },
                                {
                                  name: "Libre",
                                  value: 100 - serverStatus.resources.cpu.usage,
                                },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={15}
                              outerRadius={30}
                              fill="#8884d8"
                              dataKey="value"
                              startAngle={90}
                              endAngle={-270}
                            >
                              <Cell fill="#3b82f6" />
                              <Cell fill="#e5e7eb" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={serverStatus.resources.cpu.history}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="cpuGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#3b82f6"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#3b82f6"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="time" />
                          <YAxis domain={[0, 100]} />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#cpuGradient)"
                            name="CPU (%)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-md border p-2">
                        <div className="text-xs text-muted-foreground">
                          Moyenne
                        </div>
                        <div className="text-sm font-medium">45%</div>
                      </div>
                      <div className="rounded-md border p-2">
                        <div className="text-xs text-muted-foreground">
                          Maximum
                        </div>
                        <div className="text-sm font-medium">78%</div>
                      </div>
                      <div className="rounded-md border p-2">
                        <div className="text-xs text-muted-foreground">
                          Minimum
                        </div>
                        <div className="text-sm font-medium">22%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Utilisation Mémoire</CardTitle>
                  <CardDescription>
                    Total: {serverStatus.resources.memory.total} | Libre:{" "}
                    {serverStatus.resources.memory.free}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-medium">
                          Utilisation actuelle
                        </span>
                        <div className="flex items-center">
                          <Memory className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-2xl font-bold">
                            {serverStatus.resources.memory.usage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-16 w-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "Utilisé",
                                  value: serverStatus.resources.memory.usage,
                                },
                                {
                                  name: "Libre",
                                  value:
                                    100 - serverStatus.resources.memory.usage,
                                },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={15}
                              outerRadius={30}
                              fill="#8884d8"
                              dataKey="value"
                              startAngle={90}
                              endAngle={-270}
                            >
                              <Cell fill="#ef4444" />
                              <Cell fill="#e5e7eb" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={serverStatus.resources.memory.history}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="memoryGradient"
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
                          <XAxis dataKey="time" />
                          <YAxis domain={[0, 100]} />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#memoryGradient)"
                            name="Mémoire (%)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-md border p-2">
                        <div className="text-xs text-muted-foreground">
                          Moyenne
                        </div>
                        <div className="text-sm font-medium">62%</div>
                      </div>
                      <div className="rounded-md border p-2">
                        <div className="text-xs text-muted-foreground">
                          Maximum
                        </div>
                        <div className="text-sm font-medium">85%</div>
                      </div>
                      <div className="rounded-md border p-2">
                        <div className="text-xs text-muted-foreground">
                          Minimum
                        </div>
                        <div className="text-sm font-medium">40%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Utilisation Disque</CardTitle>
                  <CardDescription>
                    Total: {serverStatus.resources.disk.total} | Libre:{" "}
                    {serverStatus.resources.disk.free}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-medium">
                          Utilisation actuelle
                        </span>
                        <div className="flex items-center">
                          <HardDrive className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-2xl font-bold">
                            {serverStatus.resources.disk.usage}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-xs text-muted-foreground">
                          Vitesse de lecture
                        </div>
                        <div className="text-sm font-medium">
                          {serverStatus.resources.disk.readSpeed}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Vitesse d&apos;écriture
                        </div>
                        <div className="text-sm font-medium">
                          {serverStatus.resources.disk.writeSpeed}
                        </div>
                      </div>
                    </div>

                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={serverStatus.resources.disk.history}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="diskGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#10b981"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#10b981"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="time" />
                          <YAxis domain={[0, 100]} />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#diskGradient)"
                            name="Disque (%)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="rounded-md border p-3">
                      <div className="text-sm font-medium mb-2">
                        Répartition de l&apos;espace disque
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Système</span>
                            <span>120 GB (24%)</span>
                          </div>
                          <Progress value={24} className="h-1" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Base de données</span>
                            <span>200 GB (40%)</span>
                          </div>
                          <Progress value={40} className="h-1" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Fichiers utilisateurs</span>
                            <span>60 GB (12%)</span>
                          </div>
                          <Progress value={12} className="h-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trafic Réseau</CardTitle>
                  <CardDescription>
                    Latence: {serverStatus.resources.network.latency} | Perte de
                    paquets: {serverStatus.resources.network.packetLoss}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <ArrowDownUp className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Trafic actuel
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <ArrowUp className="mr-1 h-3 w-3 text-red-500" />
                            <span className="text-sm">
                              {serverStatus.resources.network.outgoing}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Download className="mr-1 h-3 w-3 text-green-500" />
                            <span className="text-sm">
                              {serverStatus.resources.network.incoming}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-xs text-muted-foreground">
                          Qualité de connexion
                        </div>
                        <div className="flex items-center justify-end">
                          <Wifi className="mr-1 h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">
                            Excellente
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={serverStatus.resources.network.history}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="incomingGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#10b981"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#10b981"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="outgoingGradient"
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
                          <XAxis dataKey="time" />
                          <YAxis />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Tooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="incoming"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#incomingGradient)"
                            name="Entrant (MB/s)"
                          />
                          <Area
                            type="monotone"
                            dataKey="outgoing"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#outgoingGradient)"
                            name="Sortant (MB/s)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md border p-3">
                        <div className="text-xs text-muted-foreground">
                          Total téléchargé aujourd&apos;hui
                        </div>
                        <div className="text-lg font-medium">1.45 TB</div>
                      </div>
                      <div className="rounded-md border p-3">
                        <div className="text-xs text-muted-foreground">
                          Total envoyé aujourd&apos;hui
                        </div>
                        <div className="text-lg font-medium">0.89 TB</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incidents Actifs</CardTitle>
                <CardDescription>
                  Problèmes en cours d&apos;investigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serverStatus.incidents.filter((i) => i.status !== "resolved")
                    .length > 0 ? (
                    serverStatus.incidents
                      .filter((i) => i.status !== "resolved")
                      .map((incident) => (
                        <div
                          key={incident.id}
                          className="rounded-lg border p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{incident.title}</div>
                            {getIncidentStatusBadge(incident.status)}
                          </div>
                          <div className="mt-2 text-sm">
                            {incident.description}
                          </div>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <Clock className="mr-1.5 h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Début:{" "}
                                {format(
                                  new Date(incident.startTime),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: fr }
                                )}
                              </span>
                            </div>
                            {getIncidentSeverityBadge(incident.severity)}
                          </div>

                          <Separator className="my-4" />

                          <div className="space-y-3">
                            <div className="text-sm font-medium">
                              Mises à jour
                            </div>
                            {incident.updates.map((update, index) => (
                              <div
                                key={index}
                                className="rounded-md bg-muted p-2 text-sm"
                              >
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="mr-1 h-3 w-3" />
                                  <span>
                                    {format(
                                      new Date(update.time),
                                      "dd/MM/yyyy HH:mm",
                                      { locale: fr }
                                    )}
                                  </span>
                                </div>
                                <div className="mt-1">{update.message}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <h3 className="mt-2 text-sm font-medium">
                        Aucun incident actif
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Tous les systèmes fonctionnent normalement.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historique des Incidents</CardTitle>
                <CardDescription>
                  Incidents résolus des 30 derniers jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serverStatus.incidents.filter((i) => i.status === "resolved")
                    .length > 0 ? (
                    serverStatus.incidents
                      .filter((i) => i.status === "resolved")
                      .map((incident) => (
                        <div
                          key={incident.id}
                          className="rounded-lg border p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{incident.title}</div>
                            {getIncidentStatusBadge(incident.status)}
                          </div>
                          <div className="mt-2 text-sm">
                            {incident.description}
                          </div>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Clock className="mr-1.5 h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Début:{" "}
                                  {format(
                                    new Date(incident.startTime),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: fr }
                                  )}
                                </span>
                              </div>
                              {incident.endTime && (
                                <div className="flex items-center">
                                  <Clock className="mr-1.5 h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    Fin:{" "}
                                    {format(
                                      new Date(incident.endTime),
                                      "dd/MM/yyyy HH:mm",
                                      { locale: fr }
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                            {getIncidentSeverityBadge(incident.severity)}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 w-full"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Voir le rapport d&apos;incident
                          </Button>
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <h3 className="mt-2 text-sm font-medium">
                        Aucun incident récent
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Aucun incident n&apos;a été signalé au cours des 30
                        derniers jours.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Voir tous les incidents
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Planifiée</CardTitle>
                <CardDescription>Interventions à venir</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serverStatus.maintenanceWindows.length > 0 ? (
                    serverStatus.maintenanceWindows.map((maintenance) => (
                      <div
                        key={maintenance.id}
                        className="rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{maintenance.title}</div>
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                          >
                            Planifié
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm">
                          {maintenance.description}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Clock className="mr-1.5 h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Début:{" "}
                                {format(
                                  new Date(maintenance.startTime),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: fr }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1.5 h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Fin:{" "}
                                {format(
                                  new Date(maintenance.endTime),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: fr }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">
                            Services affectés
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {maintenance.services.map((service, index) => (
                              <Badge key={index} variant="secondary">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Settings className="h-8 w-8 text-muted-foreground" />
                      <h3 className="mt-2 text-sm font-medium">
                        Aucune maintenance planifiée
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Aucune intervention n&apos;est prévue pour le moment.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Planifier une maintenance
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historique de Maintenance</CardTitle>
                <CardDescription>Interventions passées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Mise à jour de sécurité</div>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 hover:bg-green-100"
                      >
                        Terminé
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm">
                      Application des derniers correctifs de sécurité et mise à
                      jour du système d&apos;exploitation.
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Clock className="mr-1.5 h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Début:{" "}
                            {format(
                              new Date("2024-03-05T01:00:00"),
                              "dd/MM/yyyy HH:mm",
                              { locale: fr }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1.5 h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Fin:{" "}
                            {format(
                              new Date("2024-03-05T03:30:00"),
                              "dd/MM/yyyy HH:mm",
                              { locale: fr }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        Optimisation de la base de données
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 hover:bg-green-100"
                      >
                        Terminé
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm">
                      Réindexation et optimisation des performances de la base
                      de données principale.
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Clock className="mr-1.5 h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Début:{" "}
                            {format(
                              new Date("2024-02-20T02:00:00"),
                              "dd/MM/yyyy HH:mm",
                              { locale: fr }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1.5 h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Fin:{" "}
                            {format(
                              new Date("2024-02-20T04:15:00"),
                              "dd/MM/yyyy HH:mm",
                              { locale: fr }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Voir tout l&apos;historique
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Planification de Maintenance</CardTitle>
                <CardDescription>
                  Créer une nouvelle fenêtre de maintenance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium mb-4">
                      Nouvelle maintenance
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="maintenance-title">Titre</Label>
                        <Input
                          id="maintenance-title"
                          placeholder="Titre de la maintenance"
                          value={maintenanceTitle}
                          onChange={(e) => setMaintenanceTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="maintenance-start-date">
                            Date de début
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              id="maintenance-start-date"
                              type="date"
                              value={maintenanceStartDate}
                              onChange={(e) =>
                                setMaintenanceStartDate(e.target.value)
                              }
                              required
                            />
                            <Input
                              id="maintenance-start-time"
                              type="time"
                              value={maintenanceStartTime}
                              onChange={(e) =>
                                setMaintenanceStartTime(e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maintenance-end-date">
                            Date de fin
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              id="maintenance-end-date"
                              type="date"
                              value={maintenanceEndDate}
                              onChange={(e) =>
                                setMaintenanceEndDate(e.target.value)
                              }
                              required
                            />
                            <Input
                              id="maintenance-end-time"
                              type="time"
                              value={maintenanceEndTime}
                              onChange={(e) =>
                                setMaintenanceEndTime(e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maintenance-description">
                          Description
                        </Label>
                        <Textarea
                          id="maintenance-description"
                          placeholder="Décrivez la maintenance et son impact..."
                          className="min-h-[100px]"
                          value={maintenanceDescription}
                          onChange={(e) =>
                            setMaintenanceDescription(e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Services affectés</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {serverStatus.services.map((service) => (
                            <div
                              key={service.name}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`service-${service.name}`}
                                checked={selectedServices.includes(
                                  service.name
                                )}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedServices([
                                      ...selectedServices,
                                      service.name,
                                    ]);
                                  } else {
                                    setSelectedServices(
                                      selectedServices.filter(
                                        (s) => s !== service.name
                                      )
                                    );
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`service-${service.name}`}
                                className="text-sm font-normal"
                              >
                                {service.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Options</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="notify-users"
                            checked={showNotifications}
                            onCheckedChange={setShowNotifications}
                          />
                          <Label
                            htmlFor="notify-users"
                            className="text-sm font-normal"
                          >
                            Notifier les utilisateurs
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline">
                      Annuler
                    </Button>
                    <Button type="submit">Planifier la maintenance</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
            <CardDescription>
              Configurer les options de surveillance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="auto-refresh"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Actualisation automatique</span>
                    </Label>
                    <Switch
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Actualise automatiquement les données toutes les minutes
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="email-alerts"
                      className="flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>Alertes par email</span>
                    </Label>
                    <Switch id="email-alerts" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recevoir des alertes par email en cas d&apos;incident
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Seuils d&apos;alerte</h3>
                <div className="space-y-2">
                  <Label htmlFor="cpu-threshold">Seuil CPU</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cpu-threshold"
                      type="number"
                      defaultValue="80"
                      className="w-20"
                    />
                    <span className="text-sm">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Déclencher une alerte lorsque l&apos;utilisation du CPU
                    dépasse ce seuil
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memory-threshold">Seuil Mémoire</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="memory-threshold"
                      type="number"
                      defaultValue="85"
                      className="w-20"
                    />
                    <span className="text-sm">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Déclencher une alerte lorsque l&apos;utilisation de la
                    mémoire dépasse ce seuil
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button className="ml-auto">Enregistrer les paramètres</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
