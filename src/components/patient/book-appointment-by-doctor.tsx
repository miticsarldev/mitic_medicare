"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ArrowLeft, CalendarCheck, CalendarX } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import {
  bookAppointment,
  getDoctorAvailableTimeSlots,
} from "@/app/dashboard/patient/actions";
import { getDoctorById } from "@/app/actions/patient-actions/provider-actions";
import { DoctorWithRelations } from "@/types/patient/index";
import { getSpecializationLabel } from "@/utils/function";

export default function BookAppointmentByDoctorIdPage({
  doctorId,
}: {
  doctorId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [doctor, setDoctor] = useState<DoctorWithRelations | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

  // Fetch doctor details
  useEffect(() => {
    const fetchdoctorDetails = async () => {
      setIsLoading(true);
      console.log(doctorId);
      try {
        const doctorDetails = await getDoctorById(doctorId);
        setDoctor(doctorDetails);
      } catch (error) {
        console.error("Error fetching doctor details:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les détails du rendez-vous.",
          variant: "destructive",
        });
        router.push("/dashboard/patient/doctors/all");
      } finally {
        setIsLoading(false);
      }
    };

    if (doctorId) {
      fetchdoctorDetails();
    }
  }, [doctorId, router, toast]);

  // Fetch time slots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!doctorId || !date) {
        setTimeSlots([]);
        return;
      }

      setIsLoadingTimeSlots(true);
      setSelectedTime(null);

      try {
        const formattedDate = format(date, "yyyy-MM-dd");
        const timeSlotsData = await getDoctorAvailableTimeSlots(
          doctorId,
          formattedDate
        );
        setTimeSlots(timeSlotsData);
      } catch (error) {
        console.error("Error fetching time slots:", error);
        setTimeSlots([]);
      } finally {
        setIsLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, [doctorId, date, setTimeSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctorId || !date || !selectedTime) {
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("doctorId", doctorId);
    formData.append("scheduledDate", format(date, "yyyy-MM-dd"));
    formData.append("scheduledTime", selectedTime);
    formData.append("reason", reason);

    try {
      await bookAppointment(formData);
      toast({
        title: "Rendez-vous programmé",
        description: "Votre rendez-vous a été programmé avec succès.",
      });
      router.push("/dashboard/patient/appointments/all");
    } catch (error) {
      console.error("Error rescheduling doctor:", error);
      toast({
        title: "Erreur",
        description: "Impossible de programmer le rendez-vous.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="mb-4 flex items-center">
        <Button
          variant="default"
          size="sm"
          className="mr-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Programmer votre Rendez-vous avec {doctor?.user?.name}
          </h1>
          <p className="text-muted-foreground">
            Séléctionner la date et l&apos;heure de votre rendez-vous
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
                Sélectionnez une date et heure pour votre rendez-vous avec{" "}
                {doctor?.user?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage
                      src={
                        doctor?.user?.profile?.avatarUrl ||
                        `/placeholder.svg?height=64&width=64`
                      }
                      alt={doctor?.user?.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {doctor?.user?.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">
                      {doctor?.user?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getSpecializationLabel(doctor?.specialization || "")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {doctor?.hospital?.name}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Date du rendez-vous
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
                        Horaire du rendez-vous
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
                      !date || !selectedTime || !reason.trim() || isSubmitting
                    }
                  >
                    {isSubmitting ? (
                      "Traitement en cours..."
                    ) : (
                      <>
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        Confirmer la programmation
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
