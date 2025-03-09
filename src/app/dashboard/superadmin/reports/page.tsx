"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  ArrowUp,
  BarChart3,
  Calendar,
  Check,
  Clock,
  Download,
  FileDown,
  FileText,
  MoreHorizontal,
  Printer,
  RefreshCw,
  Search,
  Share2,
  X,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Sample data for reports
const generateReports = (count = 20) => {
  const reportTypes = [
    "Utilisateurs",
    "Rendez-vous",
    "Revenus",
    "Abonnements",
    "Activité",
    "Performance",
    "Satisfaction",
  ];

  const statuses = [
    { name: "Généré", color: "green" },
    { name: "En cours", color: "blue" },
    { name: "Planifié", color: "amber" },
    { name: "Erreur", color: "red" },
  ];

  const frequencies = [
    "Quotidien",
    "Hebdomadaire",
    "Mensuel",
    "Trimestriel",
    "Annuel",
    "Ponctuel",
  ];

  return Array.from({ length: count }, (_, i) => {
    const reportType =
      reportTypes[Math.floor(Math.random() * reportTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const frequency =
      frequencies[Math.floor(Math.random() * frequencies.length)];
    const createdAt = subDays(new Date(), Math.floor(Math.random() * 30));
    const lastRun =
      Math.random() > 0.2
        ? subDays(new Date(), Math.floor(Math.random() * 7))
        : null;

    return {
      id: `REP-${1000 + i}`,
      name: `Rapport ${reportType} ${frequency.toLowerCase()}`,
      type: reportType,
      status: status.name,
      statusColor: status.color,
      frequency: frequency,
      createdAt: createdAt,
      lastRun: lastRun,
      nextRun: lastRun
        ? subDays(new Date(), -Math.floor(Math.random() * 7))
        : null,
      creator: {
        name: `Admin ${(i % 5) + 1}`,
        email: `admin${(i % 5) + 1}@example.com`,
        avatar: `/placeholder.svg?height=32&width=32`,
      },
      recipients: Math.floor(Math.random() * 5) + 1,
      format: Math.random() > 0.5 ? "PDF" : "Excel",
    };
  });
};

const reports = generateReports(20);

// Sample data for scheduled reports
const scheduledReports = reports.filter(
  (report) => report.status === "Planifié" || report.status === "En cours"
);

// Sample data for recent reports
const recentReports = reports
  .filter((report) => report.status === "Généré")
  .sort(
    (a, b) =>
      new Date(b.lastRun || 0).getTime() - new Date(a.lastRun || 0).getTime()
  )
  .slice(0, 5);

export default function ReportsPage() {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false);

  // Filter reports based on search, status, and type
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      searchQuery === "" ||
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.frequency.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;

    const matchesType = typeFilter === "all" || report.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Toggle report selection
  const toggleReportSelection = (reportId: string) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter((id) => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  // Toggle all reports selection
  const toggleAllReports = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map((report) => report.id));
    }
  };

  // Simulate data refresh
  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  // Open report detail dialog
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openReportDetail = (report: any) => {
    setSelectedReport(report);
    setIsReportDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rapports</h2>
          <p className="text-muted-foreground">
            Gérez et générez des rapports détaillés sur l&apos;activité de la
            plateforme
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button>
            <FileText className="mr-2 h-4 w-4" /> Nouveau rapport
          </Button>
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" /> Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileDown className="mr-2 h-4 w-4" /> Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileDown className="mr-2 h-4 w-4" /> Exporter en Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileDown className="mr-2 h-4 w-4" /> Exporter en CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Rapports totaux
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
              <Badge variant="outline">
                {reports.filter((r) => r.status === "Généré").length} générés
              </Badge>
              <Separator orientation="vertical" className="mx-2 h-3" />
              <Badge variant="outline">
                {reports.filter((r) => r.status === "Planifié").length}{" "}
                planifiés
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Rapports générés ce mois
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                reports.filter(
                  (r) =>
                    r.status === "Généré" &&
                    new Date(r.lastRun || 0) > subDays(new Date(), 30)
                ).length
              }
            </div>
            <div className="mt-1 flex items-center text-xs">
              <Badge variant="default" className="text-xs font-normal">
                <ArrowUp className="mr-1 h-3 w-3" />
                +12.5%
              </Badge>
              <span className="text-muted-foreground ml-2">
                vs mois dernier
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Rapports planifiés
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((r) => r.status === "Planifié").length}
            </div>
            <div className="mt-1 flex items-center text-xs">
              <span className="text-muted-foreground">
                Prochain: {format(new Date(), "d MMMM", { locale: fr })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Rapports en erreur
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((r) => r.status === "Erreur").length}
            </div>
            <div className="mt-1 flex items-center text-xs">
              <Badge variant="destructive" className="text-xs font-normal">
                <ArrowUp className="mr-1 h-3 w-3" />
                +2
              </Badge>
              <span className="text-muted-foreground ml-2">
                vs mois dernier
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent and Scheduled Reports */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rapports récents</CardTitle>
            <CardDescription>Derniers rapports générés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => openReportDetail(report)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{report.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{report.type}</span>
                        <span>•</span>
                        <span>{report.format}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-xs">
                      <p className="font-medium">
                        {report.lastRun
                          ? format(new Date(report.lastRun), "dd/MM/yyyy")
                          : "N/A"}
                      </p>
                      <p className="text-muted-foreground">
                        {report.lastRun
                          ? format(new Date(report.lastRun), "HH:mm")
                          : ""}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <Button variant="outline" className="w-full">
              Voir tous les rapports générés
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rapports planifiés</CardTitle>
            <CardDescription>Prochains rapports à générer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledReports.slice(0, 5).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => openReportDetail(report)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{report.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{report.frequency}</span>
                        <span>•</span>
                        <Badge
                          variant={
                            report.status === "En cours" ? "default" : "outline"
                          }
                          className="text-xs font-normal"
                        >
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-xs">
                      <p className="font-medium">
                        {report.nextRun
                          ? format(new Date(report.nextRun), "dd/MM/yyyy")
                          : "N/A"}
                      </p>
                      <p className="text-muted-foreground">
                        {report.nextRun
                          ? format(new Date(report.nextRun), "HH:mm")
                          : ""}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Clock className="mr-2 h-4 w-4" /> Exécuter maintenant
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" /> Modifier la
                          planification
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <X className="mr-2 h-4 w-4" /> Annuler
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <Button variant="outline" className="w-full">
              Voir tous les rapports planifiés
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Tous les rapports</CardTitle>
              <CardDescription>
                Liste complète des rapports disponibles
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un rapport..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="Généré">Généré</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Planifié">Planifié</SelectItem>
                  <SelectItem value="Erreur">Erreur</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="Utilisateurs">Utilisateurs</SelectItem>
                  <SelectItem value="Rendez-vous">Rendez-vous</SelectItem>
                  <SelectItem value="Revenus">Revenus</SelectItem>
                  <SelectItem value="Abonnements">Abonnements</SelectItem>
                  <SelectItem value="Activité">Activité</SelectItem>
                  <SelectItem value="Performance">Performance</SelectItem>
                  <SelectItem value="Satisfaction">Satisfaction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={
                        selectedReports.length === filteredReports.length &&
                        filteredReports.length > 0
                      }
                      onCheckedChange={toggleAllReports}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Fréquence</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière exécution</TableHead>
                  <TableHead>Prochaine exécution</TableHead>
                  <TableHead>Créé par</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Aucun rapport trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer"
                      onClick={() => openReportDetail(report)}
                    >
                      <TableCell
                        className="w-[40px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedReports.includes(report.id)}
                          onCheckedChange={() =>
                            toggleReportSelection(report.id)
                          }
                          aria-label={`Select ${report.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {report.name}
                      </TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>{report.frequency}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            report.status === "Erreur"
                              ? "destructive"
                              : report.status === "En cours"
                              ? "default"
                              : "outline"
                          }
                          className="font-normal"
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.lastRun
                          ? format(new Date(report.lastRun), "dd/MM/yyyy HH:mm")
                          : "Jamais"}
                      </TableCell>
                      <TableCell>
                        {report.nextRun
                          ? format(new Date(report.nextRun), "dd/MM/yyyy HH:mm")
                          : "Non planifié"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={report.creator.avatar}
                              alt={report.creator.name}
                            />
                            <AvatarFallback>
                              {report.creator.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{report.creator.name}</span>
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" /> Voir les
                              détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" /> Télécharger
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Clock className="mr-2 h-4 w-4" /> Exécuter
                              maintenant
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" /> Modifier la
                              planification
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <X className="mr-2 h-4 w-4" /> Supprimer
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
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              Affichage de {filteredReports.length} sur {reports.length}{" "}
              rapports
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Précédent
              </Button>
              <Button variant="outline" size="sm">
                Suivant
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={isReportDetailOpen} onOpenChange={setIsReportDetailOpen}>
        <DialogContent className="max-w-4xl">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{selectedReport.name}</DialogTitle>
                  <Badge
                    variant={
                      selectedReport.status === "Erreur"
                        ? "destructive"
                        : selectedReport.status === "En cours"
                        ? "default"
                        : "outline"
                    }
                  >
                    {selectedReport.status}
                  </Badge>
                </div>
                <DialogDescription>
                  ID: {selectedReport.id} • Créé le{" "}
                  {format(new Date(selectedReport.createdAt), "dd/MM/yyyy", {
                    locale: fr,
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Informations générales
                      </h4>
                      <div className="rounded-lg border p-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Type
                          </span>
                          <span className="text-sm font-medium">
                            {selectedReport.type}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Fréquence
                          </span>
                          <span className="text-sm">
                            {selectedReport.frequency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Format
                          </span>
                          <span className="text-sm">
                            {selectedReport.format}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Destinataires
                          </span>
                          <span className="text-sm">
                            {selectedReport.recipients}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Planification
                      </h4>
                      <div className="rounded-lg border p-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Dernière exécution
                          </span>
                          <span className="text-sm">
                            {selectedReport.lastRun
                              ? format(
                                  new Date(selectedReport.lastRun),
                                  "dd/MM/yyyy HH:mm"
                                )
                              : "Jamais"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Prochaine exécution
                          </span>
                          <span className="text-sm">
                            {selectedReport.nextRun
                              ? format(
                                  new Date(selectedReport.nextRun),
                                  "dd/MM/yyyy HH:mm"
                                )
                              : "Non planifié"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Créé par
                          </span>
                          <span className="text-sm">
                            {selectedReport.creator.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Date de création
                          </span>
                          <span className="text-sm">
                            {format(
                              new Date(selectedReport.createdAt),
                              "dd/MM/yyyy"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Aperçu du rapport
                    </h4>
                    <div className="rounded-lg border p-3 h-[200px] flex items-center justify-center bg-muted/50">
                      <div className="text-center">
                        <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedReport.status === "Généré"
                            ? "Aperçu du rapport disponible"
                            : "Aperçu non disponible"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Actions</h4>
                    <div className="space-y-2">
                      {selectedReport.status === "Généré" && (
                        <Button className="w-full">
                          <Download className="mr-2 h-4 w-4" /> Télécharger le
                          rapport
                        </Button>
                      )}
                      {(selectedReport.status === "Planifié" ||
                        selectedReport.status === "En cours") && (
                        <Button className="w-full">
                          <Clock className="mr-2 h-4 w-4" /> Exécuter maintenant
                        </Button>
                      )}
                      <Button variant="outline" className="w-full">
                        <Calendar className="mr-2 h-4 w-4" /> Modifier la
                        planification
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Share2 className="mr-2 h-4 w-4" /> Partager
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Printer className="mr-2 h-4 w-4" /> Imprimer
                      </Button>
                      <Button variant="destructive" className="w-full">
                        <X className="mr-2 h-4 w-4" /> Supprimer
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Historique d&apos;exécution
                    </h4>
                    <div className="rounded-lg border p-3 space-y-2">
                      {selectedReport.lastRun ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Exécution réussie</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(selectedReport.lastRun),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">Exécution réussie</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                subDays(new Date(selectedReport.lastRun), 7),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <X className="h-4 w-4 text-red-500 mr-2" />
                              <span className="text-sm">
                                Échec de l&apos;exécution
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                subDays(new Date(selectedReport.lastRun), 14),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-sm text-muted-foreground">
                            Aucun historique disponible
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsReportDetailOpen(false)}
                >
                  Fermer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
