"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowDownToLine,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Database,
  FileText,
  Filter,
  Info,
  RefreshCcw,
  Search,
  Server,
  Shield,
  Trash2,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample log data
const logs = [
  {
    id: "log-001",
    timestamp: new Date("2025-03-09T08:12:34"),
    level: "error",
    source: "auth",
    message: "Failed login attempt for user admin@example.com",
    ip: "192.168.1.105",
    user: "admin@example.com",
    details:
      "Multiple failed attempts detected from this IP address. Possible brute force attack.",
    metadata: {
      browser: "Chrome 120.0.0",
      os: "Windows 11",
      location: "Paris, France",
      attempts: 5,
    },
  },
  {
    id: "log-002",
    timestamp: new Date("2025-03-09T08:10:22"),
    level: "info",
    source: "user",
    message: "User profile updated",
    ip: "192.168.1.42",
    user: "doctor.martin@example.com",
    details:
      "User updated profile information including contact details and specialties.",
    metadata: {
      browser: "Firefox 115.0",
      os: "macOS 14.2",
      location: "Lyon, France",
      fields: ["phone", "address", "specialties"],
    },
  },
  {
    id: "log-003",
    timestamp: new Date("2025-03-09T08:05:17"),
    level: "warning",
    source: "database",
    message: "Database query timeout",
    ip: "10.0.0.5",
    user: "system",
    details:
      "Query to patients table timed out after 30 seconds. Query optimizations may be needed.",
    metadata: {
      query:
        "SELECT * FROM patients WHERE last_visit > '2024-01-01' AND insurance_provider = 'MGEN'",
      execution_time: "30.2s",
      table: "patients",
      server: "db-prod-3",
    },
  },
  {
    id: "log-004",
    timestamp: new Date("2025-03-09T08:01:45"),
    level: "info",
    source: "appointment",
    message: "New appointment created",
    ip: "192.168.1.87",
    user: "patient.dupont@example.com",
    details:
      "Patient scheduled a new appointment with Dr. Martin for March 15, 2025.",
    metadata: {
      appointment_id: "apt-28764",
      doctor_id: "doc-156",
      patient_id: "pat-4532",
      date: "2025-03-15T14:30:00",
    },
  },
  {
    id: "log-005",
    timestamp: new Date("2025-03-09T07:58:12"),
    level: "error",
    source: "payment",
    message: "Payment processing failed",
    ip: "192.168.1.92",
    user: "patient.moreau@example.com",
    details:
      "Credit card payment for subscription upgrade failed due to insufficient funds.",
    metadata: {
      transaction_id: "tx-98765",
      amount: "49.99",
      currency: "EUR",
      payment_method: "credit_card",
      error_code: "insufficient_funds",
    },
  },
  {
    id: "log-006",
    timestamp: new Date("2025-03-09T07:55:30"),
    level: "info",
    source: "auth",
    message: "User logged in",
    ip: "192.168.1.110",
    user: "hospital.admin@saint-louis.org",
    details: "Hospital administrator logged in successfully.",
    metadata: {
      browser: "Safari 17.2",
      os: "iOS 18.1",
      location: "Paris, France",
      account_type: "hospital_admin",
    },
  },
  {
    id: "log-007",
    timestamp: new Date("2025-03-09T07:50:18"),
    level: "warning",
    source: "api",
    message: "API rate limit approaching",
    ip: "192.168.1.200",
    user: "api_client_12",
    details:
      "Client is approaching the API rate limit of 1000 requests per hour (currently at 850).",
    metadata: {
      client_id: "api_client_12",
      endpoint: "/api/v1/doctors/search",
      current_usage: 850,
      limit: 1000,
      period: "1 hour",
    },
  },
  {
    id: "log-008",
    timestamp: new Date("2025-03-09T07:45:55"),
    level: "info",
    source: "system",
    message: "System backup completed",
    ip: "10.0.0.1",
    user: "system",
    details: "Daily system backup completed successfully in 15 minutes.",
    metadata: {
      backup_id: "bkp-20250309",
      size: "4.2 GB",
      duration: "15m 22s",
      files_backed_up: 28945,
      storage_location: "aws-s3-eu-west-3",
    },
  },
  {
    id: "log-009",
    timestamp: new Date("2025-03-09T07:40:33"),
    level: "critical",
    source: "server",
    message: "Server CPU usage critical",
    ip: "10.0.0.2",
    user: "system",
    details:
      "Server web-prod-2 CPU usage exceeded 95% for more than 5 minutes.",
    metadata: {
      server: "web-prod-2",
      cpu_usage: "97.5%",
      memory_usage: "86.2%",
      duration: "5m 12s",
      processes: ["nginx", "php-fpm", "mysql"],
    },
  },
  {
    id: "log-010",
    timestamp: new Date("2025-03-09T07:35:21"),
    level: "info",
    source: "content",
    message: "New blog article published",
    ip: "192.168.1.42",
    user: "content.editor@example.com",
    details:
      "New article 'Les avancées en télémédecine en 2025' published to the blog.",
    metadata: {
      article_id: "blog-567",
      category: "Télémédecine",
      author: "Dr. Sophie Martin",
      status: "published",
    },
  },
  {
    id: "log-011",
    timestamp: new Date("2025-03-09T07:30:10"),
    level: "warning",
    source: "security",
    message: "Multiple password reset requests",
    ip: "192.168.1.115",
    user: "patient.dubois@example.com",
    details: "User requested password reset 3 times in the last hour.",
    metadata: {
      request_count: 3,
      time_period: "1 hour",
      last_successful_login: "2025-03-05T14:22:45",
    },
  },
  {
    id: "log-012",
    timestamp: new Date("2025-03-09T07:25:48"),
    level: "error",
    source: "notification",
    message: "Failed to send email notifications",
    ip: "10.0.0.3",
    user: "system",
    details:
      "Batch email sending failed due to SMTP server connection timeout.",
    metadata: {
      batch_id: "email-batch-4532",
      recipients: 156,
      template: "appointment_reminder",
      smtp_server: "smtp.example.com",
      error: "connection_timeout",
    },
  },
  {
    id: "log-013",
    timestamp: new Date("2025-03-09T07:20:36"),
    level: "info",
    source: "subscription",
    message: "User upgraded subscription",
    ip: "192.168.1.78",
    user: "doctor.petit@example.com",
    details: "Doctor upgraded from Basic to Premium subscription plan.",
    metadata: {
      old_plan: "Basic",
      new_plan: "Premium",
      price: "99.99",
      currency: "EUR",
      billing_cycle: "monthly",
      payment_method: "credit_card",
    },
  },
  {
    id: "log-014",
    timestamp: new Date("2025-03-09T07:15:22"),
    level: "warning",
    source: "database",
    message: "Database disk space low",
    ip: "10.0.0.5",
    user: "system",
    details: "Database server is running low on disk space (85% used).",
    metadata: {
      server: "db-prod-3",
      total_space: "1 TB",
      used_space: "850 GB",
      available_space: "150 GB",
      threshold: "85%",
    },
  },
  {
    id: "log-015",
    timestamp: new Date("2025-03-09T07:10:15"),
    level: "info",
    source: "verification",
    message: "Doctor verification approved",
    ip: "192.168.1.42",
    user: "admin@example.com",
    details: "Administrator approved verification request for Dr. Laurent.",
    metadata: {
      doctor_id: "doc-789",
      verification_id: "ver-456",
      documents_verified: ["medical_license", "id_card", "diploma"],
      verification_date: "2025-03-09T07:10:15",
    },
  },
];

// Helper function to get badge color based on log level
const getLevelBadge = (level: string) => {
  switch (level) {
    case "info":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 hover:bg-blue-50"
        >
          Info
        </Badge>
      );
    case "warning":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
        >
          Warning
        </Badge>
      );
    case "error":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 hover:bg-red-50"
        >
          Error
        </Badge>
      );
    case "critical":
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 hover:bg-red-100 font-bold"
        >
          Critical
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

// Helper function to get icon based on log source
const getSourceIcon = (source: string) => {
  switch (source) {
    case "auth":
      return <Shield className="h-4 w-4 text-blue-500" />;
    case "user":
      return <User className="h-4 w-4 text-green-500" />;
    case "database":
      return <Database className="h-4 w-4 text-purple-500" />;
    case "appointment":
      return <Calendar className="h-4 w-4 text-indigo-500" />;
    case "payment":
      return <FileText className="h-4 w-4 text-emerald-500" />;
    case "api":
      return <Server className="h-4 w-4 text-amber-500" />;
    case "system":
      return <Server className="h-4 w-4 text-gray-500" />;
    case "server":
      return <Server className="h-4 w-4 text-red-500" />;
    case "content":
      return <FileText className="h-4 w-4 text-teal-500" />;
    case "security":
      return <Shield className="h-4 w-4 text-red-500" />;
    case "notification":
      return <Info className="h-4 w-4 text-blue-500" />;
    case "subscription":
      return <FileText className="h-4 w-4 text-green-500" />;
    case "verification":
      return <Check className="h-4 w-4 text-green-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

export default function SystemLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<(typeof logs)[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const itemsPerPage = 10;

  // Get unique log levels and sources for filters
  const logLevels = Array.from(new Set(logs.map((log) => log.level)));
  const logSources = Array.from(new Set(logs.map((log) => log.source)));

  // Filter logs based on search, levels, sources, and date range
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevels =
      selectedLevels.length === 0 || selectedLevels.includes(log.level);

    const matchesSources =
      selectedSources.length === 0 || selectedSources.includes(log.source);

    const matchesDateRange =
      (dateRange.start === "" ||
        new Date(log.timestamp) >= new Date(dateRange.start)) &&
      (dateRange.end === "" ||
        new Date(log.timestamp) <= new Date(dateRange.end));

    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "errors" &&
        (log.level === "error" || log.level === "critical")) ||
      (selectedTab === "warnings" && log.level === "warning") ||
      (selectedTab === "info" && log.level === "info") ||
      (selectedTab === "system" &&
        (log.source === "system" ||
          log.source === "server" ||
          log.source === "database"));

    return (
      matchesSearch &&
      matchesLevels &&
      matchesSources &&
      matchesDateRange &&
      matchesTab
    );
  });

  // Sort logs by timestamp (newest first)
  const sortedLogs = [...filteredLogs].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  // Paginate logs
  const paginatedLogs = sortedLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate total pages
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);

  // Toggle level selection
  const toggleLevel = (level: string) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter((l) => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  // Toggle source selection
  const toggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s) => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLevels([]);
    setSelectedSources([]);
    setDateRange({ start: "", end: "" });
  };

  // View log details
  const viewLogDetails = (log: (typeof logs)[0]) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  // Delete log (simulated)
  const deleteLog = () => {
    console.log("Deleting log:", selectedLog?.id);
    setIsDeleteDialogOpen(false);
    setIsDetailOpen(false);
  };

  // Export logs (simulated)
  const exportLogs = (format: string) => {
    console.log(`Exporting logs in ${format} format`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Logs Système</h2>
          <p className="text-muted-foreground">
            Consultez et analysez les logs système pour surveiller
            l&apos;activité et résoudre les problèmes
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => clearFilters()}>
            <Filter className="mr-2 h-4 w-4" /> Réinitialiser les filtres
          </Button>
          <Button variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" /> Actualiser
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <ArrowDownToLine className="mr-2 h-4 w-4" /> Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportLogs("csv")}>
                Exporter en CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportLogs("json")}>
                Exporter en JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportLogs("pdf")}>
                Exporter en PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <Label htmlFor="search">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Message, utilisateur, IP..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Période</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="date-start" className="text-xs">
                      Début
                    </Label>
                    <Input
                      id="date-start"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="date-end" className="text-xs">
                      Fin
                    </Label>
                    <Input
                      id="date-end"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Niveau de log</Label>
                <div className="space-y-1.5">
                  {logLevels.map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`level-${level}`}
                        checked={selectedLevels.includes(level)}
                        onCheckedChange={() => toggleLevel(level)}
                      />
                      <label
                        htmlFor={`level-${level}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                      >
                        {getLevelBadge(level)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Source</Label>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-1.5">
                    {logSources.map((source) => (
                      <div key={source} className="flex items-center space-x-2">
                        <Checkbox
                          id={`source-${source}`}
                          checked={selectedSources.includes(source)}
                          onCheckedChange={() => toggleSource(source)}
                        />
                        <label
                          htmlFor={`source-${source}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                        >
                          <span className="flex items-center">
                            {getSourceIcon(source)}
                            <span className="ml-2 capitalize">{source}</span>
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearFilters}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Total des logs</span>
                  <span className="font-medium">{logs.length}</span>
                </div>
                <Separator />
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                      Erreurs
                    </span>
                    <span>
                      {
                        logs.filter(
                          (log) =>
                            log.level === "error" || log.level === "critical"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                      Avertissements
                    </span>
                    <span>
                      {logs.filter((log) => log.level === "warning").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                      Informations
                    </span>
                    <span>
                      {logs.filter((log) => log.level === "info").length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">
                  Répartition par niveau
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden flex">
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${
                        (logs.filter(
                          (log) =>
                            log.level === "error" || log.level === "critical"
                        ).length /
                          logs.length) *
                        100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="h-full bg-yellow-500"
                    style={{
                      width: `${
                        (logs.filter((log) => log.level === "warning").length /
                          logs.length) *
                        100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${
                        (logs.filter((log) => log.level === "info").length /
                          logs.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Sources principales</div>
                <div className="space-y-1">
                  {logSources.slice(0, 5).map((source) => {
                    const count = logs.filter(
                      (log) => log.source === source
                    ).length;
                    const percentage = (count / logs.length) * 100;
                    return (
                      <div key={source} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="capitalize">{source}</span>
                          <span>
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-1" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Logs système</CardTitle>
              <Tabs
                defaultValue="all"
                className="w-full"
                onValueChange={setSelectedTab}
              >
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">Tous</TabsTrigger>
                  <TabsTrigger value="errors" className="text-red-500">
                    Erreurs
                  </TabsTrigger>
                  <TabsTrigger value="warnings" className="text-yellow-500">
                    Avertissements
                  </TabsTrigger>
                  <TabsTrigger value="info" className="text-blue-500">
                    Informations
                  </TabsTrigger>
                  <TabsTrigger value="system">Système</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Niveau</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-[150px]">Source</TableHead>
                      <TableHead className="w-[180px]">Horodatage</TableHead>
                      <TableHead className="w-[100px]">Utilisateur</TableHead>
                      <TableHead className="w-[80px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Aucun log trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedLogs.map((log) => (
                        <TableRow
                          key={log.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => viewLogDetails(log)}
                        >
                          <TableCell>{getLevelBadge(log.level)}</TableCell>
                          <TableCell className="font-medium">
                            {log.message}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getSourceIcon(log.source)}
                              <span className="ml-2 capitalize">
                                {log.source}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs">
                                {format(log.timestamp, "dd/MM/yyyy")}
                              </span>
                              <Clock className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                              <span className="text-xs">
                                {format(log.timestamp, "HH:mm:ss")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs truncate max-w-[100px]">
                            {log.user}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    viewLogDetails(log);
                                  }}
                                >
                                  Voir les détails
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Copy to clipboard
                                  }}
                                >
                                  Copier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLog(log);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  Supprimer
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

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Affichage de {paginatedLogs.length} sur {sortedLogs.length}{" "}
                  logs
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        {...(currentPage === 1 && { disabled: true })}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }).map(
                      (_, i) => {
                        let pageNumber: number;

                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <PaginationItem key={i}>
                            <PaginationLink
                              isActive={currentPage === pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    )}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        {...(currentPage === totalPages && { disabled: true })}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
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
                  {getLevelBadge(selectedLog.level)}
                </div>
                <DialogDescription>ID: {selectedLog.id}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Horodatage</h4>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(selectedLog.timestamp, "dd MMMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm mt-1">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{format(selectedLog.timestamp, "HH:mm:ss")}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Source</h4>
                    <div className="flex items-center text-sm">
                      {getSourceIcon(selectedLog.source)}
                      <span className="ml-2 capitalize">
                        {selectedLog.source}
                      </span>
                    </div>
                    <div className="flex items-center text-sm mt-1">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{selectedLog.user}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-1">Message</h4>
                  <p className="text-sm rounded-md bg-muted p-3">
                    {selectedLog.message}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Détails</h4>
                  <p className="text-sm rounded-md bg-muted p-3">
                    {selectedLog.details}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Métadonnées</h4>
                  <div className="rounded-md bg-muted p-3 font-mono text-xs">
                    <pre>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <div className="flex-1">
                    <span className="text-muted-foreground">
                      IP: {selectedLog.ip}
                    </span>
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
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce log ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedLog && (
              <div className="rounded-md border p-3 bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedLog.message}</span>
                  {getLevelBadge(selectedLog.level)}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {format(selectedLog.timestamp, "dd MMMM yyyy HH:mm:ss", {
                    locale: fr,
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={deleteLog}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
