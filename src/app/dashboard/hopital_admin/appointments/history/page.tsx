"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { format, isWithinInterval, parseISO } from "date-fns";
import {
  CalendarDays,
  User,
  Stethoscope,
  Mail,
  Phone,
  Clock,
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
import { toast } from "@/hooks/use-toast";
import { AppointmentStatus } from "@prisma/client";
import { EventClickArg } from "@fullcalendar/core";
import { fr } from "date-fns/locale";

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
    "bg-green-200 text-green-900 dark:bg-green-800/30 dark:text-green-300",
  PENDING:
    "bg-yellow-200 text-yellow-900 dark:bg-yellow-800/30 dark:text-yellow-300",
  CANCELED: "bg-red-200 text-red-900 dark:bg-red-800/30 dark:text-red-300",
  COMPLETED: "bg-blue-200 text-blue-900 dark:bg-blue-800/30 dark:text-blue-300",
  NO_SHOW: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  DEFAULT: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
} as const;

const STATUS_TRANSLATIONS = {
  CONFIRMED: "Confirmé",
  CANCELED: "Annulé",
  PENDING: "En attente",
  COMPLETED: "Terminé",
  NO_SHOW: "Non présenté",
} as const;

export default function AppointmentCalendarView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(true);
  const [calendarView, setCalendarView] = useState<
    "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  >("timeGridWeek");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hospital_admin/appointment/list");
      if (!res.ok) throw new Error("Failed to fetch appointments");

      const data = await res.json();
      setAppointments(data.appointments || []);
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
  }, [fetchAppointments]);

  const formatDateRange = useCallback(
    (range: DateRange | undefined): string => {
      if (!range?.from || !range?.to) return "Période spécifique";
      return `${format(range.from, "dd/MM/yyyy")} - ${format(range.to, "dd/MM/yyyy")}`;
    },
    []
  );

  const filteredAppointments = useMemo(() => {
    let result = [...appointments];

    if (selectedDoctor !== "all") {
      result = result.filter((a) => a.doctor.id === selectedDoctor);
    }

    if (dateRange?.from && dateRange?.to) {
      result = result.filter((a) =>
        isWithinInterval(parseISO(a.scheduledAt), {
          start: dateRange.from!,
          end: dateRange.to!,
        })
      );
    }

    return result;
  }, [selectedDoctor, dateRange, appointments]);

  const doctorOptions = useMemo(() => {
    const doctorsMap = new Map<string, Doctor>();
    appointments.forEach((a) => {
      if (!doctorsMap.has(a.doctor.id)) {
        doctorsMap.set(a.doctor.id, a.doctor);
      }
    });
    return Array.from(doctorsMap.values());
  }, [appointments]);

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
    <div className="p-2 sm:p-4 space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="border-b p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold">
              Agenda des rendez-vous
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAppointments()}
              >
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 p-2 sm:p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filtrer par médecin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les médecins</SelectItem>
                {doctorOptions.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialization})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[250px] justify-start text-left font-normal"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {formatDateRange(dateRange)}
                  {dateRange?.from && dateRange?.to && (
                    <Badge variant="secondary" className="ml-2">
                      Filtre actif
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
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

          {loading ? (
            <div className="grid gap-4">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-[600px] w-full rounded-md" />
            </div>
          ) : (
            <div className="rounded-lg border bg-card shadow-sm">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={calendarView}
                locale={frLocale}
                events={filteredAppointments.map((appt) => ({
                  id: appt.id,
                  title: `${appt.patient.name}`,
                  start: appt.scheduledAt,
                  extendedProps: { appointment: appt },
                  className: STATUS_COLORS[appt.status],
                }))}
                eventClick={handleEventClick}
                height={700}
                slotMinTime="07:00:00"
                slotMaxTime="20:00:00"
                headerToolbar={{
                  start: "prev,next today",
                  center:
                    dateRange?.from && dateRange?.to ? "customTitle" : "title",
                  end: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                customButtons={{
                  customTitle: {
                    text:
                      dateRange?.from && dateRange?.to
                        ? formatDateRange(dateRange)
                        : "", // sinon vide, car le `title` s'affiche tout seul
                    click: () => {}, // bouton non cliquable
                  },
                }}
                titleFormat={
                  dateRange?.from && dateRange?.to
                    ? { year: "numeric", month: "short" } // quelque chose de neutre ou court
                    : { year: "numeric", month: "long" }
                }
                views={{
                  dayGridMonth: { buttonText: "Mois" },
                  timeGridWeek: { buttonText: "Semaine" },
                  timeGridDay: { buttonText: "Jour" },
                }}
                buttonText={{
                  today: "Aujourd'hui",
                }}
                eventClassNames="cursor-pointer hover:opacity-90 transition-opacity"
                dayHeaderClassNames="bg-muted text-muted-foreground font-medium"
                dayCellClassNames="hover:bg-muted/50"
                viewDidMount={(info) => handleViewChange(info.view.type)}
                nowIndicator
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedAppointment}
        onOpenChange={() => setSelectedAppointment(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Informations patient
                </h3>
                <div className="pl-6 space-y-1 text-sm">
                  <p>
                    <strong>Nom :</strong> {selectedAppointment.patient.name}
                  </p>
                  <p className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {selectedAppointment.patient.email}
                  </p>
                  <p className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {selectedAppointment.patient.phone}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Informations consultation
                </h3>
                <div className="pl-6 space-y-1 text-sm">
                  <p className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(selectedAppointment.scheduledAt), "PPpp", {
                      locale: fr,
                    })}
                  </p>
                  <p>
                    <strong>Motif :</strong> {selectedAppointment.reason}
                  </p>
                  <p>
                    <strong>Type :</strong> {selectedAppointment.type}
                  </p>
                  <p>
                    <strong>Médecin :</strong> {selectedAppointment.doctor.name}{" "}
                    ({selectedAppointment.doctor.specialization})
                  </p>
                  <p className="flex items-center gap-2">
                    <strong>Statut :</strong>
                    <Badge
                      className={STATUS_COLORS[selectedAppointment.status]}
                    >
                      {STATUS_TRANSLATIONS[selectedAppointment.status]}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
