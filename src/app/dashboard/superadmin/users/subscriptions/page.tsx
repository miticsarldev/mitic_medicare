"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowUpDown,
  Check,
  CreditCard,
  Download,
  Edit,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash,
  TrendingUp,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
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
} from "@/components/ui/charts";

// Sample data for subscriptions
const subscriptions = [
  {
    id: "sub-001",
    userId: "user-123",
    userType: "patient",
    userName: "Thomas Dubois",
    userEmail: "thomas.dubois@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    plan: "premium",
    status: "active",
    startDate: "2023-11-15",
    endDate: "2024-11-15",
    billingCycle: "yearly",
    amount: 99.99,
    paymentMethod: "card",
    autoRenew: true,
    lastPayment: "2023-11-15",
    nextPayment: "2024-11-15",
  },
  {
    id: "sub-002",
    userId: "user-456",
    userType: "doctor",
    userName: "Dr. Sophie Martin",
    userEmail: "sophie.martin@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    plan: "professional",
    status: "active",
    startDate: "2024-01-10",
    endDate: "2025-01-10",
    billingCycle: "yearly",
    amount: 199.99,
    paymentMethod: "card",
    autoRenew: true,
    lastPayment: "2024-01-10",
    nextPayment: "2025-01-10",
  },
  {
    id: "sub-003",
    userId: "user-789",
    userType: "patient",
    userName: "Marie Lefevre",
    userEmail: "marie.lefevre@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    plan: "basic",
    status: "active",
    startDate: "2024-02-05",
    endDate: "2024-03-05",
    billingCycle: "monthly",
    amount: 9.99,
    paymentMethod: "paypal",
    autoRenew: true,
    lastPayment: "2024-02-05",
    nextPayment: "2024-03-05",
  },
  {
    id: "sub-004",
    userId: "user-101",
    userType: "hospital",
    userName: "Hôpital Saint-Louis",
    userEmail: "contact@hopital-saintlouis.fr",
    userAvatar: "/placeholder.svg?height=40&width=40",
    plan: "enterprise",
    status: "active",
    startDate: "2023-09-01",
    endDate: "2024-09-01",
    billingCycle: "yearly",
    amount: 999.99,
    paymentMethod: "bank_transfer",
    autoRenew: true,
    lastPayment: "2023-09-01",
    nextPayment: "2024-09-01",
  },
  {
    id: "sub-005",
    userId: "user-202",
    userType: "doctor",
    userName: "Dr. Jean Dupont",
    userEmail: "jean.dupont@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    plan: "professional",
    status: "pending",
    startDate: "2024-02-28",
    endDate: "2024-03-28",
    billingCycle: "monthly",
    amount: 19.99,
    paymentMethod: "card",
    autoRenew: true,
    lastPayment: null,
    nextPayment: "2024-02-28",
  },
  {
    id: "sub-006",
    userId: "user-303",
    userType: "patient",
    userName: "Claire Petit",
    userEmail: "claire.petit@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    plan: "premium",
    status: "cancelled",
    startDate: "2023-08-15",
    endDate: "2024-02-15",
    billingCycle: "biannual",
    amount: 59.99,
    paymentMethod: "card",
    autoRenew: false,
    lastPayment: "2023-08-15",
    nextPayment: null,
  },
  {
    id: "sub-007",
    userId: "user-404",
    userType: "doctor",
    userName: "Dr. Antoine Moreau",
    userEmail: "antoine.moreau@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    plan: "professional",
    status: "expired",
    startDate: "2023-01-20",
    endDate: "2024-01-20",
    billingCycle: "yearly",
    amount: 199.99,
    paymentMethod: "card",
    autoRenew: false,
    lastPayment: "2023-01-20",
    nextPayment: null,
  },
  {
    id: "sub-008",
    userId: "user-505",
    userType: "hospital",
    userName: "Clinique des Champs-Élysées",
    userEmail: "contact@clinique-champselysees.fr",
    userAvatar: "/placeholder.svg?height=40&width=40",
    plan: "enterprise",
    status: "active",
    startDate: "2023-12-01",
    endDate: "2024-12-01",
    billingCycle: "yearly",
    amount: 999.99,
    paymentMethod: "bank_transfer",
    autoRenew: true,
    lastPayment: "2023-12-01",
    nextPayment: "2024-12-01",
  },
  {
    id: "sub-009",
    userId: "user-606",
    userType: "patient",
    userName: "Pierre Martin",
    userEmail: "pierre.martin@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    plan: "basic",
    status: "trial",
    startDate: "2024-02-20",
    endDate: "2024-03-05",
    billingCycle: null,
    amount: 0,
    paymentMethod: null,
    autoRenew: false,
    lastPayment: null,
    nextPayment: "2024-03-05",
  },
  {
    id: "sub-010",
    userId: "user-707",
    userType: "doctor",
    userName: "Dr. Émilie Laurent",
    userEmail: "emilie.laurent@example.com",
    userAvatar: "/placeholder.svg?height=40&width=40",
    plan: "professional",
    status: "active",
    startDate: "2024-01-05",
    endDate: "2024-07-05",
    billingCycle: "biannual",
    amount: 119.99,
    paymentMethod: "paypal",
    autoRenew: true,
    lastPayment: "2024-01-05",
    nextPayment: "2024-07-05",
  },
];

// Sample data for subscription plans
const subscriptionPlans = [
  {
    id: "plan-basic",
    name: "Basic",
    description: "Accès aux fonctionnalités essentielles",
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    features: [
      "Prise de rendez-vous en ligne",
      "Historique médical de base",
      "Messagerie avec les médecins",
      "Rappels de rendez-vous",
    ],
    userType: "patient",
    isPopular: false,
  },
  {
    id: "plan-premium",
    name: "Premium",
    description: "Accès complet pour les patients",
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    features: [
      "Toutes les fonctionnalités Basic",
      "Téléconsultations illimitées",
      "Historique médical avancé",
      "Partage de documents médicaux",
      "Suivi des médicaments",
      "Analyses et rapports personnalisés",
    ],
    userType: "patient",
    isPopular: true,
  },
  {
    id: "plan-professional",
    name: "Professional",
    description: "Solution complète pour les médecins",
    monthlyPrice: 49.99,
    yearlyPrice: 499.99,
    features: [
      "Gestion des rendez-vous",
      "Dossiers patients électroniques",
      "Téléconsultations illimitées",
      "Prescription électronique",
      "Facturation intégrée",
      "Analyses et statistiques",
      "Support prioritaire",
    ],
    userType: "doctor",
    isPopular: true,
  },
  {
    id: "plan-enterprise",
    name: "Enterprise",
    description: "Solution sur mesure pour les établissements",
    monthlyPrice: 199.99,
    yearlyPrice: 1999.99,
    features: [
      "Toutes les fonctionnalités Professional",
      "Nombre illimité d'utilisateurs",
      "Intégration avec les systèmes existants",
      "API complète",
      "Personnalisation avancée",
      "Gestionnaire de compte dédié",
      "SLA garanti",
    ],
    userType: "hospital",
    isPopular: false,
  },
];

// Sample data for revenue statistics
const revenueData = [
  { month: "Jan", revenue: 12500 },
  { month: "Fév", revenue: 13200 },
  { month: "Mar", revenue: 14800 },
  { month: "Avr", revenue: 15300 },
  { month: "Mai", revenue: 16200 },
  { month: "Juin", revenue: 17500 },
  { month: "Juil", revenue: 18100 },
  { month: "Août", revenue: 17800 },
  { month: "Sep", revenue: 19200 },
  { month: "Oct", revenue: 20500 },
  { month: "Nov", revenue: 21800 },
  { month: "Déc", revenue: 23500 },
];

// Sample data for subscription distribution
const subscriptionDistributionData = [
  { name: "Basic", value: 35 },
  { name: "Premium", value: 45 },
  { name: "Professional", value: 15 },
  { name: "Enterprise", value: 5 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

// Helper function to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return format(new Date(dateString), "dd/MM/yyyy", { locale: fr });
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500">Actif</Badge>;
    case "pending":
      return <Badge className="bg-yellow-500">En attente</Badge>;
    case "cancelled":
      return <Badge className="bg-red-500">Annulé</Badge>;
    case "expired":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Expiré
        </Badge>
      );
    case "trial":
      return <Badge className="bg-blue-500">Essai</Badge>;
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};

// Helper function to get user type badge
const getUserTypeBadge = (userType: string) => {
  switch (userType) {
    case "patient":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 hover:bg-blue-100"
        >
          Patient
        </Badge>
      );
    case "doctor":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          Médecin
        </Badge>
      );
    case "hospital":
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 text-purple-800 hover:bg-purple-100"
        >
          Hôpital
        </Badge>
      );
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};

// Helper function to get payment method icon
const getPaymentMethodIcon = (method: string | null) => {
  if (!method) return null;

  switch (method) {
    case "card":
      return <CreditCard className="h-4 w-4 text-muted-foreground" />;
    case "paypal":
      return <div className="text-xs font-bold text-blue-600">PayPal</div>;
    case "bank_transfer":
      return <Building2 className="h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
};

// Building2 component (missing from imports)
const Building2 = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
};

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<
    (typeof subscriptions)[0] | null
  >(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewPlanDialogOpen, setIsNewPlanDialogOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("startDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter subscriptions based on search, status, user type, and plan
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      searchQuery === "" ||
      subscription.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.userEmail
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      subscription.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || subscription.status === statusFilter;
    const matchesUserType =
      userTypeFilter === "all" || subscription.userType === userTypeFilter;
    const matchesPlan =
      planFilter === "all" || subscription.plan === planFilter;

    return matchesSearch && matchesStatus && matchesUserType && matchesPlan;
  });

  // Sort subscriptions based on selected sort option
  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "userName":
        comparison = a.userName.localeCompare(b.userName);
        break;
      case "plan":
        comparison = a.plan.localeCompare(b.plan);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "startDate":
        comparison =
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        break;
      case "endDate":
        comparison =
          new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        break;
      case "amount":
        comparison = a.amount - b.amount;
        break;
      default:
        comparison =
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Toggle sort order
  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Calculate statistics
  const totalActiveSubscriptions = subscriptions.filter(
    (sub) => sub.status === "active"
  ).length;
  const totalRevenue = subscriptions.reduce(
    (sum, sub) => sum + (sub.status === "active" ? sub.amount : 0),
    0
  );
  const averageSubscriptionValue =
    totalActiveSubscriptions > 0 ? totalRevenue / totalActiveSubscriptions : 0;

  // Handle edit subscription
  const handleEditSubscription = (subscription: (typeof subscriptions)[0]) => {
    setSelectedSubscription(subscription);
    setIsEditDialogOpen(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setUserTypeFilter("all");
    setPlanFilter("all");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gestion des Abonnements
          </h2>
          <p className="text-muted-foreground">
            Gérez les abonnements, les plans et les paiements des utilisateurs
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => setIsFilterDrawerOpen(true)}>
            <Filter className="mr-2 h-4 w-4" /> Filtres
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" /> Exporter en CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" /> Exporter en PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsNewPlanDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nouveau Plan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="subscriptions">
        <TabsList>
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Abonnements Actifs
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalActiveSubscriptions}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2.5% par rapport au mois dernier
                </p>
                <div className="mt-4 h-[60px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueData.slice(-6)}
                      margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorUv"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8884d8"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8884d8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorUv)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenu Mensuel
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +5.2% par rapport au mois dernier
                </p>
                <div className="mt-4 h-[60px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueData.slice(-6)}
                      margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorPv"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#82ca9d"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#82ca9d"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#82ca9d"
                        fillOpacity={1}
                        fill="url(#colorPv)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Valeur Moyenne
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(averageSubscriptionValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +1.8% par rapport au mois dernier
                </p>
                <div className="mt-4 h-[60px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueData.slice(-6)}
                      margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRv"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#ffc658"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#ffc658"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#ffc658"
                        fillOpacity={1}
                        fill="url(#colorRv)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher par nom, email ou ID..."
                  className="pl-8 md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Filter className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Filtres</span>
                    {(statusFilter !== "all" ||
                      userTypeFilter !== "all" ||
                      planFilter !== "all") && (
                      <Badge
                        variant="secondary"
                        className="ml-1 rounded-sm px-1 font-normal lg:hidden"
                      >
                        {(statusFilter !== "all" ? 1 : 0) +
                          (userTypeFilter !== "all" ? 1 : 0) +
                          (planFilter !== "all" ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    {statusFilter === "all" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Tous les statuts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                    {statusFilter === "active" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Actif
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    {statusFilter === "pending" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    En attente
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("cancelled")}
                  >
                    {statusFilter === "cancelled" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Annulé
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("expired")}>
                    {statusFilter === "expired" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Expiré
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("trial")}>
                    {statusFilter === "trial" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Essai
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>
                    Filtrer par type d&apos;utilisateur
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setUserTypeFilter("all")}>
                    {userTypeFilter === "all" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Tous les types
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setUserTypeFilter("patient")}
                  >
                    {userTypeFilter === "patient" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Patient
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setUserTypeFilter("doctor")}>
                    {userTypeFilter === "doctor" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Médecin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setUserTypeFilter("hospital")}
                  >
                    {userTypeFilter === "hospital" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Hôpital
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filtrer par plan</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setPlanFilter("all")}>
                    {planFilter === "all" && <Check className="mr-2 h-4 w-4" />}
                    Tous les plans
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlanFilter("basic")}>
                    {planFilter === "basic" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Basic
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlanFilter("premium")}>
                    {planFilter === "premium" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Premium
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setPlanFilter("professional")}
                  >
                    {planFilter === "professional" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Professional
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlanFilter("enterprise")}>
                    {planFilter === "enterprise" && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Enterprise
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearFilters}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réinitialiser les filtres
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                {filteredSubscriptions.length} résultat
                {filteredSubscriptions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => toggleSort("userName")}
                    >
                      Utilisateur
                      {sortBy === "userName" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortOrder === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => toggleSort("plan")}
                    >
                      Plan
                      {sortBy === "plan" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortOrder === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => toggleSort("status")}
                    >
                      Statut
                      {sortBy === "status" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortOrder === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => toggleSort("startDate")}
                    >
                      Date de début
                      {sortBy === "startDate" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortOrder === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => toggleSort("endDate")}
                    >
                      Date de fin
                      {sortBy === "endDate" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortOrder === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <Button
                      variant="ghost"
                      className="p-0 font-medium"
                      onClick={() => toggleSort("amount")}
                    >
                      Montant
                      {sortBy === "amount" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortOrder === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Aucun abonnement trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={subscription.userAvatar}
                              alt={subscription.userName}
                            />
                            <AvatarFallback>
                              {subscription.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {subscription.userName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {subscription.userEmail}
                            </span>
                            <div className="mt-1">
                              {getUserTypeBadge(subscription.userType)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium capitalize">
                          {subscription.plan}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {subscription.billingCycle || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(subscription.status)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(subscription.startDate)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(subscription.endDate)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          {getPaymentMethodIcon(subscription.paymentMethod)}
                          <span className="ml-2">
                            {formatCurrency(subscription.amount)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleEditSubscription(subscription)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Modifier</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              <span>Renouveler</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="mr-2 h-4 w-4" />
                              <span>Historique de paiement</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Annuler l&apos;abonnement</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.id}
                className={plan.isPopular ? "border-primary" : ""}
              >
                {plan.isPopular && (
                  <div className="absolute right-4 top-4">
                    <Badge>Populaire</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-3xl font-bold">
                      {formatCurrency(plan.monthlyPrice)}
                    </span>
                    <span className="text-muted-foreground"> /mois</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium">
                      {formatCurrency(plan.yearlyPrice)}
                    </span>
                    <span className="text-muted-foreground"> /an</span>
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-100 text-green-800"
                    >
                      Économisez{" "}
                      {Math.round(
                        (1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100
                      )}
                      %
                    </Badge>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-2 text-sm font-medium">
                      Fonctionnalités
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Badge variant="outline">
                      {plan.userType === "patient"
                        ? "Patients"
                        : plan.userType === "doctor"
                        ? "Médecins"
                        : "Hôpitaux"}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button className="w-full" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  <Button className="w-full" variant="ghost">
                    <Trash className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenus Mensuels</CardTitle>
                <CardDescription>
                  Évolution des revenus sur les 12 derniers mois
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value as number),
                        "Revenu",
                      ]}
                    />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenu" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Distribution des Abonnements</CardTitle>
                <CardDescription>
                  Répartition des abonnements par plan
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subscriptionDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {subscriptionDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Taux de Conversion et Rétention</CardTitle>
              <CardDescription>
                Analyse des conversions d&apos;essai et de la rétention des
                abonnés
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    name="Taux de conversion (%)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#82ca9d"
                    name="Taux de rétention (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Subscription Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;abonnement</DialogTitle>
            <DialogDescription>
              Modifiez les détails de l&apos;abonnement de{" "}
              {selectedSubscription?.userName}
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan</Label>
                  <Select defaultValue={selectedSubscription.plan}>
                    <SelectTrigger id="plan">
                      <SelectValue placeholder="Sélectionner un plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select defaultValue={selectedSubscription.status}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                      <SelectItem value="expired">Expiré</SelectItem>
                      <SelectItem value="trial">Essai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    defaultValue={selectedSubscription.startDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    defaultValue={selectedSubscription.endDate}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingCycle">Cycle de facturation</Label>
                  <Select
                    defaultValue={selectedSubscription.billingCycle || ""}
                  >
                    <SelectTrigger id="billingCycle">
                      <SelectValue placeholder="Sélectionner un cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="biannual">Semestriel</SelectItem>
                      <SelectItem value="yearly">Annuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    defaultValue={selectedSubscription.amount}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoRenew"
                    defaultChecked={selectedSubscription.autoRenew}
                  />
                  <Label htmlFor="autoRenew">Renouvellement automatique</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Plan Dialog */}
      <Dialog open={isNewPlanDialogOpen} onOpenChange={setIsNewPlanDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer un nouveau plan d&apos;abonnement</DialogTitle>
            <DialogDescription>
              Définissez les détails du nouveau plan d&apos;abonnement
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Nom du plan</Label>
                <Input id="planName" placeholder="Ex: Premium Plus" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userType">Type d&apos;utilisateur</Label>
                <Select>
                  <SelectTrigger id="userType">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="doctor">Médecin</SelectItem>
                    <SelectItem value="hospital">Hôpital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Description du plan" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Prix mensuel (€)</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 19.99"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearlyPrice">Prix annuel (€)</Label>
                <Input
                  id="yearlyPrice"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 199.99"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fonctionnalités</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="feature1" />
                  <Label htmlFor="feature1">
                    Prise de rendez-vous en ligne
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="feature2" />
                  <Label htmlFor="feature2">Historique médical</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="feature3" />
                  <Label htmlFor="feature3">Téléconsultations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="feature4" />
                  <Label htmlFor="feature4">Messagerie avec les médecins</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="feature5" />
                  <Label htmlFor="feature5">
                    Partage de documents médicaux
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="feature6" />
                  <Label htmlFor="feature6">Support prioritaire</Label>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isPopular" />
              <Label htmlFor="isPopular">Marquer comme populaire</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewPlanDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={() => setIsNewPlanDialogOpen(false)}>
              Créer le plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Drawer for Mobile */}
      <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filtres</DrawerTitle>
            <DrawerDescription>
              Affinez votre recherche d&apos;abonnements
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile-search">Recherche</Label>
              <Input
                id="mobile-search"
                placeholder="Rechercher par nom, email ou ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile-status">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="mobile-status">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="trial">Essai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile-userType">Type d&apos;utilisateur</Label>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger id="mobile-userType">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Médecin</SelectItem>
                  <SelectItem value="hospital">Hôpital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile-plan">Plan</Label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger id="mobile-plan">
                  <SelectValue placeholder="Tous les plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={() => setIsFilterDrawerOpen(false)}>
              Appliquer les filtres
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Réinitialiser les filtres
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
