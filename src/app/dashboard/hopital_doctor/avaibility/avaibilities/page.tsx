"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Clock,
  Calendar,
  Timer,
  Users,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DoctorAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
  maxPatientsPerSlot?: number;
  createdAt: string;
  updatedAt: string;
}

const DAYS = [
  {
    name: "Dimanche",
    short: "Dim",
    color:
      "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    icon: "🌅",
  },
  {
    name: "Lundi",
    short: "Lun",
    color:
      "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    icon: "💼",
  },
  {
    name: "Mardi",
    short: "Mar",
    color:
      "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    icon: "🌱",
  },
  {
    name: "Mercredi",
    short: "Mer",
    color:
      "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    icon: "☀️",
  },
  {
    name: "Jeudi",
    short: "Jeu",
    color:
      "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200",
    icon: "💜",
  },
  {
    name: "Vendredi",
    short: "Ven",
    color:
      "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200",
    icon: "🎯",
  },
  {
    name: "Samedi",
    short: "Sam",
    color:
      "bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800 text-pink-800 dark:text-pink-200",
    icon: "🎉",
  },
];

export default function DoctorAvailabilitiesPage() {
  const [availabilities, setAvailabilities] = useState<DoctorAvailability[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSlots: 0,
    activeDays: 0,
    totalHours: 0,
    averageSlotDuration: 0,
    activeSlots: 0,
    inactiveSlots: 0,
  });

  const fetchAvailabilities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/hospital_doctor/availabilities");
      if (!response.ok) throw new Error("Erreur de chargement");
      const data = await response.json();
      setAvailabilities(data);

      // Calculate comprehensive stats with proper validation
      const activeDays = new Set(
        data.map((a: DoctorAvailability) => a.dayOfWeek)
      ).size;

      let totalSlots = 0;
      let totalHours = 0;
      let averageSlotDuration = 0;

      if (data.length > 0) {
        // Calculate total slots and hours
        data.forEach((a: DoctorAvailability) => {
          try {
            const start = new Date(`2000-01-01T${a.startTime}`);
            const end = new Date(`2000-01-01T${a.endTime}`);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
              const durationMs = end.getTime() - start.getTime();
              const durationHours = durationMs / (1000 * 60 * 60);

              if (durationHours > 0 && a.slotDuration > 0) {
                totalHours += durationHours;
                totalSlots += durationHours / (a.slotDuration / 60);
              }
            }
          } catch {
            console.warn("Invalid time format:", a.startTime, a.endTime);
          }
        });

        // Calculate average slot duration
        const validDurations = data
          .map((a: DoctorAvailability) => a.slotDuration)
          .filter((duration) => !isNaN(duration) && duration > 0);

        if (validDurations.length > 0) {
          averageSlotDuration =
            validDurations.reduce((acc, duration) => acc + duration, 0) /
            validDurations.length;
        }
      }

      const activeSlots = data.filter(
        (a: DoctorAvailability) => a.isActive
      ).length;
      const inactiveSlots = data.filter(
        (a: DoctorAvailability) => !a.isActive
      ).length;

      setStats({
        totalSlots: Math.round(totalSlots),
        activeDays,
        totalHours: Math.round(totalHours * 10) / 10,
        averageSlotDuration: Math.round(averageSlotDuration),
        activeSlots,
        inactiveSlots,
      });
    } catch {
      // Handle error silently for read-only view
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  const getDayAvailabilities = (dayIndex: number) => {
    return availabilities.filter((a) => a.dayOfWeek === dayIndex);
  };

  const currentDay = new Date().getDay();

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
            <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Mes disponibilités
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Vos créneaux de consultation configurés
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 sm:h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-48 sm:h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
            <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Mes disponibilités
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Vos créneaux de consultation configurés par l&apos;administration
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Jours actifs
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {stats.activeDays || 0}/7
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Durée moyenne
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {Math.round(stats.averageSlotDuration) || 0}min
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Créneaux actifs
                </p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.activeSlots || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Créneaux inactifs
                </p>
                <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.inactiveSlots || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <XCircle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Days Grid with Enhanced Visual Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS.map((day, dayIndex) => {
          const dayAvailabilities = getDayAvailabilities(dayIndex);
          const isToday = dayIndex === currentDay;
          const hasAvailabilities = dayAvailabilities.length > 0;
          const activeCount = dayAvailabilities.filter(
            (a) => a.isActive
          ).length;

          return (
            <Card
              key={dayIndex}
              className={cn(
                "transition-all duration-300 hover:shadow-xl hover:scale-105 group",
                isToday && "ring-2 ring-primary/30 shadow-xl scale-105",
                hasAvailabilities && "border-2",
                !hasAvailabilities && "opacity-60"
              )}
            >
              <CardHeader className="p-2 sm:p-4 !pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-xl sm:text-2xl">{day.icon}</div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold">
                        {day.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {day.short}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isToday && (
                      <Badge
                        variant="default"
                        className="text-xs animate-pulse"
                      >
                        Aujourd&apos;hui
                      </Badge>
                    )}
                    {hasAvailabilities && (
                      <Badge variant="secondary" className="text-xs">
                        {activeCount}/{dayAvailabilities.length} actifs
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 p-2 sm:p-4">
                {dayAvailabilities.length > 0 ? (
                  <div className="space-y-2">
                    {dayAvailabilities.map((availability) => (
                      <div
                        key={availability.id}
                        className={cn(
                          "p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md",
                          availability.isActive
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700"
                            : "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="font-semibold text-sm sm:text-lg">
                              {availability.startTime} - {availability.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {availability.isActive ? (
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 dark:text-red-400" />
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Timer className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {availability.slotDuration} min
                            </span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {availability.maxPatientsPerSlot || 1} patient
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 sm:mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              Statut
                            </span>
                            <Badge
                              variant={
                                availability.isActive ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {availability.isActive ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 opacity-50">
                      {day.icon}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                      Aucune disponibilité
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Configurée par l&apos;administration
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Footer */}
      {availabilities.length > 0 && (
        <Card className="mt-4 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/20 dark:border-primary/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 dark:bg-primary/30 rounded-lg">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg">
                    Résumé de vos disponibilités
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Vous avez {stats.activeSlots || 0} créneaux actifs sur{" "}
                    {availabilities.length} configurés
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {availabilities.length > 0
                    ? Math.round(
                        ((stats.activeSlots || 0) / availabilities.length) * 100
                      )
                    : 0}
                  %
                </p>
                <p className="text-xs text-muted-foreground">
                  Taux d&apos;activité
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
