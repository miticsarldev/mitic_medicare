"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ArrowLeft,
  CalendarCheck,
  CalendarX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  getAppointmentById,
  getDoctorAvailableTimeSlots,
  rescheduleAppointment,
} from "@/app/dashboard/patient/actions";

interface Appointment {
  doctorId: string;
  doctorName: string;
  doctorAvatar?: string | null;
  specialization: string;
  hospital: string;
  scheduledAt: string;
  reason: string;
}

export default function RescheduleAppointmentPage({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [originalDate, setOriginalDate] = useState<Date | null>(null);
  const [originalTime, setOriginalTime] = useState<string | null>(null);

  // Fetch appointment details
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      setIsLoading(true);
      console.log(appointmentId);
      try {
        const appointmentDetails = await getAppointmentById(appointmentId);
        setAppointment({
          ...appointmentDetails,
          scheduledAt: appointmentDetails.scheduledAt.toISOString(),
        });

        // Set original date and time
        const scheduledDate = new Date(appointmentDetails.scheduledAt);
        setOriginalDate(scheduledDate);
        setOriginalTime(format(scheduledDate, "HH:mm"));

        // Pre-fill the form with existing appointment data
        setDate(scheduledDate);
        setReason(appointmentDetails.reason);
      } catch (error) {
        console.error("Error fetching appointment details:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les détails du rendez-vous.",
          variant: "destructive",
        });
        router.push("/dashboard/patient/appointments/all");
      } finally {
        setIsLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId, router, toast]);

  // Fetch time slots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!appointment?.doctorId || !date) {
        setTimeSlots([]);
        return;
      }

      setIsLoadingTimeSlots(true);
      setSelectedTime(null);

      try {
        const formattedDate = format(date, "yyyy-MM-dd");
        const timeSlotsData = await getDoctorAvailableTimeSlots(
          appointment.doctorId,
          formattedDate
        );
        setTimeSlots(timeSlotsData);

        // If same date as original, try to select the original time if available
        if (
          originalDate &&
          format(date, "yyyy-MM-dd") === format(originalDate, "yyyy-MM-dd") &&
          originalTime
        ) {
          if (timeSlotsData.includes(originalTime)) {
            setSelectedTime(originalTime);
          }
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        setTimeSlots([]);
      } finally {
        setIsLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, [appointment?.doctorId, date, originalDate, originalTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointment?.doctorId || !date || !selectedTime) {
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("appointmentId", appointmentId);
    formData.append("doctorId", appointment.doctorId);
    formData.append("scheduledDate", format(date, "yyyy-MM-dd"));
    formData.append("scheduledTime", selectedTime);
    formData.append("reason", reason);

    try {
      await rescheduleAppointment(formData);
      toast({
        title: "Rendez-vous reprogrammé",
        description: "Votre rendez-vous a été reprogrammé avec succès.",
      });
      router.push("/dashboard/patient/appointments/all");
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast({
        title: "Erreur",
        description: "Impossible de reprogrammer le rendez-vous.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if date/time has changed
  const hasChanges = () => {
    if (!originalDate || !date || !originalTime || !selectedTime) return false;

    const sameDate =
      format(date, "yyyy-MM-dd") === format(originalDate, "yyyy-MM-dd");
    const sameTime = selectedTime === originalTime;

    return !(sameDate && sameTime);
  };

  return (
    <div className="container p-4">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reprogrammer un Rendez-vous
          </h1>
          <p className="text-muted-foreground">
            Modifiez la date et l&apos;heure de votre rendez-vous existant
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[250px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[180px]" />
              </div>
            </div>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails du Rendez-vous</CardTitle>
              <CardDescription>
                Sélectionnez une nouvelle date et heure pour votre rendez-vous
                avec {appointment?.doctorName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage
                      src={
                        appointment?.doctorAvatar ||
                        `/placeholder.svg?height=64&width=64`
                      }
                      alt={appointment?.doctorName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {appointment?.doctorName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">
                      Dr. {appointment?.doctorName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {appointment?.specialization}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {appointment?.hospital}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-800 border-amber-200"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        Rendez-vous actuel
                      </Badge>
                      <span className="text-sm font-medium">
                        {originalDate &&
                          format(originalDate, "PPP", { locale: fr })}{" "}
                        à {originalTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Nouvelle date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {date ? (
                              format(date, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Nouvel horaire
                      </label>
                      <Select
                        disabled={
                          !date || isLoadingTimeSlots || timeSlots.length === 0
                        }
                        onValueChange={setSelectedTime}
                        value={selectedTime || ""}
                      >
                        <SelectTrigger>
                          {isLoadingTimeSlots ? (
                            <span className="text-muted-foreground">
                              Chargement des horaires...
                            </span>
                          ) : timeSlots.length === 0 && date ? (
                            <span className="text-muted-foreground">
                              Aucun horaire disponible
                            </span>
                          ) : (
                            <SelectValue placeholder="Sélectionner une heure" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                              {originalTime === time && " (horaire actuel)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {timeSlots.length === 0 &&
                        date &&
                        !isLoadingTimeSlots && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Aucun horaire disponible pour cette date. Veuillez
                            sélectionner une autre date.
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Motif du rendez-vous
                    </label>
                    <Textarea
                      placeholder="Décrivez brièvement la raison de votre consultation..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Ces informations aideront le médecin à se préparer pour
                      votre consultation.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:flex-1"
                    onClick={() => router.back()}
                  >
                    <CalendarX className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="sm:flex-1"
                    disabled={
                      !date ||
                      !selectedTime ||
                      !reason.trim() ||
                      isSubmitting ||
                      !hasChanges()
                    }
                  >
                    {isSubmitting ? (
                      "Traitement en cours..."
                    ) : (
                      <>
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        Confirmer la reprogrammation
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
