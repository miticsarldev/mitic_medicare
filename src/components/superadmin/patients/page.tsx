"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronDown,
  Filter,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  UserCheck,
  UserPlus,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import type { Patient } from "@/types/patient";

// Import our custom components
import { Progress } from "@/components/ui/progress";
import PatientDetailsModal from "./patient-details";
import PatientCreateEditModal from "./patient-create-edit-modal";
import PatientDeleteModal from "./patient-delete-modal";
import { usePatientColumns } from "./patient-columns";
import { PatientAnalyticsType } from "@/types";

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientModalMode, setPatientModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<PatientAnalyticsType | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const isInvalidDateRange = useMemo(() => {
    if (!dateFrom || !dateTo) return false;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    if (Number.isNaN(+from) || Number.isNaN(+to)) return false;
    return to < from;
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (isInvalidDateRange) {
      toast({
        title: "Filtre de dates invalide",
        description: "La date de fin est antérieure à la date de début.",
        variant: "destructive",
      });
    }
  }, [isInvalidDateRange]);

  const openPatientDetail = async (patient: Patient) => {
    try {
      const response = await fetch(`/api/superadmin/patients/${patient.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch patient details");
      }

      const patientDetails = await response.json();
      setSelectedPatient(patientDetails);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch patient details",
        variant: "destructive",
      });
    }
  };

  const openPatientCreate = () => {
    setSelectedPatient(null);
    setPatientModalMode("create");
    setIsPatientModalOpen(true);
  };

  const openPatientEdit = async (patient: Patient) => {
    try {
      const response = await fetch(`/api/superadmin/patients/${patient.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch patient details");
      }

      const patientDetails = await response.json();
      setSelectedPatient(patientDetails);
      setPatientModalMode("edit");
      setIsPatientModalOpen(true);
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch patient details",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  // Get table columns using our custom hook
  const columns = usePatientColumns({
    openPatientDetail,
    openPatientEdit,
    openDeleteDialog,
  });

  const table = useReactTable({
    data: patients,
    columns,
    onSortingChange: (updatedSorting) => {
      setSorting(updatedSorting);
      if (Array.isArray(updatedSorting) && updatedSorting.length > 0) {
        const column = updatedSorting[0].id;
        const direction = updatedSorting[0].desc ? "desc" : "asc";

        // Map column id to API sortBy parameter
        let apiSortBy = column;
        if (column === "name") apiSortBy = "name";
        else if (column === "registrationDate") apiSortBy = "registrationDate";
        else if (column === "lastLogin") apiSortBy = "lastLogin";
        else if (column === "appointmentsCount")
          apiSortBy = "appointmentsCount";

        setSortBy(apiSortBy);
        setSortOrder(direction);
      } else {
        // Default sorting when cleared
        setSortBy("name");
        setSortOrder("asc");
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: itemsPerPage,
      },
    },
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const fetchPatients = useCallback(async () => {
    if (isInvalidDateRange) {
      setIsLoading(false);
      setPatients([]);
      setTotalPatients(0);
      setTotalPages(1);
      return;
    }

    setIsLoading(true);
    try {
      const qs = new URLSearchParams({
        search: searchQuery,
        status: selectedStatus,
        page: String(currentPage),
        limit: String(itemsPerPage),
        sortBy,
        sortOrder,
      });

      if (dateFrom) qs.set("dateFrom", dateFrom);
      if (dateTo) qs.set("dateTo", dateTo);

      const response = await fetch(`/api/superadmin/patients?${qs.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }

      const data = await response.json();
      setPatients(data.patients);
      setTotalPatients(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch patients data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    selectedStatus,
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
    isInvalidDateRange,
  ]);

  // Fetch patients data
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/superadmin/patients/analytics");

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gestion des Patients
          </h2>
          <p className="text-muted-foreground">
            Gérez les comptes patients, consultez leurs informations et suivez
            leur activité
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={openPatientCreate}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un patient
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Liste des patients</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center space-x-2">
                  <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Rechercher un patient..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-1">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filtres</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={selectedStatus === "all"}
                        onCheckedChange={() => setSelectedStatus("all")}
                      >
                        Tous les statuts
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedStatus === "active"}
                        onCheckedChange={() => setSelectedStatus("active")}
                      >
                        Actif
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedStatus === "inactive"}
                        onCheckedChange={() => setSelectedStatus("inactive")}
                      >
                        Inactif
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number.parseInt(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-[130px]">
                      <SelectValue placeholder="10 par page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 par page</SelectItem>
                      <SelectItem value="10">10 par page</SelectItem>
                      <SelectItem value="20">20 par page</SelectItem>
                      <SelectItem value="50">50 par page</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-9 w-[150px]"
                      aria-label="Date de début"
                    />
                    <span className="text-muted-foreground">→</span>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-9 w-[150px]"
                      aria-label="Date de fin"
                    />
                  </div>
                  {isInvalidDateRange && (
                    <span className="text-xs text-destructive mt-1">
                      La date de fin doit être postérieure à la date de début.
                    </span>
                  )}
                </div>
                {Object.keys(rowSelection).length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {Object.keys(rowSelection).length} sélectionné(s)
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Actions
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <DropdownMenuItem
                          onClick={() => handleBulkAction("export")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Exporter
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBulkAction("email")}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Envoyer un email
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="text-center py-6"
                        >
                          Chargement...
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="text-center py-6"
                        >
                          Aucun patient trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Affichage de{" "}
                  {Math.min(
                    totalPatients,
                    (currentPage - 1) * itemsPerPage + 1
                  )}{" "}
                  à {Math.min(totalPatients, currentPage * itemsPerPage)} sur{" "}
                  {totalPatients} patients
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1 || isInvalidDateRange}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <Button
                          key={pageNumber}
                          variant={
                            pageNumber === currentPage ? "default" : "outline"
                          }
                          size="sm"
                          className="h-8 w-8"
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && <span className="px-2">...</span>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages || isInvalidDateRange}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics tab content remains the same */}
        <TabsContent value="analytics" className="space-y-4">
          {!analytics ? (
            <div className="text-center py-6 text-muted-foreground">
              Chargement des analytiques...
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total des patients
                    </CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.totalPatients}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +
                      {(
                        (analytics.newPatients / analytics.totalPatients) *
                        100
                      ).toFixed(0)}
                      % par rapport au mois dernier
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Patients actifs
                    </CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.activePatients}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (analytics.activePatients / analytics.totalPatients) *
                        100
                      ).toFixed(1)}
                      % du total
                    </p>
                    <div className="mt-1">
                      <Progress
                        value={
                          (analytics.activePatients / analytics.totalPatients) *
                          100
                        }
                        className="h-1"
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Nouveaux patients
                    </CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.newPatients}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Derniers 30 jours
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Rendez-vous
                    </CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {patients.reduce(
                        (sum, patient) =>
                          sum + (patient?.appointmentsCount ?? 0),
                        0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total des rendez-vous
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Activité des patients</CardTitle>
                    <CardDescription>
                      Tendances d&apos;activité sur les 6 derniers mois
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {analytics &&
                    analytics.patientActivity &&
                    analytics.patientActivity.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">
                              Tendance globale
                            </h4>
                            <p className="text-2xl font-bold">
                              {analytics.patientActivity.reduce(
                                (sum, item) => sum + item.count,
                                0
                              )}{" "}
                              rendez-vous
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block h-3 w-3 rounded-full bg-primary`}
                            ></span>
                            <span className="text-sm text-muted-foreground">
                              Activité mensuelle
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {analytics.patientActivity.map((item, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-[1fr_80px] gap-2"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {item.month}
                                </span>
                                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full bg-primary"
                                    style={{
                                      width: `${(item.count / Math.max(...analytics.patientActivity.map((i) => i.count))) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex items-center justify-end">
                                <span className="text-sm font-medium">
                                  {item.count} RDV
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground">
                            {analytics.patientActivity.length >= 2
                              ? analytics.patientActivity[
                                  analytics.patientActivity.length - 1
                                ].count >
                                analytics.patientActivity[
                                  analytics.patientActivity.length - 2
                                ].count
                                ? "↗️ En hausse par rapport au mois précédent"
                                : "↘️ En baisse par rapport au mois précédent"
                              : "👥 Les premiers patients sont là, la dynamique commence !"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <p className="text-muted-foreground">
                          Aucune donnée disponible
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Répartition géographique</CardTitle>
                    <CardDescription>
                      Distribution des patients par région
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {analytics &&
                    analytics.geographicalDistribution &&
                    analytics.geographicalDistribution.length > 0 ? (
                      <div className="space-y-4 overflow-auto max-h-[250px] pr-2">
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 font-medium text-sm">
                          <div>Région</div>
                          <div>Distribution</div>
                          <div className="text-right">Patients</div>
                        </div>

                        {analytics.geographicalDistribution
                          .sort((a, b) => b.count - a.count)
                          .map((region, index) => {
                            const percentage =
                              (region.count / analytics.totalPatients) * 100;
                            const hue = 200 + ((index * 20) % 160); // Generate different colors

                            return (
                              <div
                                key={index}
                                className="grid grid-cols-[auto_1fr_auto] items-center gap-4"
                              >
                                <div className="font-medium">
                                  {region.region}
                                </div>
                                <div className="w-full">
                                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                      className="h-full"
                                      style={{
                                        width: `${percentage}%`,
                                        backgroundColor: `hsl(${hue}, 70%, 60%)`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-medium">
                                    {region.count}
                                  </span>
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    ({percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground">
                            {analytics.geographicalDistribution.length} régions
                            représentées
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <p className="text-muted-foreground">
                          Aucune donnée disponible
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Patient Detail Modal - Now using the extracted component */}
      <PatientDetailsModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        patient={selectedPatient}
        onEdit={openPatientEdit}
      />

      {/* Combined Patient Modal for Create/Edit */}
      <PatientCreateEditModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        mode={patientModalMode}
        patient={selectedPatient}
        onSuccess={fetchPatients}
      />

      {/* Delete Confirmation Dialog */}
      <PatientDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        patient={selectedPatient}
        onSuccess={fetchPatients}
      />
    </div>
  );
}
