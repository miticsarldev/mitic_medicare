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
  Settings,
  Building2,
  Building,
} from "lucide-react";
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
  bulkDeleteHospitals,
  bulkExportHospitals,
  updateHospitalStatus,
  updateHospitalVerification,
} from "@/app/actions/hospital-actions";
import { type HospitalStatus, SubscriptionPlan } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { ExportHospital, Hospital } from "@/types/hospital";
import { Progress } from "@/components/ui/progress";
import { useHospitalColumns } from "./hospital-columns";
import HospitalDetails from "./hospital-details";
import HospitalCreateEditModal from "./hospital-create-edit-modal";
import HospitalDeleteModal from "./hospital-delete-modal";

// Define the Analytics type
type Analytics = {
  totalHospitals: number;
  activeHospitals: number;
  newHospitals: number;
  registrationsActivity: { month: string; count: number }[];
  geographicalDistribution: { region: string; count: { id: number } }[];
  subscriptionsByPlan: { plan: SubscriptionPlan; count: number }[];
};

export default function HospitalsPage() {
  // State for search, filters, and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>(
    []
  );
  const [startDate, setStartDate] = useState<string>(""); // New state for start date
  const [endDate, setEndDate] = useState<string>(""); // New state for end date
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null
  );
  const [locations, setLocations] = useState<string[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddHospitalOpen, setIsAddHospitalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [totalHospitals, setTotalHospitals] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const subscriptionPlans = Object.values(SubscriptionPlan);

  const fetchHospitals = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("search", searchQuery);
      queryParams.append("page", currentPage.toString());
      queryParams.append("limit", itemsPerPage.toString());
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortOrder", sortOrder);

      // Append multiple status values
      selectedStatuses.forEach((status) => {
        queryParams.append("status", status);
      });

      // Append multiple locations
      selectedLocations.forEach((location) => {
        queryParams.append("location", location);
      });

      // Append multiple subscription plans
      selectedSubscriptions.forEach((subscription) => {
        queryParams.append("subscription", subscription);
      });

      // Append date range filters
      if (startDate) {
        queryParams.append("startDate", startDate);
      }
      if (endDate) {
        queryParams.append("endDate", endDate);
      }

      const response = await fetch(
        `/api/superadmin/hospitals?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch hospitals");
      }

      const data = await response.json();
      setHospitals(data.hospitals);
      setTotalHospitals(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      toast({
        title: "Error",
        description: "Failed to fetch hospitals data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    selectedStatuses,
    selectedLocations,
    selectedSubscriptions,
    startDate,
    endDate,
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
  ]);

  // Fetch hospitals data
  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("/api/superadmin/hospitals/filters");
      const data = await response.json();
      setLocations(data.cities);
    } catch (error) {
      console.error("Failed to fetch filter options", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/superadmin/hospitals/analytics");

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

  // Open hospital detail
  const openHospitalDetail = async (hospital: Hospital) => {
    try {
      const response = await fetch(`/api/superadmin/hospitals/${hospital.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch hospital details");
      }

      const hospitalDetails = await response.json();
      setSelectedHospital(hospitalDetails);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Error fetching hospital details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch hospital details",
        variant: "destructive",
      });
    }
  };

  // Open hospital edit
  const openHospitalEdit = async (hospital: Hospital) => {
    try {
      const response = await fetch(`/api/superadmin/hospitals/${hospital.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch hospital details");
      }

      const hospitalDetails = await response.json();
      setSelectedHospital(hospitalDetails);
      setIsEditOpen(true);
    } catch (error) {
      console.error("Error fetching hospital details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch hospital details",
        variant: "destructive",
      });
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsDeleteDialogOpen(true);
  };

  // inside HospitalsPage component, near other useCallbacks
  const patchHospitalLocally = useCallback(
    (hospitalId: string, patch: Partial<Hospital>) => {
      // list
      setHospitals((prev) =>
        prev.map((h) => (h.id === hospitalId ? { ...h, ...patch } : h))
      );
      // details pane (if open)
      setSelectedHospital((prev) =>
        prev && prev.id === hospitalId ? { ...prev, ...patch } : prev
      );
    },
    []
  );

  // replace your handleStatusChange
  const handleStatusChange = useCallback(
    async (hospitalId: string, status: HospitalStatus) => {
      // optimistic patch
      patchHospitalLocally(hospitalId, { status });

      const result = await updateHospitalStatus(hospitalId, status);
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        // rollback on failure
        patchHospitalLocally(hospitalId, {
          status: status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        });
        return;
      }

      toast({ title: "Success", description: "Statut mis à jour" });
      // optional: keep server truth in sync
      fetchHospitals();
    },
    [patchHospitalLocally, fetchHospitals]
  );

  // replace your handleVerificationChange
  const handleVerificationChange = useCallback(
    async (hospitalId: string, verified: boolean) => {
      // optimistic patch
      patchHospitalLocally(hospitalId, { isVerified: verified });

      const result = await updateHospitalVerification(hospitalId, verified);
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        // rollback
        patchHospitalLocally(hospitalId, { isVerified: !verified });
        return;
      }

      toast({ title: "Success", description: "Vérification mise à jour" });
      fetchHospitals();
    },
    [patchHospitalLocally, fetchHospitals]
  );

  // Get table columns using our custom hook
  const columns = useHospitalColumns({
    openHospitalDetail,
    openHospitalEdit,
    openDeleteDialog,
    handleStatusChange,
    handleVerificationChange,
  });

  // Initialize the table
  const table = useReactTable({
    data: hospitals,
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
        else if (column === "city") apiSortBy = "location";
        else if (column === "doctorsCount") apiSortBy = "doctors";
        else if (column === "createdAt") apiSortBy = "createdAt";
        else if (column === "subscription") apiSortBy = "subscription";

        setSortBy(apiSortBy);
        setSortOrder(direction);
      } else {
        // Default sorting when cleared
        setSortBy("name");
        setSortOrder("asc");
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    const selectedRows = Object.keys(rowSelection).map(
      (index) => hospitals[Number.parseInt(index)].id
    );

    if (selectedRows.length === 0) {
      toast({
        title: "Info",
        description: "No hospitals selected",
      });
      return;
    }

    if (action === "delete") {
      try {
        const result = await bulkDeleteHospitals(selectedRows);

        if (result.error) {
          throw new Error(result.error);
        }

        toast({
          title: "Success",
          description: `${selectedRows.length} hospitals deleted successfully`,
        });

        setRowSelection({});
        fetchHospitals();
      } catch (error) {
        console.error("Error bulk deleting hospitals:", error);
        toast({
          title: "Error",
          description: "Failed to delete hospitals",
          variant: "destructive",
        });
      }
    } else if (action === "export") {
      try {
        const result = await bulkExportHospitals(selectedRows);

        if (result.error) {
          throw new Error(result.error);
        }

        if (!result?.data) {
          toast({
            title: "Info",
            description: "Aucun établissement sélectionné",
          });
          return;
        }

        const headers = [
          "id",
          "name",
          "email",
          "phone",
          "address",
          "city",
          "state",
          "zipCode",
          "country",
          "status",
          "verified",
          "doctorsCount",
          "createdAt",
        ].join(",");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = (result.data as any[])
          .map((hospital) => {
            // Ensure all ExportHospital fields are present, fallback to empty string or 0 if missing
            const exportHospital: ExportHospital = {
              id: hospital.id,
              name: hospital.name,
              email: hospital.email,
              phone: hospital.phone,
              address: hospital.address ?? "",
              city: hospital.city,
              state: hospital.state ?? "",
              zipCode: hospital.zipCode ?? "",
              country: hospital.country,
              status: hospital.status,
              verified: hospital.verified,
              doctorsCount: hospital.doctorsCount ?? 0,
              createdAt: hospital.createdAt,
            };
            return [
              exportHospital.id,
              `"${exportHospital.name.replace(/"/g, '""')}"`,
              `"${exportHospital.email.replace(/"/g, '""')}"`,
              `"${exportHospital.phone.replace(/"/g, '""')}"`,
              `"${exportHospital.address.replace(/"/g, '""')}"`,
              `"${exportHospital.city.replace(/"/g, '""')}"`,
              `"${exportHospital.state.replace(/"/g, '""')}"`,
              `"${exportHospital.zipCode.replace(/"/g, '""')}"`,
              `"${exportHospital.country.replace(/"/g, '""')}"`,
              exportHospital.status,
              exportHospital.verified,
              exportHospital.doctorsCount,
              exportHospital.createdAt,
            ].join(",");
          })
          .join("\n");
        const csvContent = `${headers}\n${rows}`;

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "etablissements_export.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Success",
          description: `${selectedRows.length} hospitals exported successfully`,
        });
      } catch (error) {
        console.error("Error exporting hospitals:", error);
        toast({
          title: "Error",
          description: "Failed to export hospitals",
          variant: "destructive",
        });
      }
    } else if (action === "verify") {
      try {
        for (const hospitalId of selectedRows) {
          await updateHospitalVerification(hospitalId, true);
        }

        toast({
          title: "Success",
          description: `${selectedRows.length} hospitals verified successfully`,
        });

        setRowSelection({});
        fetchHospitals();
      } catch (error) {
        console.error("Error verifying hospitals:", error);
        toast({
          title: "Error",
          description: "Failed to verify hospitals",
          variant: "destructive",
        });
      }
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

  // Toggle subscription selection
  const toggleSubscription = (subscription: string) => {
    if (selectedSubscriptions.includes(subscription)) {
      setSelectedSubscriptions(
        selectedSubscriptions.filter((s) => s !== subscription)
      );
    } else {
      setSelectedSubscriptions([...selectedSubscriptions, subscription]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocations([]);
    setSelectedStatuses([]);
    setSelectedSubscriptions([]);
    setStartDate("");
    setEndDate("");
  };

  // Function to handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchHospitals();
    fetchFilterOptions();
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
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestion des Établissements
          </h2>
          <p className="text-muted-foreground">
            Gérez les établissements de santé, vérifiez les profils et suivez
            leur activité
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
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Liste des établissements</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center p-4">
              <div className="flex-1">
                <CardTitle>Liste des Établissements</CardTitle>
                <CardDescription>
                  {hospitals.length} établissement
                  {hospitals.length !== 1 ? "s" : ""} trouvé
                  {hospitals.length !== 1 ? "s" : ""}
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
                            : "Aucun établissement trouvé."}
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
                  {Math.min(
                    totalHospitals,
                    (currentPage - 1) * itemsPerPage + 1
                  )}{" "}
                  à {Math.min(totalHospitals, currentPage * itemsPerPage)} sur{" "}
                  {totalHospitals} établissements
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
                Affichage de <strong>{hospitals.length}</strong> sur{" "}
                <strong>{totalHospitals}</strong> établissements
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
                      Total des établissements
                    </CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.totalHospitals}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +
                      {(
                        (analytics.newHospitals / analytics.totalHospitals) *
                        100
                      ).toFixed(0)}
                      % par rapport au mois dernier
                    </p>
                    <div className="mt-4">
                      <Progress
                        value={
                          (analytics.activeHospitals /
                            analytics.totalHospitals) *
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
                      Établissements actifs
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.activeHospitals}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (analytics.activeHospitals / analytics.totalHospitals) *
                        100
                      ).toFixed(1)}
                      % du total
                    </p>
                    <div className="mt-4">
                      <Progress
                        value={
                          (analytics.activeHospitals /
                            analytics.totalHospitals) *
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
                      Nouveaux établissements
                    </CardTitle>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.newHospitals}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Derniers 30 jours
                    </p>
                    <div className="mt-4">
                      <Progress
                        value={
                          (analytics.newHospitals / analytics.totalHospitals) *
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
                      Souscriptions
                    </CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-2xl font-bold">
                      {analytics.subscriptionsByPlan.reduce(
                        (acc, item) => acc + item?.count,
                        0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Plans d&apos;abonnement des établissements
                    </p>

                    <div className="space-y-2">
                      {analytics.subscriptionsByPlan.map((item, index) => {
                        const percentage =
                          (item.count / analytics.totalHospitals) * 100;
                        const colorHue = 200 + ((index * 30) % 160); // for variety

                        return (
                          <div
                            key={item.plan}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium">
                              {item.plan}
                            </span>
                            <div className="w-2/3">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: `hsl(${colorHue}, 70%, 60%)`,
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground ml-2">
                              {item.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Activité des établissements</CardTitle>
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
                              ? analytics.registrationsActivity[
                                  analytics.registrationsActivity.length - 1
                                ].count >
                                analytics.registrationsActivity[
                                  analytics.registrationsActivity.length - 2
                                ].count
                                ? "↗️ En hausse par rapport au mois précédent"
                                : "↘️ En baisse par rapport au mois précédent"
                              : "🚀 Nouvelle activité détectée, bientôt des tendances !"}
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
                      Distribution des établissements par ville
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
                          <div className="text-right">Établissements</div>
                        </div>

                        {analytics.geographicalDistribution
                          .sort((a, b) => b.count?.id - a.count?.id)
                          .map((region, index) => {
                            const percentage =
                              (region.count?.id / analytics.totalHospitals) *
                              100;
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
                                    {region.count.id}
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
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Filter Sheet */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="left" className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Filtres</SheetTitle>
            <SheetDescription>
              Affinez votre recherche d&apos;établissements
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 pr-4 mt-4">
            <div className="space-y-6 pb-6">
              {/* === Location === */}
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

              {/* === Status === */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Statut</h4>
                <div className="space-y-2">
                  {["ACTIVE", "INACTIVE", "PENDING"].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.toLowerCase()}`}
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={() => toggleStatus(status)}
                      />
                      <label
                        htmlFor={`status-${status.toLowerCase()}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {
                          {
                            ACTIVE: "Actif",
                            INACTIVE: "Inactif",
                            PENDING: "En attente",
                          }[status]
                        }
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* === Subscription === */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Abonnement</h4>
                <div className="space-y-2">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subscription-${plan}`}
                        checked={selectedSubscriptions.includes(plan)}
                        onCheckedChange={() => toggleSubscription(plan)}
                      />
                      <label
                        htmlFor={`subscription-${plan}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {plan}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* === Date Range === */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Période de création</h4>
                <div className="space-y-2">
                  <div>
                    <label
                      htmlFor="start-date"
                      className="text-sm font-medium leading-none"
                    >
                      Date de début
                    </label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="end-date"
                      className="text-sm font-medium leading-none"
                    >
                      Date de fin
                    </label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>

          <SheetFooter className="pt-4">
            <Button variant="outline" onClick={clearFilters}>
              Réinitialiser
            </Button>
            <Button onClick={() => setIsFilterOpen(false)}>
              Appliquer les filtres
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Hospital Details */}
      <HospitalDetails
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        hospital={selectedHospital}
        onEdit={openHospitalEdit}
        onDelete={openDeleteDialog}
        onStatusChange={handleStatusChange}
        onVerificationChange={handleVerificationChange}
        subscriptionPlans={subscriptionPlans}
      />

      {/* Hospital Create/Edit Modal */}
      <HospitalCreateEditModal
        isOpen={isAddHospitalOpen || isEditOpen}
        onClose={() => {
          setIsAddHospitalOpen(false);
          setIsEditOpen(false);
        }}
        mode={isAddHospitalOpen ? "create" : "edit"}
        hospital={selectedHospital}
        onSuccess={fetchHospitals}
      />

      {/* Hospital Delete Modal */}
      <HospitalDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        hospital={selectedHospital}
        onSuccess={fetchHospitals}
      />
    </div>
  );
}
