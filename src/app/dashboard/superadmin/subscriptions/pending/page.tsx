"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  Download,
  Filter,
  Search,
  Trash2,
  Mail,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import {
  SortingState,
  VisibilityState,
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
  CardHeader,
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
import { toast } from "@/hooks/use-toast";
import SubscriptionDetailsModal from "@/components/superadmin/subscription/subscription-details";
import SubscriptionCreateEditModal from "@/components/superadmin/subscription/subscription-create-edit-modal";
import SubscriptionDeleteModal from "@/components/superadmin/subscription/subscription-delete-modal";
import { useSubscriptionColumns } from "@/components/superadmin/subscription/subscription-columns";
import type { Subscription } from "@/types/subscription";

// Define allowed sort fields
type SortField = "id" | "startDate" | "endDate" | "amount" | "paymentDate" | "subscriberName" | "plan" | "status";

export default function PendingPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubscriberType, setSelectedSubscriberType] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionModalMode, setSubscriptionModalMode] = useState<"create" | "edit">("create");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<SortField>("paymentDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([{ id: "paymentDate", desc: true }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const openSubscriptionDetail = async (subscription: Subscription) => {
    try {
      const response = await fetch(`/api/superadmin/subscriptions/${subscription.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch subscription details");
      }
      const subscriptionDetails = await response.json();
      setSelectedSubscription(subscriptionDetails);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les détails de l'abonnement",
        variant: "destructive",
      });
    }
  };

  const openSubscriptionEdit = async (subscription: Subscription) => {
    try {
      const response = await fetch(`/api/superadmin/subscriptions/${subscription.id}`);
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
        title: "Erreur",
        description: "Impossible de récupérer les détails de l'abonnement",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDeleteDialogOpen(true);
  };

  const columns = useSubscriptionColumns({
    openSubscriptionDetail,
    openSubscriptionEdit,
    openDeleteDialog,
  });

  const table = useReactTable({
    data: subscriptions,
    columns,
    onSortingChange: (updatedSorting) => {
      setSorting(updatedSorting);
      if (Array.isArray(updatedSorting) && updatedSorting.length > 0) {
        const column = updatedSorting[0].id as SortField;
        const direction = updatedSorting[0].desc ? "desc" : "asc";
        setSortBy(column);
        setSortOrder(direction);
      } else {
        setSortBy("paymentDate");
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
      const queryParams = new URLSearchParams({
        search: searchQuery,
        subscriberType: selectedSubscriberType,
        plan: selectedPlan,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
      });
      const response = await fetch(`/api/superadmin/subscriptions/pending-payments?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions with pending payments");
      }
      const data = await response.json();
      setSubscriptions(data.subscriptions);
      setTotalSubscriptions(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching subscriptions with pending payments:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les abonnements avec paiements en attente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedSubscriberType, selectedPlan, currentPage, itemsPerPage, sortBy, sortOrder]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleBulkAction = async (action: string) => {
    const selectedRows = Object.keys(rowSelection).map(
      (index) => subscriptions[Number.parseInt(index)].id
    );
    if (selectedRows.length === 0) {
      toast({
        title: "Info",
        description: "Aucun abonnement sélectionné",
      });
      return;
    }
    if (action === "approve") {
      try {
        const response = await fetch("/api/superadmin/subscriptions/bulk-approve-payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: selectedRows }),
        });
        if (!response.ok) {
          throw new Error("Failed to approve payments");
        }
        toast({
          title: "Succès",
          description: `${selectedRows.length} paiements approuvés avec succès`,
        });
        setRowSelection({});
        fetchSubscriptions();
      } catch (error) {
        console.error("Error approving payments:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'approuver les paiements",
          variant: "destructive",
        });
      }
    } else if (action === "delete") {
      try {
        const response = await fetch("/api/superadmin/subscriptions/bulk-delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: selectedRows }),
        });
        if (!response.ok) {
          throw new Error("Failed to delete subscriptions");
        }
        toast({
          title: "Succès",
          description: `${selectedRows.length} abonnements supprimés avec succès`,
        });
        setRowSelection({});
        fetchSubscriptions();
      } catch (error) {
        console.error("Error bulk deleting subscriptions:", error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer les abonnements",
          variant: "destructive",
        });
      }
    } else if (action === "export") {
      try {
        const response = await fetch("/api/superadmin/subscriptions/bulk-export", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: selectedRows }),
        });
        if (!response.ok) {
          throw new Error("Failed to export subscriptions");
        }
        const data = await response.json();
        if (data?.subscriptions) {
          const headers = Object.keys(data.subscriptions[0]).join(",");
          const rows = data.subscriptions
            .map((subscription: Subscription) =>
              Object.values(subscription)
                .map((value) =>
                  typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
                )
                .join(",")
            )
            .join("\n");
          const csvContent = `${headers}\n${rows}`;
          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", "pending_payments_export.csv");
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast({
            title: "Succès",
            description: `${selectedRows.length} abonnements exportés avec succès`,
          });
        }
      } catch (error) {
        console.error("Error exporting subscriptions:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'exporter les abonnements",
          variant: "destructive",
        });
      }
    } else if (action === "email") {
      toast({
        title: "Info",
        description: `La fonctionnalité d'envoi d'email serait implémentée ici pour ${selectedRows.length} abonnements`,
      });
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Paiements en attente</h2>
          <p className="text-muted-foreground">
            Gérez les abonnements avec des paiements en attente de validation
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleBulkAction("export")}>
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
        </div>
      </div>

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
                    onCheckedChange={() => setSelectedSubscriberType("DOCTOR")}
                  >
                    Médecin
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedSubscriberType === "HOSPITAL"}
                    onCheckedChange={() => setSelectedSubscriberType("HOSPITAL")}
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
                    <DropdownMenuItem onClick={() => handleBulkAction("approve")}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Approuver
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("export")}>
                      <Download className="mr-2 h-4 w-4" /> Exporter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("email")}>
                      <Mail className="mr-2 h-4 w-4" /> Envoyer un email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleBulkAction("delete")}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Supprimer
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
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-6">
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
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-6">
                      Aucun paiement en attente trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Affichage de{" "}
              {Math.min(totalSubscriptions, (currentPage - 1) * itemsPerPage + 1)}{" "}
              à {Math.min(totalSubscriptions, currentPage * itemsPerPage)} sur{" "}
              {totalSubscriptions} abonnements avec paiements en attente
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
                      variant={pageNumber === currentPage ? "default" : "outline"}
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

      <SubscriptionDetailsModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        subscription={selectedSubscription}
        onEdit={openSubscriptionEdit}
      />

      <SubscriptionCreateEditModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        mode={subscriptionModalMode}
        subscription={selectedSubscription}
        onSuccess={fetchSubscriptions}
      />

      <SubscriptionDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        subscription={selectedSubscription}
        onSuccess={fetchSubscriptions}
      />
    </div>
  );
}