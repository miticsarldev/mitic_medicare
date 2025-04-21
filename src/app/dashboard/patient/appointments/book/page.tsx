"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Calendar, Search, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  bookAppointment,
  getAvailableDoctors,
  getDoctorAvailableTimeSlots,
} from "../../actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export type SimpleDoctor = {
  id: string;
  name: string;
  specialization: string;
  hospital?: string;
  department?: string;
  consultationFee?: number;
  isIndependant?: boolean;
};

export default function BookAppointmentPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState<SimpleDoctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch doctors on initial load
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const doctorsData = await getAvailableDoctors();
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch doctors when search query changes
  useEffect(() => {
    const fetchFilteredDoctors = async () => {
      if (searchQuery.length < 2) return; // Only search if query is at least 2 characters

      setIsLoading(true);
      try {
        const doctorsData = await getAvailableDoctors(searchQuery);
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchFilteredDoctors();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Fetch time slots when doctor and date are selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDoctor || !date) {
        setTimeSlots([]);
        return;
      }

      setIsLoadingTimeSlots(true);
      setSelectedTime(null);

      try {
        const formattedDate = format(date, "yyyy-MM-dd");
        const timeSlotsData = await getDoctorAvailableTimeSlots(
          selectedDoctor,
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
  }, [selectedDoctor, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctor || !date || !selectedTime) {
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("doctorId", selectedDoctor);
    formData.append("scheduledDate", format(date, "yyyy-MM-dd"));
    formData.append("scheduledTime", selectedTime);
    formData.append("reason", reason);

    try {
      await bookAppointment(formData);

      toast({
        title: "Rendez-vous confirmé",
        description: "Votre rendez-vous a bien été enregistré.",
      });

      router.push("/dashboard/patient/appointments/all");
    } catch (error) {
      console.error("Error booking appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDoctorData = selectedDoctor
    ? doctors.find((doctor) => doctor.id === selectedDoctor)
    : null;

  return (
    <div className="container p-2">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rechercher un Médecin</CardTitle>
            <CardDescription>
              Sélectionnez un médecin pour votre rendez-vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher par nom, spécialité ou hôpital..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border p-3 animate-pulse"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted"></div>
                      <div className="h-3 w-1/2 rounded bg-muted"></div>
                      <div className="h-3 w-1/3 rounded bg-muted"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : doctors.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted",
                      selectedDoctor === doctor.id && "border-primary bg-muted"
                    )}
                    onClick={() => setSelectedDoctor(doctor.id)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{doctor.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {doctor.specialization}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          {doctor.hospital}
                          {doctor.department && ` • ${doctor.department}`}
                        </p>
                        {doctor.isIndependant && doctor.consultationFee && (
                          <span className="text-xs font-medium text-primary">
                            {new Intl.NumberFormat("fr-ML", {
                              style: "currency",
                              currency: "XOF",
                              minimumFractionDigits: 0,
                            }).format(doctor.consultationFee)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Stethoscope className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium">
                  Aucun médecin trouvé
                </h3>
                <p className="text-sm text-muted-foreground">
                  Essayez de modifier vos critères de recherche.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Détails du Rendez-vous</CardTitle>
              <CardDescription>
                Sélectionnez une date et une heure pour votre rendez-vous
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDoctorData && (
                <div className="rounded-lg border p-3 bg-muted/50">
                  <h4 className="font-medium">Médecin sélectionné</h4>
                  <p className="text-sm">{selectedDoctorData.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedDoctorData.specialization} •{" "}
                    {selectedDoctorData.hospital}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                      disabled={!selectedDoctor}
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

              <div className="space-y-1">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Heure du rendez-vous
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
                {timeSlots.length === 0 && date && !isLoadingTimeSlots && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Aucun horaire disponible pour cette date. Veuillez
                    sélectionner une autre date.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Motif du rendez-vous
                </label>
                <Textarea
                  placeholder="Décrivez brièvement la raison de votre consultation..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[100px]"
                  disabled={!selectedDoctor || !date || !selectedTime}
                />
                <p className="text-xs text-muted-foreground">
                  Ces informations aideront le médecin à se préparer pour votre
                  consultation.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isSubmitting ||
                  !selectedDoctor ||
                  !date ||
                  !selectedTime ||
                  !reason.trim()
                }
              >
                {isSubmitting ? "Chargement..." : "Confirmer le Rendez-vous"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
