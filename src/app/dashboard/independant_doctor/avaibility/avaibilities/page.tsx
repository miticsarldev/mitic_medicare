"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Calendar,
  Timer,
  Activity,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Pencil,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DAYS = [
  {
    id: 0,
    name: "Dimanche",
    short: "Dim",
    color:
      "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    icon: "🌅",
  },
  {
    id: 1,
    name: "Lundi",
    short: "Lun",
    color:
      "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    icon: "💼",
  },
  {
    id: 2,
    name: "Mardi",
    short: "Mar",
    color:
      "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    icon: "🌱",
  },
  {
    id: 3,
    name: "Mercredi",
    short: "Mer",
    color:
      "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    icon: "☀️",
  },
  {
    id: 4,
    name: "Jeudi",
    short: "Jeu",
    color:
      "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200",
    icon: "💜",
  },
  {
    id: 5,
    name: "Vendredi",
    short: "Ven",
    color:
      "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200",
    icon: "🎯",
  },
  {
    id: 6,
    name: "Samedi",
    short: "Sam",
    color:
      "bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800 text-pink-800 dark:text-pink-200",
    icon: "🎉",
  },
];

type Availability = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type DoctorWithAvailabilities = {
  id: string;
  name: string;
  specialization: string;
  availabilities: {
    day: string;
    dayOfWeek: number;
    availability: Availability | null;
  }[];
};

interface FormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

const normalizeTime = (time: string): string => {
  // Ensure time is in HH:mm format (e.g., "8:00" -> "08:00")
  const parts = time.split(":");
  if (parts.length >= 2) {
    const hours = parts[0].padStart(2, "0");
    const minutes = parts[1].padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  return time;
};

export default function DoctorAvailabilityPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorWithAvailabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAvailability, setEditingAvailability] =
    useState<Availability | null>(null);
  const [formData, setFormData] = useState<FormData>({
    dayOfWeek: "1",
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 60,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    availabilityId: "",
  });

  const [stats, setStats] = useState({
    totalSlots: 0,
    activeDays: 0,
    totalHours: 0,
    averageSlotDuration: 0,
    activeSlots: 0,
    inactiveSlots: 0,
  });

  // Reset form when editing availability changes
  useEffect(() => {
    if (editingAvailability) {
      setFormData({
        dayOfWeek: editingAvailability.dayOfWeek?.toString() || "1",
        startTime: normalizeTime(editingAvailability.startTime || "09:00"),
        endTime: normalizeTime(editingAvailability.endTime || "17:00"),
        slotDuration: editingAvailability.slotDuration || 60,
        isActive: editingAvailability.isActive ?? true,
      });
    }
  }, [editingAvailability]);

  const fetchAvailabilities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/independant_doctor/avaibility");

      if (!response.ok) {
        throw new Error("Failed to fetch availabilities");
      }

      const data = await response.json();
      const merged: DoctorWithAvailabilities = {
        id: data.doctor.id,
        name: data.doctor.name,
        specialization: data.doctor.specialization,
        availabilities: data.availabilities,
      };
      setDoctor(merged);

      // Calculate stats
      const activeDays = new Set(
        data.availabilities
          .filter((a: { availability: Availability | null }) => a.availability)
          .map((a: { dayOfWeek: number }) => a.dayOfWeek)
      ).size;

      const activeAvailabilities = data.availabilities
        .filter(
          (a: { availability: Availability | null }) => a.availability?.isActive
        )
        .map((a: { availability: Availability | null }) => a.availability);
      const inactiveAvailabilities = data.availabilities
        .filter(
          (a: { availability: Availability | null }) =>
            a.availability && !a.availability.isActive
        )
        .map((a: { availability: Availability | null }) => a.availability);

      let totalSlots = 0;
      let totalHours = 0;
      let averageSlotDuration = 0;

      activeAvailabilities.forEach((a: Availability) => {
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

      const allAvailabilities = data.availabilities
        .filter((a: { availability: Availability | null }) => a.availability)
        .map((a: { availability: Availability | null }) => a.availability);

      if (allAvailabilities.length > 0) {
        const validDurations = allAvailabilities
          .map((a: Availability) => a.slotDuration)
          .filter((duration) => !isNaN(duration) && duration > 0);

        if (validDurations.length > 0) {
          averageSlotDuration =
            validDurations.reduce((acc, duration) => acc + duration, 0) /
            validDurations.length;
        }
      }

      setStats({
        totalSlots: Math.round(totalSlots),
        activeDays,
        totalHours: Math.round(totalHours * 10) / 10,
        averageSlotDuration: Math.round(averageSlotDuration),
        activeSlots: activeAvailabilities.length,
        inactiveSlots: inactiveAvailabilities.length,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role !== UserRole.INDEPENDENT_DOCTOR) {
      return;
    }

    fetchAvailabilities();
  }, [session, router, fetchAvailabilities]);

  const handleSubmit = async () => {
    if (!isValidTime(formData.startTime, formData.endTime)) {
      toast({
        title: "Erreur",
        description: "L'heure de fin doit être après l'heure de début",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingAvailability
        ? `/api/independant_doctor/avaibility?id=${editingAvailability.id}`
        : "/api/independant_doctor/avaibility";

      const method = editingAvailability ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingAvailability
            ? {
                id: editingAvailability.id,
                startTime: formData.startTime,
                endTime: formData.endTime,
                slotDuration: formData.slotDuration,
                isActive: formData.isActive,
              }
            : {
                dayOfWeek: formData.dayOfWeek,
                startTime: formData.startTime,
                endTime: formData.endTime,
                slotDuration: formData.slotDuration,
              }
        ),
      });

      if (!response.ok) {
        throw new Error(
          editingAvailability
            ? "Failed to update availability"
            : "Failed to create availability"
        );
      }

      await fetchAvailabilities();
      setOpenDialog(false);
      setEditingAvailability(null);

      toast({
        title: "Succès",
        description: editingAvailability
          ? "Disponibilité mise à jour avec succès"
          : "Disponibilité créée avec succès",
      });
    } catch (err: unknown) {
      let errorMessage = "Une erreur inattendue est survenue";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/independant_doctor/avaibility?id=${deleteConfirmation.availabilityId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete availability");
      }

      await fetchAvailabilities();
      setDeleteConfirmation({ open: false, availabilityId: "" });

      toast({
        title: "Succès",
        description: "Disponibilité supprimée avec succès",
      });
    } catch (err: unknown) {
      let errorMessage = "Une erreur inattendue est survenue";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidTime = (start: string, end: string) => {
    return new Date(`1970-01-01T${end}`) > new Date(`1970-01-01T${start}`);
  };

  const handleEdit = (availability: Availability) => {
    setFormData({
      dayOfWeek: availability.dayOfWeek?.toString() || "1",
      startTime: normalizeTime(availability.startTime || "09:00"),
      endTime: normalizeTime(availability.endTime || "17:00"),
      slotDuration: availability.slotDuration || 60,
      isActive: availability.isActive ?? true,
    });
    setEditingAvailability(availability);
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setEditingAvailability(null);
    setFormData({
      dayOfWeek: "1",
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 60,
      isActive: true,
    });
    setOpenDialog(true);
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
              Gérez vos créneaux de consultation
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 sm:h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-48 sm:h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Médecin non trouvé
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
            <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Mes disponibilités
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gérez vos créneaux de consultation
            </p>
          </div>
        </div>
        <Button onClick={handleAddNew} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une disponibilité
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
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
                  {stats.averageSlotDuration || 0}min
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Timer className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
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

      {/* Days Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS.map((day) => {
          const dayAvailability = doctor.availabilities.find(
            (a) => a.dayOfWeek === day.id
          );
          const availability = dayAvailability?.availability;
          const isToday = day.id === currentDay;

          return (
            <Card
              key={day.id}
              className={cn(
                "transition-all duration-300 hover:shadow-xl hover:scale-105 group",
                isToday && "ring-2 ring-primary/30 shadow-xl scale-105",
                availability && "border-2",
                !availability && "opacity-60"
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
                    {availability && (
                      <Badge
                        variant={
                          availability.isActive ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {availability.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 p-2 sm:p-4">
                {availability ? (
                  <div
                    className={cn(
                      "p-3 sm:p-4 rounded-xl border-2 transition-all duration-200",
                      availability.isActive
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800"
                        : "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900 border-gray-200 dark:border-gray-700"
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

                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Timer className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {availability.slotDuration} min
                      </span>
                    </div>

                    <div className="mt-2 sm:mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleEdit({ ...availability, dayOfWeek: day.id })
                          }
                          className="flex-1"
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setDeleteConfirmation({
                              open: true,
                              availabilityId: availability.id,
                            })
                          }
                          className="flex-1"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 opacity-50">
                      {day.icon}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                      Aucune disponibilité
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Footer */}
      {stats.activeSlots > 0 && (
        <Card className="mt-6 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/20 dark:border-primary/30">
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
                    Vous avez {stats.activeSlots} créneaux actifs
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog pour ajouter/modifier une disponibilité */}
      <Dialog
        key={editingAvailability?.id || "new"}
        open={openDialog}
        onOpenChange={(open) => {
          if (!open) {
            setEditingAvailability(null);
          }
          setOpenDialog(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAvailability
                ? "Modifier la disponibilité"
                : "Nouvelle disponibilité"}
            </DialogTitle>
            <DialogDescription>
              {editingAvailability
                ? "Modifiez les détails de cette plage horaire"
                : "Définissez une nouvelle plage horaire"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!editingAvailability && (
              <div className="space-y-2">
                <Label>Jour</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value) =>
                    setFormData({ ...formData, dayOfWeek: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un jour" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => {
                      const isDayUsed = doctor.availabilities.some(
                        (a) => a.dayOfWeek === day.id && a.availability
                      );
                      return (
                        <SelectItem
                          key={day.id}
                          value={day.id.toString()}
                          disabled={isDayUsed}
                        >
                          {day.name}
                          {isDayUsed && " (déjà utilisé)"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure de début</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Heure de fin</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Durée des créneaux (minutes)</Label>
              <Input
                type="number"
                min="15"
                max="120"
                step="5"
                value={formData.slotDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slotDuration: parseInt(e.target.value) || 60,
                  })
                }
              />
            </div>

            {editingAvailability && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isActive: checked,
                    })
                  }
                />
                <Label htmlFor="isActive">Disponibilité active</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : editingAvailability ? (
                "Modifier"
              ) : (
                "Ajouter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteConfirmation.open}
        onOpenChange={(open) =>
          setDeleteConfirmation({
            ...deleteConfirmation,
            open,
          })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette disponibilité ? Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteConfirmation({
                  open: false,
                  availabilityId: "",
                })
              }
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Confirmer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
