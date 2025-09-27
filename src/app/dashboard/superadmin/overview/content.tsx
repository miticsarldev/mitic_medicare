"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  User,
  Users,
  Users2,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { approveUser, rejectUser, refreshDashboardData } from "./actions";
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
} from "recharts";
import {
  DashboardStats,
  PendingApprovalUser,
  SubscriptionStats,
} from "./types";

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface DashboardContentProps {
  dashboardStats: DashboardStats;
  pendingApprovals: PendingApprovalUser[];
  subscriptionStats: SubscriptionStats;
}

export function DashboardContent({
  dashboardStats,
  pendingApprovals,
  subscriptionStats,
}: DashboardContentProps) {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<PendingApprovalUser | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<DashboardStats>(dashboardStats);
  const [approvals, setApprovals] =
    useState<PendingApprovalUser[]>(pendingApprovals);
  const [subStats, setSubStats] =
    useState<SubscriptionStats>(subscriptionStats);

  // Function to handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [newStats, newApprovals, newSubStats] = await Promise.all([
        refreshDashboardData("stats", timeRange),
        refreshDashboardData("approvals"),
        refreshDashboardData("subscriptions"),
      ]);

      setStats(newStats as DashboardStats);
      setApprovals(newApprovals as PendingApprovalUser[]);
      setSubStats(newSubStats as SubscriptionStats);

      toast({
        title: "Données actualisées",
        description: "Les données du tableau de bord ont été mises à jour.",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser les données.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewDetails = (user: PendingApprovalUser) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleConfirmAction = (
    user: PendingApprovalUser,
    action: "approve" | "reject"
  ) => {
    setSelectedUser(user);
    setActionType(action);
    setIsConfirmDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;

    setIsActionLoading(true);

    try {
      if (actionType === "approve") {
        await approveUser(selectedUser);
        toast({
          title: "Utilisateur approuvé",
          description: `${selectedUser.name} a été approuvé avec succès. \nEmail de confirmation envoyé.`,
        });
      } else {
        await rejectUser(selectedUser.id);
        toast({
          title: "Utilisateur rejeté",
          description: `${selectedUser.name} a été rejeté.`,
          variant: "destructive",
        });
      }

      // Update local state
      setApprovals(approvals.filter((user) => user.id !== selectedUser.id));
      setIsConfirmDialogOpen(false);
      setIsDetailsOpen(false);

      // Refresh dashboard data
      const newStats = await refreshDashboardData("stats");
      setStats(newStats as DashboardStats);
    } catch (error) {
      console.error("Error performing action:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "HOSPITAL_ADMIN":
        return "Administrateur d'hôpital";
      case "INDEPENDENT_DOCTOR":
        return "Médecin indépendant";
      case "PATIENT":
        return "Patient";
      case "SUPER_ADMIN":
        return "Super Admin";
      default:
        return role;
    }
  };

  const getInitials = (name: string | null): string => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1"></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les temps</SelectItem>
              <SelectItem value="24h">Dernières 24 heures</SelectItem>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="6m">6 Mois</SelectItem>
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
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.overviewStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div
                className={`bg-${stat.color}-500 rounded-full p-2 text-white`}
              >
                {stat.icon === "Users" && <Users className="h-4 w-4" />}
                {stat.icon === "User" && <User className="h-4 w-4" />}
                {stat.icon === "Activity" && <Activity className="h-4 w-4" />}
                {stat.icon === "Calendar" && <Calendar className="h-4 w-4" />}
                {stat.icon === "CreditCard" && (
                  <CreditCard className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.userGrowthData}
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
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.revenueData}
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `${new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "XOF",
                    }).format(
                      typeof value === "number" ? value : Number(value)
                    )}`,
                    "",
                  ]}
                  labelFormatter={(label) => `Date : ${label}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="subscriptions"
                  name="Revenus Abonnements"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorSubscriptions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Sections */}
      <div className="grid gap-4 md:grid-cols-2 grid-cols-1">
        {/* -------- Distribution des Utilisateurs -------- */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution des Utilisateurs</CardTitle>
            <CardDescription>
              Répartition par type d&apos;utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={stats.userDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {stats.userDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name]}
                  separator=": "
                />
                <Legend verticalAlign="bottom" height={36} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* -------- Abonnements -------- */}
        <Card>
          <CardHeader>
            <CardTitle>Abonnements</CardTitle>
            <CardDescription>
              Répartition par type d&apos;abonnement
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {(() => {
              const rows = (subStats?.planStats ?? []).slice(0, 4);
              const hasData = rows.some((p) => (p?.count ?? 0) > 0);

              if (!rows.length || !hasData) {
                return (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="rounded-full bg-muted p-3 mb-3">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">
                      Aucun abonnement actif
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Les statistiques apparaîtront dès que des abonnements
                      seront souscrits.
                    </p>
                    <div className="mt-3">
                      <Button variant="outline" asChild>
                        <a href="/dashboard/superadmin/subscriptions/all">
                          Gérer les abonnements
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              }

              return rows.map((plan) => (
                <div key={plan.plan} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{plan.plan}</span>
                    <span className="text-xs font-medium text-blue-500">
                      {plan.count}{" "}
                      {plan.count > 1 ? "utilisateurs" : "utilisateur"}
                    </span>
                  </div>
                  <Progress value={plan.percentage} className="h-2 bg-muted" />
                </div>
              ));
            })()}
          </CardContent>

          <CardFooter className="border-t bg-muted/50 px-6 py-3">
            <Button variant="ghost" className="w-full" asChild>
              <a href="/dashboard/superadmin/subscriptions/all">
                Voir les détails <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* <SubscriptionManager /> */}
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
            <a href="/dashboard/superadmin/verifications/all">
              Voir tout <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvals.slice(0, 3).map((verification) => (
              <div
                key={verification.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(verification.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{verification.name}</p>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {getRoleLabel(verification.role)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {verification.role === "INDEPENDENT_DOCTOR" &&
                        verification.doctor
                          ? verification.doctor.specialization
                          : verification.role === "HOSPITAL_ADMIN" &&
                              verification.hospital
                            ? verification.hospital.name
                            : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm">
                      {format(new Date(verification.createdAt), "dd/MM/yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(verification.createdAt), {
                        locale: fr,
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(verification)}
                    >
                      Détails
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleConfirmAction(verification, "approve")
                      }
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approuver
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {approvals.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-primary/10 p-3">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-medium">
                  Aucune demande en attente
                </h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Toutes les demandes d&apos;approbation ont été traitées.
                </p>
              </div>
            )}
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
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 gap-2"
              asChild
            >
              <a href="/dashboard/superadmin/verifications/all">
                <ShieldCheck className="h-6 w-6 text-blue-500" />
                <span>Vérifications</span>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 gap-2"
              asChild
            >
              <a href="/dashboard/superadmin/users/patients">
                <Users className="h-6 w-6 text-green-500" />
                <span>Patients</span>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 gap-2"
              asChild
            >
              <a href="/dashboard/superadmin/subscriptions/all">
                <CreditCard className="h-6 w-6 text-purple-500" />
                <span>Abonnements</span>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 gap-2"
              asChild
            >
              <a href="/dashboard/superadmin/users/hospitals">
                <Building2 className="h-6 w-6 text-amber-500" />
                <span>Hôpitaux</span>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 gap-2"
              asChild
            >
              <a href="/dashboard/superadmin/users/doctors">
                <Users2 className="h-6 w-6 text-red-500" />
                <span>Docteurs</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>Détails de la demande</DialogTitle>
                <DialogDescription>
                  Informations détaillées sur la demande d&apos;approbation
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 flex flex-col items-center md:flex-row md:items-start">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="mt-4 flex-1 md:ml-6 md:mt-0">
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="mr-2">
                      {getRoleLabel(selectedUser.role)}
                    </Badge>
                    <Badge variant="secondary">
                      Inscrit{" "}
                      {formatDistanceToNow(new Date(selectedUser.createdAt), {
                        locale: fr,
                        addSuffix: true,
                      })}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium">
                    Informations personnelles
                  </h4>
                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Téléphone
                      </span>
                      <span className="font-medium">
                        {selectedUser.phone || "Non renseigné"}
                      </span>
                    </div>
                    {selectedUser.profile && (
                      <>
                        {selectedUser.profile.address && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Adresse
                            </span>
                            <span className="font-medium">
                              {selectedUser.profile.address}
                            </span>
                          </div>
                        )}
                        {selectedUser.profile.city && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Ville
                            </span>
                            <span className="font-medium">
                              {selectedUser.profile.city}
                            </span>
                          </div>
                        )}
                        {selectedUser.profile.country && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Pays
                            </span>
                            <span className="font-medium">
                              {selectedUser.profile.country}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">
                    Informations professionnelles
                  </h4>
                  <div className="space-y-2 rounded-lg border p-3">
                    {selectedUser.role === "INDEPENDENT_DOCTOR" &&
                      selectedUser.doctor && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Spécialisation
                            </span>
                            <span className="font-medium">
                              {selectedUser.doctor.specialization}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Numéro de licence
                            </span>
                            <span className="font-medium">
                              {selectedUser.doctor.licenseNumber}
                            </span>
                          </div>
                          {selectedUser.doctor.experience && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Expérience
                              </span>
                              <span className="font-medium">
                                {selectedUser.doctor.experience}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                    {selectedUser.role === "HOSPITAL_ADMIN" &&
                      selectedUser.hospital && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Nom de l&apos;hôpital
                            </span>
                            <span className="font-medium">
                              {selectedUser.hospital.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Adresse
                            </span>
                            <span className="font-medium">
                              {selectedUser.hospital.address}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Ville
                            </span>
                            <span className="font-medium">
                              {selectedUser.hospital.city}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Téléphone
                            </span>
                            <span className="font-medium">
                              {selectedUser.hospital.phone}
                            </span>
                          </div>
                        </>
                      )}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6 flex gap-2 sm:justify-between">
                <Button
                  variant="destructive"
                  onClick={() => handleConfirmAction(selectedUser, "reject")}
                >
                  <X className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
                <Button
                  onClick={() => handleConfirmAction(selectedUser, "approve")}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approuver
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Confirmer l'approbation"
                : "Confirmer le rejet"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Êtes-vous sûr de vouloir approuver cet utilisateur ? Il aura accès à la plateforme."
                : "Êtes-vous sûr de vouloir rejeter cet utilisateur ? Cette action ne peut pas être annulée."}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="mt-2 flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {getInitials(selectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.email}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isActionLoading}
            >
              Annuler
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <span className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </span>
              ) : actionType === "approve" ? (
                "Approuver"
              ) : (
                "Rejeter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
