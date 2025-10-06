/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  Download,
  Filter,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Check,
  Users,
  ShieldCheck,
  UserPlus,
  User,
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  bulkDeleteDoctors,
  updateDoctorStatus,
  updateDoctorVerification,
} from "@/app/actions/doctor-actions";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Doctor } from "@/types/doctor";
import { Progress } from "@/components/ui/progress";
import { useDoctorColumns } from "./doctor-columns";
import DoctorCreateEditModal from "./doctor-create-edit-modal";
import DoctorDetails from "./doctor-details";
import DoctorDeleteModal from "./doctor-delete-modal";
import { Hospital } from "@/types/hospital";
import { DoctorAnalyticsType } from "@/types";

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<DoctorAnalyticsType | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [dateField, setDateField] = useState<"joinedAt" | "lastActive">(
    "joinedAt"
  );
  const [dateFrom, setDateFrom] = useState<string>(""); // "YYYY-MM-DD"
  const [dateTo, setDateTo] = useState<string>("");

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("search", searchQuery);
      queryParams.append("page", currentPage.toString());
      queryParams.append("limit", itemsPerPage.toString());
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortOrder", sortOrder);
      queryParams.append("dateField", dateField);
      if (dateFrom) queryParams.append("dateFrom", dateFrom);
      if (dateTo) queryParams.append("dateTo", dateTo);

      selectedStatuses.forEach((status) => {
        queryParams.append("status", status);
      });

      selectedLocations.forEach((location) => {
        queryParams.append("location", location);
      });

      selectedSpecialties.forEach((specialty) => {
        queryParams.append("specialty", specialty);
      });

      const response = await fetch(
        `/api/superadmin/doctors?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await response.json();
      setDoctors(data.doctors);
      setTotalDoctors(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch doctors data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
    selectedStatuses,
    selectedLocations,
    selectedSpecialties,
    dateField,
    dateFrom,
    dateTo,
  ]);

  // Fetch doctors data
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Fetch specialties, locations, and hospitals
  useEffect(() => {
    fetchSpecialties();
    fetchHospitals();
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch("/api/superadmin/doctors/analytics");

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
  }, []);

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("/api/superadmin/doctors/filters");
      const data = await response.json();
      setLocations(data.cities);
    } catch (error) {
      console.error("Failed to fetch filter options", error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await fetch("/api/superadmin/doctors/specialities");

      if (!response.ok) {
        throw new Error("Failed to fetch specialties");
      }

      const data = await response.json();
      setSpecialties(data);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      // Fallback to default specialties
      setSpecialties([]);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await fetch(
        "/api/superadmin/doctors/hospitals?limit=100"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch hospitals");
      }

      const data = await response.json();
      setHospitals(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.hospitals ?? []).map((hospital: any) => ({
          id: hospital.id,
          name: hospital.name,
          city: hospital.city,
        }))
      );
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      setHospitals([]);
    }
  };

  // Open doctor detail
  const openDoctorDetail = async (doctor: Doctor) => {
    try {
      const response = await fetch(`/api/superadmin/doctors/${doctor.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch doctor details");
      }

      const doctorDetails = await response.json();
      setSelectedDoctor(doctorDetails);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch doctor details",
        variant: "destructive",
      });
    }
  };

  // Open doctor edit
  const openDoctorEdit = async (doctor: Doctor) => {
    try {
      const response = await fetch(`/api/superadmin/doctors/${doctor.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch doctor details");
      }

      const doctorDetails = await response.json();
      setSelectedDoctor(doctorDetails);
      setIsEditOpen(true);
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch doctor details",
        variant: "destructive",
      });
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteDialogOpen(true);
  };

  const patchDoctorLocally = useCallback(
    (doctorId: string, patch: Partial<Doctor>) => {
      // Update list
      setDoctors((prev) =>
        prev.map((d) =>
          d.id === doctorId
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { ...d, ...patch, user: { ...d.user, ...(patch as any).user } }
            : d
        )
      );
      // Update open details
      setSelectedDoctor((prev) =>
        prev && prev.id === doctorId
          ? {
              ...prev,
              ...patch,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              user: { ...prev.user, ...(patch as any).user },
            }
          : prev
      );
    },
    []
  );

  // Handle status change
  const handleStatusChange = useCallback(
    async (doctorId: string, status: "active" | "inactive") => {
      const res = await updateDoctorStatus(doctorId, status);
      if (res?.error) {
        toast({
          title: "Error",
          description: res.error,
          variant: "destructive",
        });
        return;
      }

      // Optimistic local patch
      patchDoctorLocally(doctorId, {
        user: { isActive: status === "active" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      toast({ title: "Success", description: "Statut mis à jour" });
      // keep this if you want the table to refetch from server too
      fetchDoctors();
      fetchAnalytics();
    },
    [patchDoctorLocally, fetchDoctors, fetchAnalytics]
  );

  const handleVerificationChange = useCallback(
    async (doctorId: string, verified: boolean) => {
      const res = await updateDoctorVerification(doctorId, verified);
      if (res?.error) {
        toast({
          title: "Error",
          description: res.error,
          variant: "destructive",
        });
        return;
      }
      patchDoctorLocally(doctorId, { isVerified: verified });
      toast({ title: "Success", description: "Vérification mise à jour" });
      fetchDoctors();
      fetchAnalytics(); // ← re-pull KPIs
    },
    [patchDoctorLocally, fetchDoctors, fetchAnalytics]
  );

  // Get table columns using our custom hook
  const columns = useDoctorColumns({
    openDoctorDetail,
    openDoctorEdit,
    openDeleteDialog,
    handleStatusChange,
    handleVerificationChange,
  });

  // Initialize the table
  const table = useReactTable({
    data: doctors,
    columns,
    onSortingChange: (updatedSorting) => {
      setSorting(updatedSorting);

      // Update sortBy and sortOrder based on the table sorting
      if (Array.isArray(updatedSorting) && updatedSorting.length > 0) {
        const column = updatedSorting[0].id;
        const direction = updatedSorting[0].desc ? "desc" : "asc";

        // Map column id to API sortBy parameter
        let apiSortBy = column;
        if (column === "name") apiSortBy = "name";
        else if (column === "specialty") apiSortBy = "specialty";
        else if (column === "location") apiSortBy = "location";
        else if (column === "patients") apiSortBy = "patients";
        else if (column === "rating") apiSortBy = "rating";
        else if (column === "joinedAt") apiSortBy = "joinedAt";
        else if (column === "subscription") apiSortBy = "subscription";

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

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    const selectedRows = Object.keys(rowSelection).map(
      (index) => doctors[Number.parseInt(index)].id
    );

    if (selectedRows.length === 0) {
      toast({
        title: "Info",
        description: "No doctors selected",
      });
      return;
    }

    if (action === "delete") {
      try {
        const result = await bulkDeleteDoctors(selectedRows);

        if (result.error) {
          throw new Error(result.error);
        }

        toast({
          title: "Success",
          description: `${selectedRows.length} doctors deleted successfully`,
        });

        setRowSelection({});
        fetchDoctors();
        fetchAnalytics();
      } catch (error) {
        console.error("Error bulk deleting doctors:", error);
        toast({
          title: "Error",
          description: "Failed to delete doctors",
          variant: "destructive",
        });
      }
    } else if (action === "export") {
      try {
        const res = await fetch("/api/superadmin/doctors/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedRows }),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json?.error || "Failed to export doctors");
        }

        const rows: any[] = json?.data ?? [];
        if (!Array.isArray(rows) || rows.length === 0) {
          toast({
            title: "Export CSV",
            description: "Aucune donnée à exporter.",
          });
          return;
        }

        // Build CSV safely
        const toCsv = (items: any[]) => {
          const cols = Array.from(
            new Set(items.flatMap((o) => Object.keys(o)))
          );
          const escape = (v: unknown) => {
            if (v === null || v === undefined) return "";
            const s = String(v);
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          };
          const header = cols.join(",");
          const lines = items.map((o) =>
            cols.map((c) => escape(o[c])).join(",")
          );
          return [header, ...lines].join("\n");
        };

        const csv = toCsv(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `doctors_export_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        toast({
          title: "Export CSV prêt",
          description: `${rows.length} médecins exportés.`,
        });
      } catch (error) {
        console.error("Error exporting doctors:", error);
        toast({
          title: "Erreur",
          description: "Échec de l’export CSV",
          variant: "destructive",
        });
      }
    } else if (action === "verify") {
      try {
        for (const doctorId of selectedRows) {
          await updateDoctorVerification(doctorId, true);
        }

        toast({
          title: "Success",
          description: `${selectedRows.length} doctors verified successfully`,
        });

        setRowSelection({});
        fetchDoctors();
      } catch (error) {
        console.error("Error verifying doctors:", error);
        toast({
          title: "Error",
          description: "Failed to verify doctors",
          variant: "destructive",
        });
      }
    }
  };

  // Toggle specialty selection
  const toggleSpecialty = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(
        selectedSpecialties.filter((s) => s !== specialty)
      );
    } else {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };

  // Toggle location selection
  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter((l) => l !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  // Toggle status selection
  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialties([]);
    setSelectedLocations([]);
    setSelectedStatuses([]);
    setDateField("joinedAt"); // +++
    setDateFrom(""); // +++
    setDateTo("");
  };

  // Function to handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDoctors();
    fetchAnalytics();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Add this useEffect to reset the current page when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  return (
    <div className="space-y-4 p-4 bg-transparent">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestion des Médecins
          </h2>
          <p className="text-muted-foreground">
            Gérez les comptes médecins, vérifiez les profils et suivez leur
            activité
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" /> Filtres
          </Button>
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
          <Button onClick={() => setIsAddDoctorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un médecin
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Liste des médecins</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center p-4">
              <div className="flex-1">
                <CardTitle>Liste des Médecins</CardTitle>
                <CardDescription>
                  {doctors.length} médecin
                  {doctors.length !== 1 ? "s" : ""} trouvé
                  {doctors.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleBulkAction("verify")}
                      disabled={Object.keys(rowSelection).length === 0}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Vérifier sélection
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleBulkAction("export")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Exporter en CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4">
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
                    {table.getRowModel().rows?.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          {isLoading
                            ? "Chargement..."
                            : "Aucun médecin trouvé."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="cursor-pointer hover:bg-muted/50"
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
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Affichage de{" "}
                  {Math.min(totalDoctors, (currentPage - 1) * itemsPerPage + 1)}{" "}
                  à {Math.min(totalDoctors, currentPage * itemsPerPage)} sur{" "}
                  {totalDoctors} médecins
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
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
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Affichage de <strong>{doctors.length}</strong> sur{" "}
                <strong>{totalDoctors}</strong> médecins
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-sm text-muted-foreground">
                  {Object.keys(rowSelection).length} sélectionné
                  {Object.keys(rowSelection).length !== 1 ? "s" : ""}
                </div>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    const newPageSize = Number.parseInt(value);
                    setItemsPerPage(newPageSize);
                  }}
                >
                  <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue placeholder="10 par page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 par page</SelectItem>
                    <SelectItem value="10">10 par page</SelectItem>
                    <SelectItem value="20">20 par page</SelectItem>
                    <SelectItem value="50">50 par page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

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
                      Total des médecins
                    </CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.totalDoctors}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +
                      {(
                        (analytics.newDoctors / analytics.totalDoctors) *
                        100
                      ).toFixed(0)}
                      % par rapport au mois dernier
                    </p>
                    <div className="mt-4">
                      <Progress
                        value={
                          (analytics.activeDoctors / analytics.totalDoctors) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Médecins actifs
                    </CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.activeDoctors}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (analytics.activeDoctors / analytics.totalDoctors) *
                        100
                      ).toFixed(1)}
                      % du total
                    </p>
                    <div className="mt-4">
                      <Progress
                        value={
                          (analytics.activeDoctors / analytics.totalDoctors) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Médecins vérifiés
                    </CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.verifiedDoctors}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (analytics.verifiedDoctors / analytics.totalDoctors) *
                        100
                      ).toFixed(1)}
                      % du total
                    </p>
                    <div className="mt-4">
                      <Progress
                        value={
                          (analytics.verifiedDoctors / analytics.totalDoctors) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Nouveaux médecins
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.newDoctors}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Derniers 30 jours
                    </p>
                    <div className="mt-4">
                      <Progress
                        value={
                          (analytics.newDoctors / analytics.totalDoctors) * 100
                        }
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par spécialité</CardTitle>
                    <CardDescription>
                      Distribution des médecins par spécialité
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {analytics &&
                    analytics.specialtyDistribution &&
                    analytics.specialtyDistribution.length > 0 ? (
                      <div className="space-y-4 overflow-auto max-h-[250px] pr-2">
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 font-medium text-sm">
                          <div>Spécialité</div>
                          <div>Distribution</div>
                          <div className="text-right">Médecins</div>
                        </div>

                        {analytics.specialtyDistribution
                          .sort((a, b) => b.count - a.count)
                          .map((specialty, index) => {
                            const percentage =
                              (specialty.count / analytics.totalDoctors) * 100;
                            const hue = 200 + ((index * 20) % 160); // Generate different colors

                            return (
                              <div
                                key={index}
                                className="grid grid-cols-[auto_1fr_auto] items-center gap-4"
                              >
                                <div className="font-medium">
                                  {specialty.specialty}
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
                                    {specialty.count}
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
                            {analytics.specialtyDistribution.length} spécialités
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

                <Card>
                  <CardHeader>
                    <CardTitle>Activité des médecins</CardTitle>
                    <CardDescription>
                      Tendances d&apos;inscription sur les 6 derniers mois
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {analytics &&
                    analytics.registrationsActivity &&
                    analytics.registrationsActivity.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">
                              Tendance globale
                            </h4>
                            <p className="text-2xl font-bold">
                              {analytics.registrationsActivity.reduce(
                                (sum, item) => sum + item.count,
                                0
                              )}{" "}
                              inscriptions
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block h-3 w-3 rounded-full bg-primary`}
                            ></span>
                            <span className="text-sm text-muted-foreground">
                              Inscriptions mensuelles
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {analytics.registrationsActivity.map(
                            (item, index) => (
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
                                        width: `${
                                          (item.count /
                                            Math.max(
                                              ...analytics.registrationsActivity.map(
                                                (i) => i.count
                                              )
                                            )) *
                                          100
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-end">
                                  <span className="text-sm font-medium">
                                    {item.count}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>

                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground">
                            {analytics.registrationsActivity.length >= 2
                              ? analytics.registrationsActivity.at(-1)!.count >
                                analytics.registrationsActivity.at(-2)!.count
                                ? "📈 Croissance observée ce mois-ci"
                                : "📉 Léger recul par rapport au mois précédent"
                              : "📊 Encore un peu tôt pour détecter une tendance"}
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

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition géographique</CardTitle>
                    <CardDescription>
                      Distribution des médecins par ville
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {analytics &&
                    analytics.geographicalDistribution &&
                    analytics.geographicalDistribution.length > 0 ? (
                      <div className="space-y-4 overflow-auto max-h-[250px] pr-2">
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 font-medium text-sm">
                          <div>Ville</div>
                          <div>Distribution</div>
                          <div className="text-right">Médecins</div>
                        </div>

                        {analytics.geographicalDistribution
                          .sort((a, b) => b.count - a.count)
                          .map((city, index) => {
                            const percentage =
                              (city.count / analytics.totalDoctors) * 100;
                            const hue = 120 + ((index * 20) % 160); // Generate different colors

                            return (
                              <div
                                key={index}
                                className="grid grid-cols-[auto_1fr_auto] items-center gap-4"
                              >
                                <div className="font-medium">{city.city}</div>
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
                                    {city.count}
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
                            {analytics.geographicalDistribution.length} villes
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

                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par abonnement</CardTitle>
                    <CardDescription>
                      Distribution des médecins par type d&apos;abonnement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {analytics &&
                    analytics.subscriptionDistribution &&
                    analytics.subscriptionDistribution.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 font-medium text-sm">
                          <div>Abonnement</div>
                          <div>Distribution</div>
                          <div className="text-right">Médecins</div>
                        </div>

                        {analytics.subscriptionDistribution
                          .sort((a, b) => b.count - a.count)
                          .map((plan, index) => {
                            const percentage =
                              (plan.count / analytics.totalDoctors) * 100;
                            let color = "bg-gray-500";
                            if (plan.plan === "FREE") color = "bg-purple-500";
                            else if (plan.plan === "STANDARD")
                              color = "bg-blue-500";
                            else if (plan.plan === "PREMIUM")
                              color = "bg-amber-500";

                            return (
                              <div
                                key={index}
                                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 mt-4"
                              >
                                <div className="font-medium">{plan.plan}</div>
                                <div className="w-full">
                                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                      className={`h-full ${color}`}
                                      style={{
                                        width: `${percentage}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-medium">
                                    {plan.count}
                                  </span>
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    ({percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                        <div className="pt-2 border-t mt-4">
                          <p className="text-sm text-muted-foreground">
                            {analytics.subscriptionDistribution.length} types
                            d&apos;abonnements
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

      {/* Filter Sheet */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filtres</SheetTitle>
            <SheetDescription>
              Affinez votre recherche de médecins
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Spécialités</h4>
              <div className="grid grid-cols-2 gap-2">
                {specialties.map((specialty) => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`specialty-${specialty}`}
                      checked={selectedSpecialties.includes(specialty)}
                      onCheckedChange={() => toggleSpecialty(specialty)}
                    />
                    <label
                      htmlFor={`specialty-${specialty}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {specialty}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Localisation</h4>
              <div className="grid grid-cols-2 gap-2">
                {locations.map((location) => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={selectedLocations.includes(location)}
                      onCheckedChange={() => toggleLocation(location)}
                    />
                    <label
                      htmlFor={`location-${location}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {location}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Statut</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-active"
                    checked={selectedStatuses.includes("active")}
                    onCheckedChange={() => toggleStatus("active")}
                  />
                  <label
                    htmlFor="status-active"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Actif
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-inactive"
                    checked={selectedStatuses.includes("inactive")}
                    onCheckedChange={() => toggleStatus("inactive")}
                  />
                  <label
                    htmlFor="status-inactive"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Inactif
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Dates</h4>

              <div className="space-y-2">
                <label className="text-sm">Champ de date</label>
                <Select
                  value={dateField}
                  onValueChange={(v) =>
                    setDateField(v as "joinedAt" | "lastActive")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner le champ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="joinedAt">Date d’inscription</SelectItem>
                    <SelectItem value="lastActive">
                      Dernière activité
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm">Du</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Au</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={clearFilters}>
              Réinitialiser
            </Button>
            <Button onClick={() => setIsFilterOpen(false)}>
              Appliquer les filtres
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Doctor Details */}
      <DoctorDetails
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        doctor={selectedDoctor}
        onEdit={openDoctorEdit}
        onDelete={openDeleteDialog}
        onStatusChange={handleStatusChange}
        onVerificationChange={handleVerificationChange}
      />

      {/* Doctor Create/Edit Modal */}
      <DoctorCreateEditModal
        isOpen={isAddDoctorOpen || isEditOpen}
        onClose={() => {
          setIsAddDoctorOpen(false);
          setIsEditOpen(false);
        }}
        mode={isAddDoctorOpen ? "create" : "edit"}
        doctor={selectedDoctor}
        onSuccess={fetchDoctors}
        specialties={specialties}
        hospitals={hospitals}
      />

      {/* Doctor Delete Modal */}
      <DoctorDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        doctor={selectedDoctor}
        onSuccess={fetchDoctors}
      />
    </div>
  );
}
