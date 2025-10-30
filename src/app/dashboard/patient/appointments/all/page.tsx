"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Plus,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  MapPin,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  getPatientAppointments,
  cancelAppointment,
  getPatientAppointmentStats,
} from "../../actions";
import { AppointmentStatus } from "@prisma/client";

export type PatientAppointment = {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  doctorAvatar?: string | null;
  hospitalId?: string | null;
  hospitalName?: string | null;
  hospitalAddress?: string | null;
  scheduledAt: Date;
  startTime?: Date | null;
  endTime?: Date | null;
  status: AppointmentStatus;
  type?: string | null;
  reason?: string | null;
  notes?: string | null;
  createdAt: Date;
};

export type PatientAppointmentResponse = {
  appointments: PatientAppointment[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
};

export default function AppointmentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    canceled: 0,
    noShow: 0,
  });

  const [appointments, setAppointments] = useState<PatientAppointmentResponse>({
    appointments: [],
    pagination: { total: 0, pages: 1, page: 1, limit: 5 },
  });
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(
    null
  );
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNotes, setCancelNotes] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();

  // Fetch stats based on active tab
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getPatientAppointmentStats(
          activeTab as "upcoming" | "past"
        );
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [activeTab]);

  // Fetch appointments based on current filters
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const result = await getPatientAppointments({
          status: statusFilter as AppointmentStatus | AppointmentStatus[],
          search: searchQuery,
          page: currentPage,
          limit: 5,
          time: activeTab === "upcoming" ? "upcoming" : "past",
        });

        setAppointments(result);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast({
          title: "Erreur",
          description:
            "Impossible de charger vos rendez-vous. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [activeTab, searchQuery, statusFilter, currentPage, toast]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    setStatusFilter(null);
    setSearchQuery("");
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (status: AppointmentStatus | null) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle cancel appointment
  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    setIsCancelling(true);
    try {
      const result = await cancelAppointment({
        id: appointmentToCancel,
        reason: cancelReason,
        notes: cancelNotes,
      });

      if (result.success) {
        toast({
          title: "Rendez-vous annulé",
          description: "Votre rendez-vous a été annulé avec succès.",
        });

        setActiveTab("past");
        setCurrentPage(1);
        setStatusFilter(null);
        setSearchQuery("");

        const updatedResult = await getPatientAppointments({
          status: ["COMPLETED", "CANCELED", "NO_SHOW"] as AppointmentStatus[],
          search: "",
          page: 1,
          limit: 5,
          time: "past",
        });

        setAppointments(updatedResult);
      } else {
        toast({
          title: "Erreur",
          description:
            result.error ||
            "Impossible d'annuler le rendez-vous. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de l'annulation du rendez-vous.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
      setCancelReason("");
      setCancelNotes("");
    }
  };

  // Open cancel dialog
  const openCancelDialog = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setCancelDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mes Rendez-vous</h2>
          <p className="text-muted-foreground">
            Consultez et gérez vos rendez-vous médicaux
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <Link href="/dashboard/patient/appointments/book">
            Prendre un rendez-vous
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total"
          value={stats.total}
          icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
        />
        <StatCard
          title="En attente"
          value={stats.pending}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
        />
        <StatCard
          title="Confirmés"
          value={stats.confirmed}
          icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
          className="border-blue-200 bg-blue-50 dark:bg-blue-950/20"
        />
        <StatCard
          title="Terminés"
          value={stats.completed}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          className="border-green-200 bg-green-50 dark:bg-green-950/20"
        />
        <StatCard
          title="Annulés"
          value={stats.canceled}
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          className="border-red-200 bg-red-50 dark:bg-red-950/20"
        />
        <StatCard
          title="Absents"
          value={stats.noShow}
          icon={<AlertCircle className="h-5 w-5 text-orange-600" />}
          className="border-orange-200 bg-orange-50 dark:bg-orange-950/20"
        />
      </div>

      <Tabs
        defaultValue="upcoming"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full mb-6 gap-2">
          <TabsTrigger
            value="upcoming"
            className="text-sm md:text-base text-center justify-center"
          >
            <span className="hidden sm:flex">Rendez-vous à venir</span>
            <span className="flex sm:hidden">RDV à venir</span>
            {!isLoading &&
              activeTab === "upcoming" &&
              appointments.pagination.total > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {appointments.pagination.total}
                </Badge>
              )}
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="text-sm md:text-base text-center justify-center"
          >
            Historique
            {!isLoading &&
              activeTab === "past" &&
              appointments.pagination.total > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {appointments.pagination.total}
                </Badge>
              )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Prochains Rendez-vous</CardTitle>
                  <CardDescription>
                    Vos rendez-vous médicaux à venir
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Rechercher..."
                      className="pl-8 w-full sm:w-[200px] lg:w-[250px]"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuItem
                        onClick={() => handleStatusFilter(null)}
                      >
                        Tous les rendez-vous
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusFilter("CONFIRMED")}
                      >
                        Confirmés uniquement
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusFilter("PENDING")}
                      >
                        En attente uniquement
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 rounded-lg border p-4"
                    >
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 max-w-[200px]" />
                        <Skeleton className="h-3 max-w-[150px]" />
                        <Skeleton className="h-3 max-w-[100px]" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-5 max-w-[80px]" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 max-w-[80px]" />
                          <Skeleton className="h-8 max-w-[80px]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : appointments.appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.appointments.map(
                    (appointment: PatientAppointment) => (
                      <Card
                        key={appointment.id}
                        className="transition-all hover:shadow-md border-2"
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-14 w-14 border-2 border-primary/20">
                                <AvatarImage
                                  src={
                                    appointment.doctorAvatar ||
                                    `/placeholder.svg?height=56&width=56`
                                  }
                                  alt={appointment.doctorName}
                                  className="object-contain"
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {appointment.doctorName
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <h4 className="font-semibold text-lg">
                                    {appointment.doctorName}
                                  </h4>
                                  <Badge
                                    variant={
                                      appointment.status === "CONFIRMED"
                                        ? "default"
                                        : "outline"
                                    }
                                    className={cn(
                                      "ml-auto",
                                      appointment.status === "CONFIRMED"
                                        ? "bg-green-500 hover:bg-green-600 text-white border-green-600"
                                        : "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600"
                                    )}
                                  >
                                    {appointment.status === "CONFIRMED"
                                      ? "Confirmé"
                                      : "En attente"}
                                  </Badge>
                                </div>
                                {appointment.hospitalName && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="line-clamp-1">
                                      {appointment.hospitalName}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">
                                    {new Date(
                                      appointment.scheduledAt
                                    ).toLocaleDateString("fr-FR", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}{" "}
                                    à{" "}
                                    {new Date(
                                      appointment.scheduledAt
                                    ).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                {appointment.reason && (
                                  <p className="mt-2 text-sm text-foreground/80 bg-muted/50 rounded-md p-2">
                                    <span className="font-medium">Motif:</span>{" "}
                                    {appointment.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 sm:flex-col w-full sm:w-auto">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Actions
                                  </Button>
                                </DropdownMenuTrigger>
                                {/* <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/dashboard/patient/appointments/${appointment.id}`}
                                  >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Voir les détails
                                  </Link>
                                </DropdownMenuItem>
                                {appointment.status !== "COMPLETED" && (
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/dashboard/patient/appointments/reschedule/${appointment.id}`}
                                    >
                                      <Calendar className="mr-2 h-4 w-4" />
                                      Reprogrammer
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent> */}
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/dashboard/patient/appointments/${appointment.id}`}
                                    >
                                      <FileText className="mr-2 h-4 w-4" />
                                      Voir les détails
                                    </Link>
                                  </DropdownMenuItem>
                                  {/* Pas de reprogrammation dans l’historique */}
                                </DropdownMenuContent>
                              </DropdownMenu>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openCancelDialog(appointment.id)}
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">
                    Aucun rendez-vous à venir
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground max-w-md">
                    {searchQuery || statusFilter
                      ? "Aucun rendez-vous ne correspond à votre recherche. Essayez d'autres critères."
                      : "Vous n'avez pas de rendez-vous planifiés pour le moment. Prenez rendez-vous avec un médecin pour commencer."}
                  </p>
                  {!searchQuery && !statusFilter && (
                    <Button asChild>
                      <Link href="/dashboard/patient/appointments/book">
                        <Plus className="mr-2 h-4 w-4" />
                        Prendre un Rendez-vous
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
            {!isLoading && appointments.pagination.pages > 1 && (
              <CardFooter className="flex justify-center border-t pt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={
                          currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {Array.from(
                      { length: Math.min(appointments.pagination.pages, 5) },
                      (_, i) => {
                        const pageNumber = i + 1;
                        const isCurrentPage = pageNumber === currentPage;

                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              href="#"
                              isActive={isCurrentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNumber);
                              }}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    )}

                    {appointments.pagination.pages > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < appointments.pagination.pages)
                            setCurrentPage(currentPage + 1);
                        }}
                        className={
                          currentPage >= appointments.pagination.pages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Historique des Rendez-vous</CardTitle>
                  <CardDescription>
                    Vos rendez-vous médicaux passés
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Rechercher..."
                      className="pl-8 w-full sm:w-[200px] lg:w-[250px]"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuItem
                        onClick={() => handleStatusFilter(null)}
                      >
                        Tous les rendez-vous
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusFilter("COMPLETED")}
                      >
                        Terminés uniquement
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusFilter("CANCELED")}
                      >
                        Annulés uniquement
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusFilter("NO_SHOW")}
                      >
                        Non présentés uniquement
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row items-start gap-4 rounded-lg border p-1 sm:p-4"
                    >
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 max-w-[200px]" />
                        <Skeleton className="h-3 max-w-[150px]" />
                        <Skeleton className="h-3 max-w-[100px]" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-5 max-w-[80px]" />
                        <Skeleton className="h-8 max-w-[80px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : appointments.appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.appointments.map(
                    (appointment: PatientAppointment) => (
                      <Card
                        key={appointment.id}
                        className="transition-all hover:shadow-md border-2"
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-14 w-14 border-2 border-primary/20">
                                <AvatarImage
                                  src={
                                    appointment.doctorAvatar ||
                                    `/placeholder.svg?height=56&width=56`
                                  }
                                  alt={appointment.doctorName}
                                  className="object-contain"
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {appointment.doctorName
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <h4 className="font-semibold text-lg">
                                    {appointment.doctorName}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "ml-auto",
                                      appointment.status === "COMPLETED"
                                        ? "bg-green-500 hover:bg-green-600 text-white border-green-600"
                                        : appointment.status === "CANCELED"
                                          ? "bg-red-500 hover:bg-red-600 text-white border-red-600"
                                          : "bg-orange-500 hover:bg-orange-600 text-white border-orange-600"
                                    )}
                                  >
                                    <span className="flex items-center">
                                      {appointment.status === "COMPLETED" ? (
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                      ) : appointment.status === "CANCELED" ? (
                                        <XCircle className="mr-1 h-3 w-3" />
                                      ) : (
                                        <AlertCircle className="mr-1 h-3 w-3" />
                                      )}
                                      {appointment.status === "COMPLETED"
                                        ? "Terminé"
                                        : appointment.status === "CANCELED"
                                          ? "Annulé"
                                          : "Non présenté"}
                                    </span>
                                  </Badge>
                                </div>
                                {appointment.hospitalName && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="line-clamp-1">
                                      {appointment.hospitalName}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">
                                    {new Date(
                                      appointment.scheduledAt
                                    ).toLocaleDateString("fr-FR", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}{" "}
                                    à{" "}
                                    {new Date(
                                      appointment.scheduledAt
                                    ).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                {appointment.reason && (
                                  <p className="mt-2 text-sm text-foreground/80 bg-muted/50 rounded-md p-2">
                                    <span className="font-medium">Motif:</span>{" "}
                                    {appointment.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 sm:flex-col w-full sm:w-auto">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Actions
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/dashboard/patient/appointments/${appointment.id}`}
                                    >
                                      <FileText className="mr-2 h-4 w-4" />
                                      Voir les détails
                                    </Link>
                                  </DropdownMenuItem>
                                  {appointment.status !== "COMPLETED" && (
                                    <DropdownMenuItem asChild>
                                      <Link
                                        href={`/dashboard/patient/appointments/reschedule/${appointment.id}`}
                                      >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Reprendre rendez-vous
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">
                    Aucun rendez-vous passé
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {searchQuery || statusFilter
                      ? "Aucun rendez-vous ne correspond à votre recherche. Essayez d'autres critères."
                      : "Votre historique de rendez-vous est vide. Une fois que vous aurez eu des rendez-vous, ils apparaîtront ici."}
                  </p>
                </div>
              )}
            </CardContent>
            {!isLoading && appointments.pagination.pages > 1 && (
              <CardFooter className="flex justify-center border-t pt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={
                          currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {Array.from(
                      { length: Math.min(appointments.pagination.pages, 5) },
                      (_, i) => {
                        const pageNumber = i + 1;
                        const isCurrentPage = pageNumber === currentPage;

                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              href="#"
                              isActive={isCurrentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNumber);
                              }}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    )}

                    {appointments.pagination.pages > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < appointments.pagination.pages)
                            setCurrentPage(currentPage + 1);
                        }}
                        className={
                          currentPage >= appointments.pagination.pages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Appointment Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler le rendez-vous</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler votre rendez-vous ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Motif d&apos;annulation</p>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un motif" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unavailable">
                    Je ne suis pas disponible
                  </SelectItem>
                  <SelectItem value="feeling-better">
                    Je me sens mieux
                  </SelectItem>
                  <SelectItem value="reschedule">
                    Je souhaite reprogrammer
                  </SelectItem>
                  <SelectItem value="other">Autre raison</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Commentaire (optionnel)</p>
              <Input
                placeholder="Précisez la raison de l'annulation"
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isCancelling}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={!cancelReason || isCancelling}
            >
              {isCancelling
                ? "Annulation en cours..."
                : "Confirmer l'annulation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// StatCard component
function StatCard({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
