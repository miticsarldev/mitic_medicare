"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import {
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  CalendarDays,
  User,
  Stethoscope,
  Mail,
  Phone,
  Clock,
  RefreshCw,
  Filter,
  Eye,
  Calendar as CalendarIcon,
  Activity,
  Users,
  CheckCircle,
  XCircle,
  Clock3,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { AppointmentStatus } from "@prisma/client";
import { EventClickArg } from "@fullcalendar/core";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getSpecializationLabel } from "@/utils/function";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
}

interface Patient {
  id: string;
  name: string;
  gender: string;
  email: string;
  phone: string;
  bloodType: string;
  allergies: string;
  medicalNotes: string;
}

interface Appointment {
  id: string;
  scheduledAt: string;
  status: AppointmentStatus;
  reason: string;
  type: string;
  doctor: Doctor;
  patient: Patient;
}

const STATUS_COLORS = {
  CONFIRMED:
    "!bg-emerald-500 !border-emerald-600 !text-white dark:!bg-emerald-600 dark:!border-emerald-700 dark:!text-emerald-50",
  PENDING:
    "!bg-amber-500 !border-amber-600 !text-white dark:!bg-amber-600 dark:!border-amber-700 dark:!text-amber-50",
  CANCELED:
    "!bg-red-500 !border-red-600 !text-white dark:!bg-red-600 dark:!border-red-700 dark:!text-red-50",
  COMPLETED:
    "!bg-blue-500 !border-blue-600 !text-white dark:!bg-blue-600 dark:!border-blue-700 dark:!text-blue-50",
  NO_SHOW:
    "!bg-gray-500 !border-gray-600 !text-white dark:!bg-gray-600 dark:!border-gray-700 dark:!text-gray-50",
} as const;

const STATUS_TRANSLATIONS = {
  CONFIRMED: "Confirmé",
  CANCELED: "Annulé",
  PENDING: "En attente",
  COMPLETED: "Terminé",
  NO_SHOW: "Absence",
} as const;

const STATUS_ICONS = {
  CONFIRMED: CheckCircle,
  PENDING: Clock3,
  CANCELED: XCircle,
  COMPLETED: Activity,
  NO_SHOW: XCircle,
} as const;

export default function AppointmentCalendarView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(true);
  const [calendarView, setCalendarView] = useState<
    "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  >("timeGridWeek");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">(
    "ALL"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
    canceled: 0,
  });
  const [isMobile, setIsMobile] = useState(false);
  const formatDateRange = useCallback(
    (range: DateRange | undefined): string => {
      if (!range?.from || !range?.to) return "Période spécifique";
      return `${format(range.from, "dd/MM/yyyy")} - ${format(range.to, "dd/MM/yyyy")}`;
    },
    []
  );

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hospital_doctor/appointments/list");
      if (!res.ok) throw new Error("Failed to fetch appointments");

      const data = await res.json();
      const appointmentsData = data.appointments || [];
      setAppointments(appointmentsData);

      // Calculate stats
      const stats = {
        total: appointmentsData.length,
        confirmed: appointmentsData.filter(
          (a: Appointment) => a.status === "CONFIRMED"
        ).length,
        pending: appointmentsData.filter(
          (a: Appointment) => a.status === "PENDING"
        ).length,
        completed: appointmentsData.filter(
          (a: Appointment) => a.status === "COMPLETED"
        ).length,
        canceled: appointmentsData.filter(
          (a: Appointment) => a.status === "CANCELED"
        ).length,
      };
      setStats(stats);
    } catch (err) {
      console.error("Error loading appointments:", err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rendez-vous",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments, dateRange]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Set default view based on screen size
  useEffect(() => {
    if (isMobile && calendarView === "timeGridWeek") {
      setCalendarView("dayGridMonth");
    }
  }, [isMobile, calendarView]);

  const filteredAppointments = useMemo(() => {
    let result = [...appointments];

    // Filter by status
    if (statusFilter !== "ALL") {
      result = result.filter((a) => a.status === statusFilter);
    }

    // Filter by date range
    if (dateRange?.from && dateRange?.to) {
      result = result.filter((a) =>
        isWithinInterval(parseISO(a.scheduledAt), {
          start: startOfDay(dateRange.from!),
          end: endOfDay(dateRange.to!),
        })
      );
    }

    return result;
  }, [statusFilter, dateRange, appointments]);

  const handleEventClick = useCallback((info: EventClickArg) => {
    const appt = info.event.extendedProps.appointment as Appointment;
    setSelectedAppointment(appt);
  }, []);

  const handleViewChange = useCallback((view: string) => {
    if (
      view === "dayGridMonth" ||
      view === "timeGridWeek" ||
      view === "timeGridDay"
    ) {
      setCalendarView(view);
    }
  }, []);

  return (
    <div className="container mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
            <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Agenda des rendez-vous
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gérez votre planning de consultations
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtres</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAppointments()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Confirmés
                </p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.confirmed}
                </p>
              </div>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  En attente
                </p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.pending}
                </p>
              </div>
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                <Clock3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Terminés
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.completed}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Annulés
                </p>
                <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.canceled}
                </p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-dashed">
          <CardContent className="p-">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Période
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {dateRange?.from && dateRange?.to
                        ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
                        : "Sélectionner une période"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      locale={fr}
                      className="rounded-md border"
                    />
                    <div className="p-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setDateRange(undefined)}
                      >
                        Effacer la sélection
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Statut</label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as AppointmentStatus | "ALL")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous les statuts</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmés</SelectItem>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="COMPLETED">Terminés</SelectItem>
                    <SelectItem value="CANCELED">Annulés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card className="">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
              <Skeleton className="h-[600px] w-full rounded-md" />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[320px] rounded-lg border bg-card shadow-sm overflow-hidden">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView={calendarView}
                  locale={frLocale}
                  events={filteredAppointments.map((appt) => {
                    const statusColors: Record<
                      AppointmentStatus,
                      { bg: string; border: string; text: string }
                    > = {
                      CONFIRMED: {
                        bg: "rgb(16, 185, 129)",
                        border: "rgb(5, 150, 105)",
                        text: "white",
                      },
                      PENDING: {
                        bg: "rgb(245, 158, 11)",
                        border: "rgb(217, 119, 6)",
                        text: "white",
                      },
                      CANCELED: {
                        bg: "rgb(239, 68, 68)",
                        border: "rgb(220, 38, 38)",
                        text: "white",
                      },
                      COMPLETED: {
                        bg: "rgb(59, 130, 246)",
                        border: "rgb(37, 99, 235)",
                        text: "white",
                      },
                      NO_SHOW: {
                        bg: "rgb(156, 163, 175)",
                        border: "rgb(107, 114, 128)",
                        text: "white",
                      },
                    };

                    const colors = statusColors[appt.status];

                    return {
                      id: appt.id,
                      title: `${appt.patient.name}`,
                      start: appt.scheduledAt,
                      extendedProps: { appointment: appt },
                      className: cn(
                        "cursor-pointer transition-all shadow-sm font-medium text-xs",
                        STATUS_COLORS[appt.status]
                      ),
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      textColor: "white",
                      color: "white",
                      display: "block",
                      style: {
                        color: "white",
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                      },
                    };
                  })}
                  eventClick={handleEventClick}
                  height="auto"
                  slotMinTime="07:00:00"
                  slotMaxTime="20:00:00"
                  headerToolbar={
                    isMobile
                      ? {
                          start: "prev,next",
                          center: "title",
                          end: "today",
                        }
                      : {
                          start: "prev,next today",
                          center:
                            dateRange?.from && dateRange?.to
                              ? "customTitle"
                              : "title",
                          end: "dayGridMonth,timeGridWeek,timeGridDay",
                        }
                  }
                  customButtons={{
                    customTitle: {
                      text:
                        dateRange?.from && dateRange?.to
                          ? formatDateRange(dateRange)
                          : "",
                      click: () => {},
                    },
                  }}
                  views={{
                    dayGridMonth: {
                      buttonText: "Mois",
                      dayMaxEvents: 2,
                      moreLinkClick: "popover",
                    },
                    timeGridWeek: {
                      buttonText: "Semaine",
                      dayMaxEvents: 3,
                      moreLinkClick: "popover",
                    },
                    timeGridDay: {
                      buttonText: "Jour",
                      dayMaxEvents: 4,
                      moreLinkClick: "popover",
                    },
                  }}
                  buttonText={{
                    today: "Aujourd'hui",
                  }}
                  viewDidMount={(info) => handleViewChange(info.view.type)}
                  nowIndicator
                  eventDisplay="block"
                  eventTimeFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }}
                  allDaySlot={false}
                  slotDuration="00:30:00"
                  slotLabelInterval="01:00:00"
                  dayMaxEvents={2}
                  moreLinkClick="popover"
                  eventMaxStack={2}
                  dayMaxEventRows={2}
                  eventShortHeight={20}
                  eventMinHeight={20}
                  eventContent={(arg) => {
                    const appointment = arg.event.extendedProps?.appointment;
                    const statusColors = {
                      CONFIRMED: "rgb(16, 185, 129)",
                      PENDING: "rgb(245, 158, 11)",
                      CANCELED: "rgb(239, 68, 68)",
                      COMPLETED: "rgb(59, 130, 246)",
                      NO_SHOW: "rgb(156, 163, 175)",
                    };

                    const bgColor = appointment
                      ? statusColors[appointment.status]
                      : "rgb(59, 130, 246)";

                    return {
                      html: `<div class="fc-event-main" style="color: white !important; background-color: ${bgColor} !important;">
                        <div class="fc-event-title-container" style="color: white !important;">
                          <div class="fc-event-title" style="color: white !important; font-weight: 500; font-size: 0.75rem;">${arg.event.title}</div>
                        </div>
                      </div>`,
                    };
                  }}
                />
              </div>
            </div>
          )}

          {/* Mobile View Selector */}
          {isMobile && (
            <div className="mt-4 flex justify-center">
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <Button
                  variant={
                    calendarView === "dayGridMonth" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setCalendarView("dayGridMonth")}
                  className="text-xs"
                >
                  Mois
                </Button>
                <Button
                  variant={
                    calendarView === "timeGridWeek" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setCalendarView("timeGridWeek")}
                  className="text-xs"
                >
                  Semaine
                </Button>
                <Button
                  variant={calendarView === "timeGridDay" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCalendarView("timeGridDay")}
                  className="text-xs"
                >
                  Jour
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog
        open={!!selectedAppointment}
        onOpenChange={() => setSelectedAppointment(null)}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Détails du rendez-vous
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Patient Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informations patient
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Nom complet
                      </p>
                      <p className="text-sm">
                        {selectedAppointment.patient.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Genre
                      </p>
                      <p className="text-sm">
                        {selectedAppointment.patient.gender}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedAppointment.patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedAppointment.patient.phone}</span>
                  </div>
                  {selectedAppointment.patient.bloodType && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Groupe sanguin
                      </p>
                      <Badge variant="outline">
                        {selectedAppointment.patient.bloodType}
                      </Badge>
                    </div>
                  )}
                  {selectedAppointment.patient.allergies && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Allergies
                      </p>
                      <p className="text-sm">
                        {selectedAppointment.patient.allergies}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Appointment Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Informations consultation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(
                        new Date(selectedAppointment.scheduledAt),
                        "EEEE dd MMMM yyyy à HH:mm",
                        { locale: fr }
                      )}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Motif de consultation
                    </p>
                    <p className="text-sm">{selectedAppointment.reason}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Type de consultation
                    </p>
                    <p className="text-sm">{selectedAppointment.type}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Médecin
                    </p>
                    <p className="text-sm">
                      {selectedAppointment.doctor.name} -{" "}
                      {getSpecializationLabel(selectedAppointment.doctor.specialization)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Statut :
                    </p>
                    <Badge
                      className={cn(
                        "gap-1",
                        STATUS_COLORS[selectedAppointment.status]
                      )}
                    >
                      {React.createElement(
                        STATUS_ICONS[selectedAppointment.status],
                        { className: "h-3 w-3" }
                      )}
                      {STATUS_TRANSLATIONS[selectedAppointment.status]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Notes */}
              {selectedAppointment.patient.medicalNotes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Notes médicales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.patient.medicalNotes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
