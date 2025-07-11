"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  Check,
  Clock,
  Download,
  Filter,
  Search,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
// Add the pagination component imports
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { filterAppointments, getAppointmentsData } from "./actions";
import type {
  AppointmentsData,
  AppointmentWithRelations,
  FilterOptions,
  PaginationOptions,
} from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppointmentsTableProps {
  initialData: AppointmentsData;
}

// Update the AppointmentsTable component to include pagination
export function AppointmentsTable({ initialData }: AppointmentsTableProps) {
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>(
    initialData.appointments
  );
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithRelations | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationOptions>(
    initialData.pagination
  );
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: "ALL",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    searchQuery: "",
    doctorId: null,
    hospitalId: null,
    specialization: null,
  });

  // Get unique specializations from appointments
  const specializations = Array.from(
    new Set(
      initialData.appointments.map(
        (appointment) => appointment.doctor.specialization
      )
    )
  ).sort();

  // Get unique doctors from appointments
  const doctors = Array.from(
    new Map(
      initialData.appointments.map((appointment) => [
        appointment.doctorId,
        {
          id: appointment.doctorId,
          name: appointment.doctor.user.name,
        },
      ])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Get unique hospitals from appointments
  const hospitals = Array.from(
    new Map(
      initialData.appointments
        .filter((appointment) => appointment.doctor.hospital)
        .map((appointment) => [
          appointment.doctor.hospital!.id,
          {
            id: appointment.doctor.hospital!.id,
            name: appointment.doctor.hospital!.name,
          },
        ])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleViewDetails = (appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const handleFilterChange = async () => {
    setIsLoading(true);
    try {
      const result = await filterAppointments(
        filterOptions.status,
        filterOptions.dateRange.from
          ? format(filterOptions.dateRange.from, "yyyy-MM-dd")
          : null,
        filterOptions.dateRange.to
          ? format(filterOptions.dateRange.to, "yyyy-MM-dd")
          : null,
        filterOptions.searchQuery,
        filterOptions.doctorId,
        filterOptions.hospitalId,
        filterOptions.specialization,
        1, // Reset to first page when filtering
        pagination.pageSize
      );
      setAppointments(result.appointments);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error filtering appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setFilterOptions({
      status: "ALL",
      dateRange: {
        from: undefined,
        to: undefined,
      },
      searchQuery: "",
      doctorId: null,
      hospitalId: null,
      specialization: null,
    });
    setAppointments(initialData.appointments);
    setPagination(initialData.pagination);
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    setIsLoading(true);
    try {
      // If filters are applied, use filterAppointments
      if (
        filterOptions.status !== "ALL" ||
        filterOptions.dateRange.from ||
        filterOptions.dateRange.to ||
        filterOptions.searchQuery ||
        filterOptions.doctorId ||
        filterOptions.hospitalId ||
        filterOptions.specialization
      ) {
        const result = await filterAppointments(
          filterOptions.status,
          filterOptions.dateRange.from
            ? format(filterOptions.dateRange.from, "yyyy-MM-dd")
            : null,
          filterOptions.dateRange.to
            ? format(filterOptions.dateRange.to, "yyyy-MM-dd")
            : null,
          filterOptions.searchQuery,
          filterOptions.doctorId,
          filterOptions.hospitalId,
          filterOptions.specialization,
          newPage,
          pagination.pageSize
        );
        setAppointments(result.appointments);
        setPagination(result.pagination);
      } else {
        // Otherwise, use getAppointmentsData
        const result = await getAppointmentsData(newPage, pagination.pageSize);
        setAppointments(result.appointments);
        setPagination(result.pagination);
      }

      // Update URL without refreshing the page
      const url = new URL(window.location.href);
      url.searchParams.set("page", newPage.toString());
      window.history.pushState({}, "", url.toString());
    } catch (error) {
      console.error("Error changing page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageSizeChange = async (newPageSize: number) => {
    setIsLoading(true);
    try {
      // If filters are applied, use filterAppointments
      if (
        filterOptions.status !== "ALL" ||
        filterOptions.dateRange.from ||
        filterOptions.dateRange.to ||
        filterOptions.searchQuery ||
        filterOptions.doctorId ||
        filterOptions.hospitalId ||
        filterOptions.specialization
      ) {
        const result = await filterAppointments(
          filterOptions.status,
          filterOptions.dateRange.from
            ? format(filterOptions.dateRange.from, "yyyy-MM-dd")
            : null,
          filterOptions.dateRange.to
            ? format(filterOptions.dateRange.to, "yyyy-MM-dd")
            : null,
          filterOptions.searchQuery,
          filterOptions.doctorId,
          filterOptions.hospitalId,
          filterOptions.specialization,
          1, // Reset to first page when changing page size
          newPageSize
        );
        setAppointments(result.appointments);
        setPagination(result.pagination);
      } else {
        // Otherwise, use getAppointmentsData
        const result = await getAppointmentsData(1, newPageSize);
        setAppointments(result.appointments);
        setPagination(result.pagination);
      }

      // Update URL without refreshing the page
      const url = new URL(window.location.href);
      url.searchParams.set("page", "1");
      url.searchParams.set("pageSize", newPageSize.toString());
      window.history.pushState({}, "", url.toString());
    } catch (error) {
      console.error("Error changing page size:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-800">En attente</Badge>
        );
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Complété</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  const handleExport = async (appointment: AppointmentWithRelations) => {
  try {
    const response = await fetch(`/api/appointments/export/${appointment.id}`, {
      method: "GET", // ou POST si vous préférez envoyer l'ID dans le corps
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Échec de l'exportation du rendez-vous");
    }

    const data = await response.json();

    // Formatage des données pour le CSV
    const exportData = [{
      id: data.id,
      patientName: data.patient.user.name,
      patientEmail: data.patient.user.email,
      patientPhone: data.patient.user.phone || "Non renseigné",
      doctorName: data.doctor.user.name,
      specialization: data.doctor.specialization,
      hospitalName: data.doctor.hospital?.name || "Médecin indépendant",
      scheduledAt: format(new Date(data.scheduledAt), "dd/MM/yyyy HH:mm", { locale: fr }),
      endTime: data.endTime ? format(new Date(data.endTime), "dd/MM/yyyy HH:mm", { locale: fr }) : "Non défini",
      status: data.status,
      reason: data.reason || "Non renseigné",
      type: data.type || "Consultation standard",
      notes: data.notes || "Aucune note",
      createdAt: format(new Date(data.createdAt), "dd/MM/yyyy HH:mm", { locale: fr }),
      updatedAt: format(new Date(data.updatedAt), "dd/MM/yyyy HH:mm", { locale: fr }),
      completedAt: data.completedAt ? format(new Date(data.completedAt), "dd/MM/yyyy HH:mm", { locale: fr }) : "N/A",
      cancelledAt: data.cancelledAt ? format(new Date(data.cancelledAt), "dd/MM/yyyy HH:mm", { locale: fr }) : "N/A",
      cancellationReason: data.cancellationReason || "N/A",
    }];

    // Créer le contenu CSV
    const headers = Object.keys(exportData[0]).join(",");
    const rows = exportData
      .map((item) =>
        Object.values(item)
          .map((value) =>
            typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          )
          .join(",")
      )
      .join("\n");
    const csvContent = `${headers}\n${rows}`;

    // Créer le lien de téléchargement
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `appointment_${appointment.id}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Succès",
      description: "Rendez-vous exporté avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'exportation:", error);
    toast({
      title: "Erreur",
      description: "Échec de l'exportation du rendez-vous",
      variant: "destructive",
    });
  }
};

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items: JSX.Element[] = [];
    const { page, totalPages } = pagination;

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={page === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (page > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show current page and surrounding pages
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (page < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Liste des rendez-vous</CardTitle>
          <CardDescription>
            {pagination.totalItems} rendez-vous trouvés, affichage de{" "}
            {Math.min(
              pagination.totalItems,
              (pagination.page - 1) * pagination.pageSize + 1
            )}{" "}
            à{" "}
            {Math.min(
              pagination.totalItems,
              pagination.page * pagination.pageSize
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par patient ou médecin..."
                  className="pl-10"
                  value={filterOptions.searchQuery}
                  onChange={(e) =>
                    setFilterOptions({
                      ...filterOptions,
                      searchQuery: e.target.value,
                    })
                  }
                />
              </div>

              <Select
                value={filterOptions.status}
                onValueChange={(value) =>
                  setFilterOptions({
                    ...filterOptions,
                    status: value as FilterOptions["status"],
                  })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="COMPLETED">Complétés</SelectItem>
                  <SelectItem value="CANCELLED">Annulés</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterOptions.dateRange.from ? (
                      filterOptions.dateRange.to ? (
                        <>
                          {format(filterOptions.dateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(filterOptions.dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(filterOptions.dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Sélectionner une période</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={{
                      from: filterOptions.dateRange.from,
                      to: filterOptions.dateRange.to,
                    }}
                    onSelect={(range) =>
                      setFilterOptions({
                        ...filterOptions,
                        dateRange: {
                          from: range?.from,
                          to: range?.to,
                        },
                      })
                    }
                    numberOfMonths={2}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
              <Select
                value={filterOptions.specialization || ""}
                onValueChange={(value) =>
                  setFilterOptions({
                    ...filterOptions,
                    specialization: value || null,
                  })
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Spécialisation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_SPECIALIZATIONS">
                    Toutes les spécialisations
                  </SelectItem>
                  {specializations.map((specialization) => (
                    <SelectItem key={specialization} value={specialization}>
                      {specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterOptions.doctorId || ""}
                onValueChange={(value) =>
                  setFilterOptions({
                    ...filterOptions,
                    doctorId: value || null,
                  })
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Médecin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_DOCTORS">Tous les médecins</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterOptions.hospitalId || ""}
                onValueChange={(value) =>
                  setFilterOptions({
                    ...filterOptions,
                    hospitalId: value || null,
                  })
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Hôpital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_HOSPITALS">
                    Tous les hôpitaux
                  </SelectItem>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
              <Button onClick={handleFilterChange} disabled={isLoading}>
                <Filter className="mr-2 h-4 w-4" />
                Filtrer
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Aucun rendez-vous trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                appointment.patient.user?.profile?.avatarUrl ||
                                "/placeholder.svg?height=32&width=32"
                              }
                              alt={appointment.patient.user.name}
                            />
                            <AvatarFallback>
                              {getInitials(appointment.patient.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {appointment.patient.user.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {appointment.patient.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getInitials(appointment.doctor.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {appointment.doctor.user.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {appointment.doctor.specialization}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {format(
                            new Date(appointment.scheduledAt),
                            "dd MMM yyyy",
                            { locale: fr }
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(appointment.scheduledAt), "HH:mm", {
                            locale: fr,
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {appointment.scheduledAt && appointment.endTime ? (
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                            <span>
                              {format(
                                new Date(appointment.scheduledAt),
                                "HH:mm",
                                { locale: fr }
                              )}{" "}
                              -{" "}
                              {format(new Date(appointment.endTime), "HH:mm", {
                                locale: fr,
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Non défini
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(appointment.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(appointment)}
                            >
                              Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(appointment)}>
                              <Download className="mr-2 h-4 w-4" />
                              Exporter
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

          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Afficher</span>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) =>
                  handlePageSizeChange(Number.parseInt(value))
                }
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pagination.pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">par page</span>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(pagination.page - 1)}
                    isActive={pagination.page > 1}
                    aria-disabled={pagination.page <= 1}
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(pagination.page + 1)}
                    isActive={pagination.page < pagination.totalPages}
                    aria-disabled={pagination.page >= pagination.totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <ScrollArea className="h-[80vh] w-full pr-2">
            {selectedAppointment && (
              <>
                <DialogHeader>
                  <DialogTitle>Détails du rendez-vous</DialogTitle>
                  <DialogDescription>
                    Informations détaillées sur le rendez-vous
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 flex flex-col items-center md:flex-row md:items-start">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={
                          selectedAppointment.patient.user.profile?.avatarUrl ||
                          "/placeholder.svg?height=80&width=80"
                        }
                        alt={selectedAppointment.patient.user.name}
                      />
                      <AvatarFallback className="text-lg">
                        {getInitials(selectedAppointment.patient.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="mt-2 text-center">
                      <h3 className="font-medium">
                        {selectedAppointment.patient.user.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">Patient</p>
                    </div>
                  </div>

                  <div className="mt-4 flex-1 md:ml-6 md:mt-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">Rendez-vous médical</h3>
                      {getStatusBadge(selectedAppointment.status)}
                    </div>
                    <p className="text-muted-foreground">
                      {format(
                        new Date(selectedAppointment.scheduledAt),
                        "EEEE dd MMMM yyyy 'à' HH:mm",
                        { locale: fr }
                      )}
                    </p>
                    <div className="mt-2">
                      {selectedAppointment.scheduledAt &&
                        selectedAppointment.endTime && (
                          <Badge variant="outline" className="mr-2">
                            <Clock className="mr-1 h-3 w-3" />
                            {format(
                              new Date(selectedAppointment.scheduledAt),
                              "HH:mm",
                              { locale: fr }
                            )}{" "}
                            -{" "}
                            {format(
                              new Date(selectedAppointment.endTime),
                              "HH:mm",
                              { locale: fr }
                            )}
                          </Badge>
                        )}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-medium">
                      Informations du patient
                    </h4>
                    <div className="space-y-2 rounded-lg border p-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Nom
                        </span>
                        <span className="font-medium">
                          {selectedAppointment.patient.user.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Email
                        </span>
                        <span className="font-medium">
                          {selectedAppointment.patient.user.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Téléphone
                        </span>
                        <span className="font-medium">
                          {selectedAppointment.patient.user.phone ||
                            "Non renseigné"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium">
                      Informations du médecin
                    </h4>
                    <div className="space-y-2 rounded-lg border p-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Nom
                        </span>
                        <span className="font-medium">
                          {selectedAppointment.doctor.user.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Spécialisation
                        </span>
                        <span className="font-medium">
                          {selectedAppointment.doctor.specialization}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Hôpital
                        </span>
                        <span className="font-medium">
                          {selectedAppointment.doctor.hospital?.name ||
                            "Médecin indépendant"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="mb-2 font-medium">Détails du rendez-vous</h4>
                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Motif
                      </span>
                      <span className="font-medium">
                        {selectedAppointment.reason || "Non renseigné"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Type
                      </span>
                      <span className="font-medium">
                        {selectedAppointment.type || "Consultation standard"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Notes
                      </span>
                      <span className="font-medium">
                        {selectedAppointment.notes || "Aucune note"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Créé le
                      </span>
                      <span className="font-medium">
                        {format(
                          new Date(selectedAppointment.createdAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: fr }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Dernière mise à jour
                      </span>
                      <span className="font-medium">
                        {format(
                          new Date(selectedAppointment.updatedAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: fr }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedAppointment.status === "COMPLETED" && (
                  <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        Rendez-vous complété
                      </span>
                    </div>
                    {selectedAppointment.completedAt && (
                      <p className="mt-1 text-sm text-green-700">
                        Complété le{" "}
                        {format(
                          new Date(selectedAppointment.completedAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: fr }
                        )}
                      </p>
                    )}
                  </div>
                )}

                {selectedAppointment.status === "CANCELED" && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-center">
                      <X className="mr-2 h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">
                        Rendez-vous annulé
                      </span>
                    </div>
                    {selectedAppointment.cancelledAt && (
                      <p className="mt-1 text-sm text-red-700">
                        Annulé le{" "}
                        {format(
                          new Date(selectedAppointment.cancelledAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: fr }
                        )}
                      </p>
                    )}
                    {selectedAppointment.cancellationReason && (
                      <p className="mt-1 text-sm text-red-700">
                        Raison: {selectedAppointment.cancellationReason}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
