"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  format,
  parseISO,
  getHours,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isSameWeek,
} from "date-fns";
import { fr } from "date-fns/locale";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarClock,
  User,
  Stethoscope,
  Info,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Interface for a single appointment
interface Appointment {
  id: string;
  scheduledAt: string; // ISO 8601 string (e.g., "2024-06-20T10:00:00Z")
  status: string;
  patientName: string;
  patientId: string;
  day: string; // Day of the week in French (e.g., "lundi")
}

// Interface for a doctor's schedule, containing weekly appointments keyed by week string
interface DoctorSchedule {
  id: string;
  name: string;
  specialization: string;
  isActive: boolean;
  weeklyAppointments: {
    [week: string]: Appointment[]; // Keys are like "yyyy-'S'ww" (e.g., "2024-S24")
  };
}

// Constants for days of the week and working hours
const DAYS_OF_WEEK = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];
const WORKING_HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08h à 20h

export default function WeeklySchedule() {
  // State to store the fetched schedules for all doctors
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  // State for filtering by selected doctor (null for all doctors)
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  // State for filtering by selected day (null for all days)
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  // currentWeek is the primary Date object controlling the displayed week.
  // It's initialized to the current date.
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  // Loading state for data fetching
  const [loading, setLoading] = useState(true);
  // Error state for API call failures
  const [error, setError] = useState<string | null>(null);
  // State for the currently selected appointment to display in the modal
  const [selectedAppointment, setSelectedAppointment] = useState<
    (Appointment & { doctor: string }) | null
  >(null);
  // State to indicate if the week is currently changing (for loading spinner in buttons)
  const [isChangingWeek, setIsChangingWeek] = useState(false);
  //   const [togglingId, setTogglingId] = useState<string | null>(null);

  /**
   * Fetches doctor schedules from the API.
   * This function is memoized using useCallback to prevent unnecessary re-renders.
   */
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/hospital_admin/doctors/schedule", {
        params: { includeInactive: true, t: Date.now() }, // bust cache + recevoir isActive
      });
      const data: DoctorSchedule[] = response.data.doctors;
      setSchedules(data);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
      setError("Impossible de charger les plannings. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect hook to fetch schedules when the component mounts
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]); // Dependency array ensures it runs only when fetchSchedules changes (which is once due to useCallback)

  useEffect(() => {
    const onFocus = () => fetchSchedules();
    window.addEventListener("focus", onFocus);

    // (optionnel) rafraîchir toutes les 30s pendant que l’onglet est visible
    const id = setInterval(() => {
      if (document.visibilityState === "visible") fetchSchedules();
    }, 300000);

    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(id);
    };
  }, [fetchSchedules]);

  /**
   * Formats a given Date object into a readable week range string (e.g., "Semaine du 01 Janvier au 07 Janvier").
   * Uses 'fr' locale and sets Monday as the start of the week.
   */
  const formatWeekRange = (date: Date) => {
    const start = startOfWeek(date, { locale: fr, weekStartsOn: 1 }); // Monday is 1
    const end = endOfWeek(date, { locale: fr, weekStartsOn: 1 }); // Monday is 1
    return `Semaine du ${format(start, "dd MMMM", { locale: fr })} au ${format(end, "dd MMMM", { locale: fr })}`;
  };

  /**
   * Handles navigation between weeks (previous, next, or jump to today).
   * Updates the `currentWeek` state and shows a loading spinner briefly.
   */
  const handleWeekChange = (direction: "previous" | "next" | "today") => {
    setIsChangingWeek(true);
    // Simulate a small delay to show the loading spinner gracefully
    setTimeout(() => {
      switch (direction) {
        case "previous":
          setCurrentWeek(subWeeks(currentWeek, 1));
          break;
        case "next":
          setCurrentWeek(addWeeks(currentWeek, 1));
          break;
        case "today":
          setCurrentWeek(new Date());
          break;
      }
      setIsChangingWeek(false);
    }, 200); // 200ms delay
  };

  /**
   * Memoized computation of filtered schedules based on current filters.
   * This is the core logic for applying the week, doctor, and day filters.
   */
  const filteredSchedules = useMemo(() => {
    const weekKey = format(currentWeek, "RRRR-'S'II", { locale: fr });

    return schedules
      .filter((doc) =>
        selectedDoctor ? doc.id === selectedDoctor : doc.isActive
      ) // ← masque les inactifs en vue "Tous"
      .map((doc) => ({
        ...doc,
        schedule: (doc.weeklyAppointments[weekKey] || []).filter(
          (apt) => !selectedDay || apt.day === selectedDay
        ),
      }));
  }, [schedules, currentWeek, selectedDoctor, selectedDay]);

  /**
   * Memoized check to determine if there are any appointments in the filtered schedule.
   * Used to conditionally render the "No appointments found" message.
   */
  const hasAppointments = useMemo(() => {
    return filteredSchedules.some((doc) => doc.schedule.length > 0);
  }, [filteredSchedules]);

  /**
   * Callback function to set the selected appointment for modal display.
   * Memoized to prevent unnecessary re-creation.
   */
  const handleAppointmentClick = useCallback(
    (appointment: Appointment & { doctor: string }) => {
      setSelectedAppointment(appointment);
    },
    []
  );

  /**
   * Memoized list of days to display in the table header.
   * Shows all days if no specific day is selected, otherwise just the selected day.
   */
  const visibleDays = useMemo(() => {
    return selectedDay ? [selectedDay] : DAYS_OF_WEEK;
  }, [selectedDay]);

  /**
   * Translates appointment status codes to French human-readable strings.
   */
  const translateStatus = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmé";
      case "CANCELED":
        return "Annulé"; // Corrected typo here
      case "PENDING":
        return "En attente";
      case "COMPLETED":
        return "Terminé";
      default:
        return status;
    }
  };

  // Render error message if fetching schedules fails
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-4">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={fetchSchedules}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Filter controls section */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3 w-full">
          {/* Week navigation and display section */}
          <div className="space-y-1">
            <Label>Semaine</Label>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWeekChange("previous")}
                    disabled={loading || isChangingWeek}
                    className="px-2"
                  >
                    {isChangingWeek ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Semaine précédente</TooltipContent>
              </Tooltip>

              <div className="flex-1 text-center px-4 py-2 border rounded-md bg-muted/50">
                {formatWeekRange(currentWeek)}
                {!isSameWeek(currentWeek, new Date(), { weekStartsOn: 1 }) && ( // Check if currentWeek is not today's week
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-xs h-6"
                    onClick={() => handleWeekChange("today")}
                    disabled={loading || isChangingWeek}
                  >
                    renitialiser
                  </Button>
                )}
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWeekChange("next")}
                    disabled={loading || isChangingWeek}
                    className="px-2"
                  >
                    {isChangingWeek ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Semaine suivante</TooltipContent>
              </Tooltip>
            </div>
          </div>
          {/* Day selection filter */}
          <div className="space-y-1">
            <Label>Jour</Label>
            <Tabs
              value={selectedDay || ""}
              onValueChange={(val) => setSelectedDay(val || null)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 sm:grid-cols-8 w-full">
                <TabsTrigger value="" className="col-span-1">
                  Tous
                </TabsTrigger>
                {DAYS_OF_WEEK.map((day) => (
                  <TabsTrigger
                    key={day}
                    value={day}
                    className="text-xs sm:text-sm"
                  >
                    {day.substring(0, 3)}{" "}
                    {/* Display first 3 letters of the day */}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Conditional rendering based on loading state or existence of appointments */}
      {loading ? (
        // Skeleton loader when data is being fetched
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded" />
          <div className="grid grid-cols-8 gap-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-6 rounded" />
            ))}
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded" />
            ))}
          </div>
        </div>
      ) : !hasAppointments ? (
        // Message when no appointments are found for the current filters
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
          <p className="text-muted-foreground mb-2">
            Aucun rendez-vous trouvé pour cette semaine et ces filtres.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedDoctor(null); // Reset doctor filter
              setSelectedDay(null); // Reset day filter
              setCurrentWeek(new Date()); // Reset week to today
            }}
          >
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        // Main schedule table display
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 border-r w-24 text-center">Heure</th>
                {visibleDays.map((day) => (
                  <th key={day} className="p-2 border-r text-center capitalize">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WORKING_HOURS.map((hour) => (
                <tr key={hour}>
                  <td className="p-2 border-r text-center font-medium bg-muted/50">
                    {`${hour}:00`}
                  </td>
                  {visibleDays.map((day) => {
                    // Filter appointments for the specific hour and day within the currently filtered schedules
                    const appointmentsForCell = filteredSchedules.flatMap(
                      (doc) =>
                        doc.schedule
                          .filter((apt) => {
                            const aptDate = parseISO(apt.scheduledAt);
                            // Ensure the appointment's week matches the current display week
                            const aptWeekKey = format(aptDate, "RRRR-'S'II", {
                              locale: fr,
                            });
                            const currentDisplayWeekKey = format(
                              currentWeek,
                              "RRRR-'S'II",
                              { locale: fr }
                            );

                            return (
                              aptWeekKey === currentDisplayWeekKey &&
                              format(aptDate, "EEEE", {
                                locale: fr,
                              }).toLowerCase() === day &&
                              getHours(aptDate) === hour
                            );
                          })
                          .map((apt) => ({
                            ...apt,
                            doctor: doc.name, // Add doctor's name to appointment for display
                          }))
                    );

                    return (
                      <td
                        key={day + hour}
                        className="border-r p-1 align-top min-w-[150px]"
                      >
                        <div className="space-y-1">
                          {appointmentsForCell.map((apt) => (
                            <div
                              key={apt.id}
                              onClick={() => handleAppointmentClick(apt)}
                              className={`rounded p-2 text-xs cursor-pointer transition border
                                    ${
                                      apt.status.toLowerCase() === "confirmed"
                                        ? "bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-900 dark:hover:bg-green-800 dark:border-green-700"
                                        : apt.status.toLowerCase() ===
                                            "canceled" // Corrected typo here
                                          ? "bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-900 dark:hover:bg-red-800 dark:border-red-700"
                                          : apt.status.toLowerCase() ===
                                              "completed"
                                            ? "bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 dark:border-blue-700"
                                            : "bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600"
                                    }
                                `}
                            >
                              <div className="font-medium truncate text-foreground">
                                {apt.patientName}
                              </div>
                              <div className="text-muted-foreground truncate">
                                {apt.doctor}
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {format(parseISO(apt.scheduledAt), "HH:mm")}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`
                                                                        text-xs px-1.5 py-0.5 border
                                                                        ${
                                                                          apt.status.toLowerCase() ===
                                                                          "confirmed"
                                                                            ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-800 dark:text-green-100 dark:border-green-600"
                                                                            : apt.status.toLowerCase() ===
                                                                                "canceled" // Corrected typo here
                                                                              ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600"
                                                                              : apt.status.toLowerCase() ===
                                                                                  "completed"
                                                                                ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-600"
                                                                                : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500"
                                                                        }
                                                                    `}
                                >
                                  {translateStatus(apt.status)}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Appointment details modal */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          open={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}

// Separate component for the Appointment Details Modal
const AppointmentModal = React.memo(function AppointmentModal({
  appointment,
  open,
  onClose,
}: {
  appointment: Appointment & { doctor: string };
  open: boolean;
  onClose: () => void;
}) {
  // Determine badge styling based on appointment status
  const statusVariant =
    {
      confirmed: "bg-green-100 text-green-800",
      canceled: "bg-red-100 text-red-800", // Corrected typo here for consistency
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
    }[appointment.status.toLowerCase()] || "bg-gray-100 text-gray-800";

  // Translates appointment status codes to French human-readable strings.
  const translateStatus = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmé";
      case "CANCELED":
        return "Annulé";
      case "PENDING":
        return "En attente";
      case "COMPLETED":
        return "Terminé";
      default:
        return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg">Détails du rendez-vous</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {/* Appointment Date and Time */}
          <div className="flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-medium">
                {/* Display full date with day, month, and year */}
                {format(
                  parseISO(appointment.scheduledAt),
                  "EEEE dd MMMM yyyy",
                  { locale: fr }
                )}
              </p>
              <p className="text-muted-foreground">
                {/* Display time */}
                {format(parseISO(appointment.scheduledAt), "HH:mm", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>
          {/* Patient Information */}
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Patient</p>
              <p className="text-muted-foreground">{appointment.patientName}</p>
            </div>
          </div>
          {/* Doctor Information */}
          <div className="flex items-center gap-3">
            <Stethoscope className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Médecin</p>
              <p className="text-muted-foreground">{appointment.doctor}</p>
            </div>
          </div>
          {/* Appointment Status */}
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <p className="font-medium">Statut</p>
              <Badge variant="outline" className={statusVariant}>
                {translateStatus(appointment.status)}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
