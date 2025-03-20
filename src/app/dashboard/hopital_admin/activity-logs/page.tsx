"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  AlertCircle,
  ArrowDownToLine,
  Calendar,
  Check,
  Download,
  Eye,
  Info,
  Loader2,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash,
  User,
  UserPlus,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types for activity logs
type LogLevel = "info" | "warning" | "error" | "success";
type UserType = "admin" | "doctor" | "patient" | "hospital" | "system";
type ActionType =
  | "login"
  | "logout"
  | "create"
  | "update"
  | "delete"
  | "view"
  | "export"
  | "import"
  | "register"
  | "verify"
  | "payment"
  | "subscription"
  | "system";

interface ActivityLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userType: UserType;
  userAvatar?: string;
  actionType: ActionType;
  actionDescription: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  level: LogLevel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

// Sample data for activity logs
const generateSampleLogs = (count: number): ActivityLog[] => {
  const actionTypes: ActionType[] = [
    "login",
    "logout",
    "create",
    "update",
    "delete",
    "view",
    "export",
    "import",
    "register",
    "verify",
    "payment",
    "subscription",
    "system",
  ];

  const userTypes: UserType[] = [
    "admin",
    "doctor",
    "patient",
    "hospital",
    "system",
  ];

  const resourceTypes = [
    "user",
    "patient",
    "doctor",
    "hospital",
    "appointment",
    "prescription",
    "medical_record",
    "payment",
    "subscription",
    "system",
    "content",
    "settings",
  ];

  const levels: LogLevel[] = ["info", "warning", "error", "success"];

  const adminNames = [
    "Jean Dupont",
    "Marie Laurent",
    "Thomas Bernard",
    "Sophie Martin",
    "Philippe Dubois",
  ];
  const doctorNames = [
    "Dr. Pierre Lefèvre",
    "Dr. Claire Moreau",
    "Dr. Antoine Rousseau",
    "Dr. Émilie Blanc",
    "Dr. Nicolas Petit",
  ];
  const patientNames = [
    "Lucas Girard",
    "Emma Leroy",
    "Hugo Fournier",
    "Chloé Mercier",
    "Léo Bonnet",
  ];
  const hospitalNames = [
    "Hôpital Saint-Louis",
    "Clinique des Champs-Élysées",
    "Centre Médical Montparnasse",
    "Hôpital Necker",
    "Hôpital Cochin",
  ];

  const getRandomElement = <T,>(array: T[]): T =>
    array[Math.floor(Math.random() * array.length)];

  const getNameByUserType = (userType: UserType): string => {
    switch (userType) {
      case "admin":
        return getRandomElement(adminNames);
      case "doctor":
        return getRandomElement(doctorNames);
      case "patient":
        return getRandomElement(patientNames);
      case "hospital":
        return getRandomElement(hospitalNames);
      case "system":
        return "Système";
    }
  };

  const getActionDescription = (
    actionType: ActionType,
    resourceType: string,
    userName: string
  ): string => {
    switch (actionType) {
      case "login":
        return `Connexion de ${userName}`;
      case "logout":
        return `Déconnexion de ${userName}`;
      case "create":
        return `Création d'un(e) ${resourceType}`;
      case "update":
        return `Mise à jour d'un(e) ${resourceType}`;
      case "delete":
        return `Suppression d'un(e) ${resourceType}`;
      case "view":
        return `Consultation d'un(e) ${resourceType}`;
      case "export":
        return `Exportation de données ${resourceType}`;
      case "import":
        return `Importation de données ${resourceType}`;
      case "register":
        return `Inscription d'un(e) nouveau/nouvelle ${resourceType}`;
      case "verify":
        return `Vérification d'un(e) ${resourceType}`;
      case "payment":
        return `Paiement effectué pour ${resourceType}`;
      case "subscription":
        return `Modification d'abonnement pour ${resourceType}`;
      case "system":
        return `Opération système sur ${resourceType}`;
    }
  };

  const getLevelByActionType = (actionType: ActionType): LogLevel => {
    switch (actionType) {
      case "delete":
        return Math.random() > 0.7 ? "warning" : "info";
      case "login":
        return Math.random() > 0.9 ? "error" : "success";
      case "payment":
        return Math.random() > 0.9 ? "error" : "success";
      case "system":
        return Math.random() > 0.8 ? "warning" : "info";
      default:
        return getRandomElement(levels);
    }
  };

  return Array.from({ length: count }, (_, i) => {
    const userType = getRandomElement(userTypes);
    const userName = getNameByUserType(userType);
    const actionType = getRandomElement(actionTypes);
    const resourceType = getRandomElement(resourceTypes);
    const level = getLevelByActionType(actionType);

    return {
      id: `log-${i}`,
      timestamp: subDays(new Date(), Math.floor(Math.random() * 30)),
      userId: `user-${Math.floor(Math.random() * 1000)}`,
      userName,
      userType,
      userAvatar:
        userType !== "system"
          ? `/placeholder.svg?height=32&width=32`
          : undefined,
      actionType,
      actionDescription: getActionDescription(
        actionType,
        resourceType,
        userName
      ),
      resourceType,
      resourceId: `${resourceType}-${Math.floor(Math.random() * 1000)}`,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}`,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      level,
      metadata: {
        browser: "Chrome",
        os: "Windows",
        device: "Desktop",
        duration: Math.floor(Math.random() * 1000),
        details: "Détails supplémentaires sur cette action",
      },
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by timestamp descending
};

const activityLogs = generateSampleLogs(100);

// Helper function to get badge variant based on log level
const getLevelBadgeVariant = (level: LogLevel) => {
  switch (level) {
    case "info":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "warning":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case "error":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "success":
      return "bg-green-100 text-green-800 hover:bg-green-100";
  }
};

// Helper function to get icon based on action type
const getActionIcon = (actionType: ActionType) => {
  switch (actionType) {
    case "login":
      return <User className="h-4 w-4" />;
    case "logout":
      return <X className="h-4 w-4" />;
    case "create":
      return <UserPlus className="h-4 w-4" />;
    case "update":
      return <RefreshCw className="h-4 w-4" />;
    case "delete":
      return <Trash className="h-4 w-4" />;
    case "view":
      return <Eye className="h-4 w-4" />;
    case "export":
      return <ArrowDownToLine className="h-4 w-4" />;
    case "import":
      return <Download className="h-4 w-4" />;
    case "register":
      return <UserPlus className="h-4 w-4" />;
    case "verify":
      return <Check className="h-4 w-4" />;
    case "payment":
      return <Activity className="h-4 w-4" />;
    case "subscription":
      return <Activity className="h-4 w-4" />;
    case "system":
      return <Settings className="h-4 w-4" />;
  }
};

// Helper function to get icon based on user type
const getUserTypeIcon = (userType: UserType) => {
  switch (userType) {
    case "admin":
      return <Shield className="h-4 w-4" />;
    case "doctor":
      return <User className="h-4 w-4" />;
    case "patient":
      return <User className="h-4 w-4" />;
    case "hospital":
      return <Activity className="h-4 w-4" />;
    case "system":
      return <Settings className="h-4 w-4" />;
  }
};

// Helper function to format date
const formatDate = (date: Date) => {
  return format(date, "dd MMM yyyy, HH:mm:ss", { locale: fr });
};

export default function ActivityLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserTypes, setSelectedUserTypes] = useState<UserType[]>([]);
  const [selectedActionTypes, setSelectedActionTypes] = useState<ActionType[]>(
    []
  );
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportDateRange, setExportDateRange] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  // Filter logs based on search, user types, action types, levels, and date range
  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);

    const matchesUserTypes =
      selectedUserTypes.length === 0 ||
      selectedUserTypes.includes(log.userType);
    const matchesActionTypes =
      selectedActionTypes.length === 0 ||
      selectedActionTypes.includes(log.actionType);
    const matchesLevels =
      selectedLevels.length === 0 || selectedLevels.includes(log.level);

    const matchesDateRange =
      (!dateRange.from || log.timestamp >= dateRange.from) &&
      (!dateRange.to || log.timestamp <= dateRange.to);

    return (
      matchesSearch &&
      matchesUserTypes &&
      matchesActionTypes &&
      matchesLevels &&
      matchesDateRange
    );
  });

  // Open log detail dialog
  const openLogDetail = (log: ActivityLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  // Toggle user type selection
  const toggleUserType = (userType: UserType) => {
    if (selectedUserTypes.includes(userType)) {
      setSelectedUserTypes(
        selectedUserTypes.filter((type) => type !== userType)
      );
    } else {
      setSelectedUserTypes([...selectedUserTypes, userType]);
    }
  };

  // Toggle action type selection
  const toggleActionType = (actionType: ActionType) => {
    if (selectedActionTypes.includes(actionType)) {
      setSelectedActionTypes(
        selectedActionTypes.filter((type) => type !== actionType)
      );
    } else {
      setSelectedActionTypes([...selectedActionTypes, actionType]);
    }
  };

  // Toggle level selection
  const toggleLevel = (level: LogLevel) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter((l) => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedUserTypes([]);
    setSelectedActionTypes([]);
    setSelectedLevels([]);
    setDateRange({
      from: subDays(new Date(), 7),
      to: new Date(),
    });
  };

  // Handle export
  const handleExport = () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      setIsExportDialogOpen(false);
      // In a real app, this would trigger a download
    }, 2000);
  };

  // Get statistics
  const getStatistics = () => {
    const totalLogs = filteredLogs.length;
    const errorLogs = filteredLogs.filter(
      (log) => log.level === "error"
    ).length;
    const warningLogs = filteredLogs.filter(
      (log) => log.level === "warning"
    ).length;
    const infoLogs = filteredLogs.filter((log) => log.level === "info").length;
    const successLogs = filteredLogs.filter(
      (log) => log.level === "success"
    ).length;

    return {
      totalLogs,
      errorLogs,
      warningLogs,
      infoLogs,
      successLogs,
    };
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Logs d&apos;activité
          </h2>
          <p className="text-muted-foreground">
            Consultez et analysez toutes les activités du système
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
          <Button
            variant={isLiveMode ? "default" : "outline"}
            onClick={() => setIsLiveMode(!isLiveMode)}
          >
            {isLiveMode ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mode temps
                réel
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" /> Activer temps réel
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Utilisateur, action, IP..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Période</label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {dateRange.from ? (
                          format(dateRange.from, "dd/MM/yyyy")
                        ) : (
                          <span>Début</span>
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
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {dateRange.to ? (
                          format(dateRange.to, "dd/MM/yyyy")
                        ) : (
                          <span>Fin</span>
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type d&apos;utilisateur
                </label>
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="user-type-admin"
                      checked={selectedUserTypes.includes("admin")}
                      onCheckedChange={() => toggleUserType("admin")}
                    />
                    <label
                      htmlFor="user-type-admin"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Administrateur
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="user-type-doctor"
                      checked={selectedUserTypes.includes("doctor")}
                      onCheckedChange={() => toggleUserType("doctor")}
                    />
                    <label
                      htmlFor="user-type-doctor"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Médecin
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="user-type-patient"
                      checked={selectedUserTypes.includes("patient")}
                      onCheckedChange={() => toggleUserType("patient")}
                    />
                    <label
                      htmlFor="user-type-patient"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Patient
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="user-type-hospital"
                      checked={selectedUserTypes.includes("hospital")}
                      onCheckedChange={() => toggleUserType("hospital")}
                    />
                    <label
                      htmlFor="user-type-hospital"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Hôpital
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="user-type-system"
                      checked={selectedUserTypes.includes("system")}
                      onCheckedChange={() => toggleUserType("system")}
                    />
                    <label
                      htmlFor="user-type-system"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Système
                    </label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type d&apos;action
                </label>
                <ScrollArea className="h-[150px] pr-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-type-login"
                        checked={selectedActionTypes.includes("login")}
                        onCheckedChange={() => toggleActionType("login")}
                      />
                      <label
                        htmlFor="action-type-login"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Connexion
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-type-logout"
                        checked={selectedActionTypes.includes("logout")}
                        onCheckedChange={() => toggleActionType("logout")}
                      />
                      <label
                        htmlFor="action-type-logout"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Déconnexion
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-type-create"
                        checked={selectedActionTypes.includes("create")}
                        onCheckedChange={() => toggleActionType("create")}
                      />
                      <label
                        htmlFor="action-type-create"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Création
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-type-update"
                        checked={selectedActionTypes.includes("update")}
                        onCheckedChange={() => toggleActionType("update")}
                      />
                      <label
                        htmlFor="action-type-update"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Mise à jour
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-type-delete"
                        checked={selectedActionTypes.includes("delete")}
                        onCheckedChange={() => toggleActionType("delete")}
                      />
                      <label
                        htmlFor="action-type-delete"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Suppression
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-type-view"
                        checked={selectedActionTypes.includes("view")}
                        onCheckedChange={() => toggleActionType("view")}
                      />
                      <label
                        htmlFor="action-type-view"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Consultation
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-type-export"
                        checked={selectedActionTypes.includes("export")}
                        onCheckedChange={() => toggleActionType("export")}
                      />
                      <label
                        htmlFor="action-type-export"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Exportation
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-type-import"
                        checked={selectedActionTypes.includes("import")}
                        onCheckedChange={() => toggleActionType("import")}
                      />
                      <label
                        htmlFor="action-type-import"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Importation
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-type-register"
                        checked={selectedActionTypes.includes("register")}
                        onCheckedChange={() => toggleActionType("register")}
                      />
                      <label
                        htmlFor="action-type-register"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Inscription
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-type-verify"
                        checked={selectedActionTypes.includes("verify")}
                        onCheckedChange={() => toggleActionType("verify")}
                      />
                      <label
                        htmlFor="action-type-verify"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Vérification
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-type-payment"
                        checked={selectedActionTypes.includes("payment")}
                        onCheckedChange={() => toggleActionType("payment")}
                      />
                      <label
                        htmlFor="action-type-payment"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Paiement
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-type-subscription"
                        checked={selectedActionTypes.includes("subscription")}
                        onCheckedChange={() => toggleActionType("subscription")}
                      />
                      <label
                        htmlFor="action-type-subscription"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Abonnement
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="action-type-system"
                        checked={selectedActionTypes.includes("system")}
                        onCheckedChange={() => toggleActionType("system")}
                      />
                      <label
                        htmlFor="action-type-system"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Système
                      </label>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Niveau</label>
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="level-info"
                      checked={selectedLevels.includes("info")}
                      onCheckedChange={() => toggleLevel("info")}
                    />
                    <label
                      htmlFor="level-info"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Information
                    </label>
                    <Badge className={getLevelBadgeVariant("info")}>Info</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="level-warning"
                      checked={selectedLevels.includes("warning")}
                      onCheckedChange={() => toggleLevel("warning")}
                    />
                    <label
                      htmlFor="level-warning"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Avertissement
                    </label>
                    <Badge className={getLevelBadgeVariant("warning")}>
                      Warning
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="level-error"
                      checked={selectedLevels.includes("error")}
                      onCheckedChange={() => toggleLevel("error")}
                    />
                    <label
                      htmlFor="level-error"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Erreur
                    </label>
                    <Badge className={getLevelBadgeVariant("error")}>
                      Error
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="level-success"
                      checked={selectedLevels.includes("success")}
                      onCheckedChange={() => toggleLevel("success")}
                    />
                    <label
                      htmlFor="level-success"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Succès
                    </label>
                    <Badge className={getLevelBadgeVariant("success")}>
                      Success
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total des logs</span>
                <span className="font-medium">{stats.totalLogs}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Par niveau</span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                      <span>Succès</span>
                    </div>
                    <span>{stats.successLogs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                      <span>Information</span>
                    </div>
                    <span>{stats.infoLogs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-amber-500" />
                      <span>Avertissement</span>
                    </div>
                    <span>{stats.warningLogs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                      <span>Erreur</span>
                    </div>
                    <span>{stats.errorLogs}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="flex-1">
                <CardTitle>Logs d&apos;activité</CardTitle>
                <CardDescription>
                  {filteredLogs.length} log
                  {filteredLogs.length !== 1 ? "s" : ""} trouvé
                  {filteredLogs.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="50" onValueChange={() => {}}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="50" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">Aucun log trouvé</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Essayez de modifier vos critères de recherche.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.slice(0, 50).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start rounded-lg border p-3 transition-all hover:bg-accent cursor-pointer"
                      onClick={() => openLogDetail(log)}
                    >
                      <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        {getUserTypeIcon(log.userType)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium">
                              {log.userName}
                            </p>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {log.userType}
                            </Badge>
                          </div>
                          <div className="flex items-center">
                            <Badge
                              className={`mr-2 ${getLevelBadgeVariant(
                                log.level
                              )}`}
                            >
                              {log.level}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(log.timestamp)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                            {getActionIcon(log.actionType)}
                          </div>
                          <span>{log.actionDescription}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <span>Ressource: {log.resourceType}</span>
                            <span className="mx-2">•</span>
                            <span>IP: {log.ipAddress}</span>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                >
                                  <Info className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Cliquez pour voir les détails</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t px-6 py-3">
              <div className="text-xs text-muted-foreground">
                Affichage de {Math.min(filteredLogs.length, 50)} sur{" "}
                {filteredLogs.length} logs
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filteredLogs.length <= 50}
                >
                  Suivant
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Log Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          {selectedLog && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Détails du log</DialogTitle>
                  <Badge className={getLevelBadgeVariant(selectedLog.level)}>
                    {selectedLog.level}
                  </Badge>
                </div>
                <DialogDescription>
                  ID: {selectedLog.id} • {formatDate(selectedLog.timestamp)}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-4">
                  {selectedLog.userAvatar ? (
                    <Avatar>
                      <AvatarImage
                        src={selectedLog.userAvatar}
                        alt={selectedLog.userName}
                      />
                      <AvatarFallback>
                        {selectedLog.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {getUserTypeIcon(selectedLog.userType)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{selectedLog.userName}</p>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {selectedLog.userType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ID: {selectedLog.userId}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Action</h4>
                  <div className="rounded-md border p-3">
                    <div className="flex items-center">
                      <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                        {getActionIcon(selectedLog.actionType)}
                      </div>
                      <span className="font-medium">
                        {selectedLog.actionType}
                      </span>
                    </div>
                    <p className="mt-2">{selectedLog.actionDescription}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Ressource</h4>
                    <div className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Type</span>
                        <span>{selectedLog.resourceType}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-medium">ID</span>
                        <span>{selectedLog.resourceId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">
                      Informations système
                    </h4>
                    <div className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Adresse IP</span>
                        <span>{selectedLog.ipAddress}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-medium">Navigateur</span>
                        <span>{selectedLog.metadata?.browser}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-medium">Système</span>
                        <span>{selectedLog.metadata?.os}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-medium">Appareil</span>
                        <span>{selectedLog.metadata?.device}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    Métadonnées supplémentaires
                  </h4>
                  <div className="rounded-md border p-3 bg-muted/50">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Fermer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exporter les logs</DialogTitle>
            <DialogDescription>
              Choisissez le format et la période pour l&apos;exportation des
              logs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Sélectionnez un format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-date-range">Période</Label>
              <Select
                value={exportDateRange}
                onValueChange={setExportDateRange}
              >
                <SelectTrigger id="export-date-range">
                  <SelectValue placeholder="Sélectionnez une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les logs</SelectItem>
                  <SelectItem value="filtered">
                    Logs filtrés actuellement
                  </SelectItem>
                  <SelectItem value="today">Aujourd&apos;hui</SelectItem>
                  <SelectItem value="yesterday">Hier</SelectItem>
                  <SelectItem value="week">7 derniers jours</SelectItem>
                  <SelectItem value="month">30 derniers jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Exportation...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Exporter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
