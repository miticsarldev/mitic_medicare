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
import { endOfMonth, format, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import {
  bookAppointment,
  getAvailableDoctors,
  getDoctorAvailableTimeSlots,
  getDoctorAvailableDatesRange,
} from "../../actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getSpecializationLabel } from "@/utils/function";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type SimpleDoctor = {
  id: string;
  name: string;
  avatar: string;
  specialization: string;
  hospital?: string;
  department?: string;
  consultationFee?: number;
  isIndependent?: boolean;
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    startOfMonth(new Date())
  );
  const [availableDateSet, setAvailableDateSet] = useState<Set<string>>(
    new Set()
  );

  const DOCTORS_PER_PAGE = 10;

  // formateur yyyy-MM-dd
  const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Fetch doctors on initial load
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      setCurrentPage(0);
      try {
        const result = await getAvailableDoctors(
          undefined,
          DOCTORS_PER_PAGE,
          0
        );
        setDoctors(result.data);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast({
          title: "Erreur",
          description:
            "Impossible de charger les médecins. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [toast]);

  // recharge quand médecin OU mois change
  useEffect(() => {
    const loadMonth = async () => {
      setAvailableDateSet(new Set()); // reset le temps du chargement
      if (!selectedDoctor) return;

      const start = startOfMonth(visibleMonth);
      const end = endOfMonth(visibleMonth);

      const dates = await getDoctorAvailableDatesRange(
        selectedDoctor,
        ymd(start),
        ymd(end)
      );
      setAvailableDateSet(new Set(dates));
    };

    loadMonth();
    // réinitialise date & heures si on change de médecin
    setDate(undefined);
    setTimeSlots([]);
    setSelectedTime(null);
  }, [selectedDoctor, visibleMonth]);

  // Fetch doctors when search query changes
  useEffect(() => {
    const fetchFilteredDoctors = async () => {
      // If search query is empty or less than 2 characters, fetch all doctors
      if (searchQuery.length > 0 && searchQuery.length < 2) {
        return;
      }

      setIsLoading(true);
      setCurrentPage(0);
      try {
        const result =
          searchQuery.length >= 2
            ? await getAvailableDoctors(searchQuery, DOCTORS_PER_PAGE, 0)
            : await getAvailableDoctors(undefined, DOCTORS_PER_PAGE, 0);
        setDoctors(result.data);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast({
          title: "Erreur",
          description:
            "Impossible de charger les médecins. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchFilteredDoctors();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, toast, DOCTORS_PER_PAGE]);

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

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result =
        searchQuery.length >= 2
          ? await getAvailableDoctors(
              searchQuery,
              DOCTORS_PER_PAGE,
              nextPage * DOCTORS_PER_PAGE
            )
          : await getAvailableDoctors(
              undefined,
              DOCTORS_PER_PAGE,
              nextPage * DOCTORS_PER_PAGE
            );

      setDoctors((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Error loading more doctors:", error);
      toast({
        title: "Erreur",
        description:
          "Impossible de charger plus de médecins. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

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
    <div className="container space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Prendre un Rendez-vous
          </h2>
          <p className="text-muted-foreground mt-1">
            Sélectionnez un médecin et un créneau pour votre consultation
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 rounded-lg border bg-blue-50 dark:bg-blue-950/20 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="font-medium text-blue-700 dark:text-blue-400">
              {doctors.length} médecin{doctors.length > 1 ? "s" : ""} disponible
              {doctors.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Rechercher un Médecin
            </CardTitle>
            <CardDescription>
              Sélectionnez un médecin pour votre rendez-vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 mt-2">
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
              <>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={cn(
                        "group flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-all",
                        selectedDoctor === doctor.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/30 hover:shadow-md"
                      )}
                      onClick={() => setSelectedDoctor(doctor.id)}
                    >
                      <Avatar
                        className={cn(
                          "h-12 w-12 border-2",
                          selectedDoctor === doctor.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border"
                        )}
                      >
                        <AvatarImage
                          src={doctor.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {doctor.name
                            .split(" ")
                            .map((n) => n?.[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold group-hover:text-primary transition-colors">
                            {doctor.name}
                          </h4>
                          {selectedDoctor === doctor.id && (
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-primary mt-1">
                          {getSpecializationLabel(doctor.specialization)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {doctor.hospital}
                            {doctor.department && ` • ${doctor.department}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="w-full"
                    >
                      {isLoadingMore ? "Chargement..." : "Charger plus"}
                    </Button>
                  </div>
                )}
              </>
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

        <Card className="border-2">
          <form onSubmit={handleSubmit}>
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-950/10 border-b">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Détails du Rendez-vous
              </CardTitle>
              <CardDescription>
                Sélectionnez une date et une heure pour votre rendez-vous
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 mt-2">
              {selectedDoctorData && (
                <div className="rounded-lg border-2 border-primary/20 p-4 bg-primary/5">
                  <h4 className="font-semibold text-primary mb-2">
                    Médecin sélectionné
                  </h4>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                      <Stethoscope className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedDoctorData.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getSpecializationLabel(
                          selectedDoctorData.specialization
                        )}{" "}
                        • {selectedDoctorData.hospital}
                      </p>
                    </div>
                  </div>
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
                      onMonthChange={(m) => setVisibleMonth(startOfMonth(m))}
                      initialFocus
                      disabled={(d) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        if (d < today) return true;
                        if (!selectedDoctor) return true;

                        const k = ymd(d);
                        return !availableDateSet.has(k);
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
