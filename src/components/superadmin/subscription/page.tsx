"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  Download,
  Filter,
  Plus,
  Search,
  Trash2,
  Mail,
  ChevronLeft,
  ChevronRight,
  Building,
  User,
  CreditCard,
  RefreshCw,
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
  DropdownMenuItem,
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
import { Progress } from "@/components/ui/progress";
import SubscriptionDetailsModal from "./subscription-details";
import SubscriptionCreateEditModal from "./subscription-create-edit-modal";
import SubscriptionDeleteModal from "./subscription-delete-modal";
import type { Subscription } from "@/types/subscription";
import { useSubscriptionColumns } from "./subscription-columns";
import { SubscriptionAnalyticsType } from "@/types";

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSubscriberType, setSelectedSubscriberType] =
    useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionModalMode, setSubscriptionModalMode] = useState<
    "create" | "edit"
  >("create");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>("startDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<SubscriptionAnalyticsType | null>(
    null
  );
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const openSubscriptionDetail = async (subscription: Subscription) => {
    try {
      const response = await fetch(
        `/api/superadmin/subscriptions/${subscription.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscription details");
      }

      const subscriptionDetails = await response.json();
      setSelectedSubscription(subscriptionDetails);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription details",
        variant: "destructive",
      });
    }
  };

  const openSubscriptionCreate = () => {
    setSelectedSubscription(null);
    setSubscriptionModalMode("create");
    setIsSubscriptionModalOpen(true);
  };

  const openSubscriptionEdit = async (subscription: Subscription) => {
    try {
      const response = await fetch(
        `/api/superadmin/subscriptions/${subscription.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscription details");
      }

      const subscriptionDetails = await response.json();
      setSelectedSubscription(subscriptionDetails);
      setSubscriptionModalMode("edit");
      setIsSubscriptionModalOpen(true);
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription details",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDeleteDialogOpen(true);
  };

  // Get table columns using our custom hook
  const columns = useSubscriptionColumns({
    openSubscriptionDetail,
    openSubscriptionEdit,
    openDeleteDialog,
  });

  console.log(analytics);

  const table = useReactTable({
    data: subscriptions,
    columns,
    onSortingChange: (updatedSorting) => {
      setSorting(updatedSorting);
      if (Array.isArray(updatedSorting) && updatedSorting.length > 0) {
        const column = updatedSorting[0].id;
        const direction = updatedSorting[0].desc ? "desc" : "asc";

        // Map column id to API sortBy parameter
        let apiSortBy = column;
        if (column === "subscriberName") apiSortBy = "subscriberName";
        else if (column === "plan") apiSortBy = "plan";
        else if (column === "status") apiSortBy = "status";
        else if (column === "startDate") apiSortBy = "startDate";
        else if (column === "endDate") apiSortBy = "endDate";
        else if (column === "amount") apiSortBy = "amount";

        setSortBy(apiSortBy);
        setSortOrder(direction);
      } else {
        // Default sorting when cleared
        setSortBy("startDate");
        setSortOrder("desc");
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

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/superadmin/subscriptions?search=${searchQuery}&status=${selectedStatus}&subscriberType=${selectedSubscriberType}&plan=${selectedPlan}&page=${currentPage}&limit=${itemsPerPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions);
      setTotalSubscriptions(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subscriptions data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    selectedStatus,
    selectedSubscriberType,
    selectedPlan,
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
  ]);

  // Fetch subscriptions data
  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/superadmin/subscriptions/analytics");

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

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    const selectedRows = Object.keys(rowSelection).map(
      (index) => subscriptions[Number.parseInt(index)].id
    );

    if (selectedRows.length === 0) {
      toast({
        title: "Info",
        description: "No subscriptions selected",
      });
      return;
    }

    if (action === "delete") {
      try {
        const response = await fetch(
          "/api/superadmin/subscriptions/bulk-delete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: selectedRows }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete subscriptions");
        }

        toast({
          title: "Success",
          description: `${selectedRows.length} subscriptions deleted successfully`,
        });

        setRowSelection({});
        fetchSubscriptions();
      } catch (error) {
        console.error("Error bulk deleting subscriptions:", error);
        toast({
          title: "Error",
          description: "Failed to delete subscriptions",
          variant: "destructive",
        });
      }
    } else if (action === "export") {
      try {
        const response = await fetch(
          "/api/superadmin/subscriptions/bulk-export",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: selectedRows }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to export subscriptions");
        }

        const data = await response.json();

        // Create CSV content
        if (data?.subscriptions) {
          const headers = Object.keys(data.subscriptions[0]).join(",");
          const rows = data.subscriptions
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((subscription: any) =>
              Object.values(subscription)
                .map((value) =>
                  typeof value === "string"
                    ? `"${value.replace(/"/g, '""')}"`
                    : value
                )
                .join(",")
            )
            .join("\n");
          const csvContent = `${headers}\n${rows}`;

          // Create download link
          const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", "subscriptions_export.csv");
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast({
            title: "Success",
            description: `${selectedRows.length} subscriptions exported successfully`,
          });
        }
      } catch (error) {
        console.error("Error exporting subscriptions:", error);
        toast({
          title: "Error",
          description: "Failed to export subscriptions",
          variant: "destructive",
        });
      }
    } else if (action === "email") {
      // In a real app, this would open an email composer or send emails
      toast({
        title: "Info",
        description: `Email functionality would be implemented here for ${selectedRows.length} subscriptions`,
      });
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gestion des Abonnements
          </h2>
          <p className="text-muted-foreground">
            Gérez les abonnements, consultez leurs informations et suivez les
            paiements
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={openSubscriptionCreate}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un abonnement
          </Button>
          <Button variant="outline" onClick={() => handleBulkAction("export")}>
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Liste des abonnements</TabsTrigger>
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
                      placeholder="Rechercher un abonnement..."
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
                        checked={selectedStatus === "ACTIVE"}
                        onCheckedChange={() => setSelectedStatus("ACTIVE")}
                      >
                        Actif
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedStatus === "INACTIVE"}
                        onCheckedChange={() => setSelectedStatus("INACTIVE")}
                      >
                        Inactif
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedStatus === "TRIAL"}
                        onCheckedChange={() => setSelectedStatus("TRIAL")}
                      >
                        Essai
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedStatus === "EXPIRED"}
                        onCheckedChange={() => setSelectedStatus("EXPIRED")}
                      >
                        Expiré
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Filtrer par type</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={selectedSubscriberType === "all"}
                        onCheckedChange={() => setSelectedSubscriberType("all")}
                      >
                        Tous les types
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedSubscriberType === "DOCTOR"}
                        onCheckedChange={() =>
                          setSelectedSubscriberType("DOCTOR")
                        }
                      >
                        Médecin
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedSubscriberType === "HOSPITAL"}
                        onCheckedChange={() =>
                          setSelectedSubscriberType("HOSPITAL")
                        }
                      >
                        Hôpital
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Filtrer par plan</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={selectedPlan === "all"}
                        onCheckedChange={() => setSelectedPlan("all")}
                      >
                        Tous les plans
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedPlan === "FREE"}
                        onCheckedChange={() => setSelectedPlan("FREE")}
                      >
                        Gratuit
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedPlan === "STANDARD"}
                        onCheckedChange={() => setSelectedPlan("STANDARD")}
                      >
                        Standard
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={selectedPlan === "PREMIUM"}
                        onCheckedChange={() => setSelectedPlan("PREMIUM")}
                      >
                        Premium
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
                        <DropdownMenuItem
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
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleBulkAction("delete")}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
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
                          Aucun abonnement trouvé
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
                    totalSubscriptions,
                    (currentPage - 1) * itemsPerPage + 1
                  )}{" "}
                  à {Math.min(totalSubscriptions, currentPage * itemsPerPage)}{" "}
                  sur {totalSubscriptions} abonnements
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
                      Total des abonnements
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.totalSubscriptions}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +
                      {(
                        (analytics.newSubscriptions /
                          analytics.totalSubscriptions) *
                        100
                      ).toFixed(0)}
                      % par rapport au mois dernier
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Abonnements actifs
                    </CardTitle>
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.activeSubscriptions}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (analytics.activeSubscriptions /
                          analytics.totalSubscriptions) *
                        100
                      ).toFixed(1)}
                      % du total
                    </p>
                    <div className="mt-1">
                      <Progress
                        value={
                          (analytics.activeSubscriptions /
                            analytics.totalSubscriptions) *
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
                      Abonnements médecins
                    </CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.doctorSubscriptions}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (analytics.doctorSubscriptions /
                          analytics.totalSubscriptions) *
                        100
                      ).toFixed(1)}
                      % du total
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Abonnements hôpitaux
                    </CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.hospitalSubscriptions}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (analytics.hospitalSubscriptions /
                          analytics.totalSubscriptions) *
                        100
                      ).toFixed(1)}
                      % du total
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenus mensuels</CardTitle>
                    <CardDescription>
                      Tendances des revenus sur les 6 derniers mois
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {analytics &&
                    analytics.revenueByMonth &&
                    analytics.revenueByMonth.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">
                              Tendance globale
                            </h4>
                            <p className="text-2xl font-bold">
                              {analytics.revenueByMonth.reduce(
                                (sum, item) => sum + item.amount,
                                0
                              )}{" "}
                              XOF
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block h-3 w-3 rounded-full bg-primary`}
                            ></span>
                            <span className="text-sm text-muted-foreground">
                              Revenu mensuel
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {analytics.revenueByMonth.map((item, index) => (
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
                                      width: `${(item.amount / Math.max(...analytics.revenueByMonth.map((i) => i.amount))) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex items-center justify-end">
                                <span className="text-sm font-medium">
                                  {item.amount} XOF
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground">
                            {analytics.revenueByMonth.length >= 2
                              ? analytics.revenueByMonth[
                                  analytics.revenueByMonth.length - 1
                                ].amount >
                                analytics.revenueByMonth[
                                  analytics.revenueByMonth.length - 2
                                ].amount
                                ? "↗️ En hausse par rapport au mois précédent"
                                : "↘️ En baisse par rapport au mois précédent"
                              : "💰 Les premiers revenus sont là, la dynamique commence !"}
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
                    <CardTitle>Distribution des plans</CardTitle>
                    <CardDescription>
                      Répartition des abonnements par plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {analytics &&
                    analytics.subscriptionsByPlan &&
                    analytics.subscriptionsByPlan.length > 0 ? (
                      <div className="space-y-4 overflow-auto max-h-[250px] pr-2">
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 font-medium text-sm">
                          <div>Plan</div>
                          <div>Distribution</div>
                          <div className="text-right">Abonnements</div>
                        </div>

                        {analytics.subscriptionsByPlan
                          .sort((a, b) => b.count - a.count)
                          .map((plan, index) => {
                            const percentage =
                              (plan.count / analytics.totalSubscriptions) * 100;
                            const hue = 200 + ((index * 20) % 160); // Generate different colors

                            return (
                              <div
                                key={index}
                                className="grid grid-cols-[auto_1fr_auto] items-center gap-4"
                              >
                                <div className="font-medium">{plan.plan}</div>
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
                                    {plan.count}
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
                            {analytics.subscriptionsByPlan.length} plans
                            disponibles
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

      {/* Subscription Detail Modal */}
      <SubscriptionDetailsModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        subscription={selectedSubscription}
        onEdit={openSubscriptionEdit}
      />

      {/* Combined Subscription Modal for Create/Edit */}
      <SubscriptionCreateEditModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        mode={subscriptionModalMode}
        subscription={selectedSubscription}
        onSuccess={fetchSubscriptions}
      />

      {/* Delete Confirmation Dialog */}
      <SubscriptionDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        subscription={selectedSubscription}
        onSuccess={fetchSubscriptions}
      />
    </div>
  );
}
