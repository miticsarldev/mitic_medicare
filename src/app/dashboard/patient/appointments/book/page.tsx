/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Check, Clock, MapPin, Search, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { specialities } from "@/constant";

// Sample data for doctors
const doctors = [
  {
    id: "1",
    name: "Dr. Sophie Martin",
    specialty: "Cardiologie",
    hospital: "Hôpital Saint-Louis",
    address: "1 Avenue Claude Vellefaux, 75010 Paris",
    rating: 4.8,
    reviewCount: 124,
    availableDates: [
      new Date(2025, 2, 15),
      new Date(2025, 2, 16),
      new Date(2025, 2, 17),
      new Date(2025, 2, 18),
    ],
    availableTimeSlots: ["09:00", "10:30", "14:00", "15:30", "17:00"],
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "2",
    name: "Dr. Thomas Dubois",
    specialty: "Dermatologie",
    hospital: "Clinique des Champs-Élysées",
    address: "15 Avenue des Champs-Élysées, 75008 Paris",
    rating: 4.6,
    reviewCount: 98,
    availableDates: [
      new Date(2025, 2, 15),
      new Date(2025, 2, 16),
      new Date(2025, 2, 19),
      new Date(2025, 2, 20),
    ],
    availableTimeSlots: ["08:30", "10:00", "11:30", "14:30", "16:00"],
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "3",
    name: "Dr. Marie Lefevre",
    specialty: "Ophtalmologie",
    hospital: "Centre Médical Montparnasse",
    address: "22 Rue du Départ, 75014 Paris",
    rating: 4.9,
    reviewCount: 156,
    availableDates: [
      new Date(2025, 2, 17),
      new Date(2025, 2, 18),
      new Date(2025, 2, 19),
      new Date(2025, 2, 20),
    ],
    availableTimeSlots: ["09:15", "10:45", "13:30", "15:00", "16:30"],
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "4",
    name: "Dr. Jean Dupont",
    specialty: "Médecine générale",
    hospital: "Cabinet Médical Bastille",
    address: "8 Rue de la Roquette, 75011 Paris",
    rating: 4.7,
    reviewCount: 210,
    availableDates: [
      new Date(2025, 2, 15),
      new Date(2025, 2, 16),
      new Date(2025, 2, 17),
      new Date(2025, 2, 18),
      new Date(2025, 2, 19),
    ],
    availableTimeSlots: ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"],
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "5",
    name: "Dr. Isabelle Moreau",
    specialty: "Endocrinologie",
    hospital: "Hôpital Cochin",
    address: "27 Rue du Faubourg Saint-Jacques, 75014 Paris",
    rating: 4.5,
    reviewCount: 87,
    availableDates: [
      new Date(2025, 2, 16),
      new Date(2025, 2, 17),
      new Date(2025, 2, 18),
      new Date(2025, 2, 19),
    ],
    availableTimeSlots: ["10:00", "11:30", "14:00", "15:30", "17:00"],
    avatar: "/placeholder.svg?height=80&width=80",
  },
];

// Form schema
const formSchema = z.object({
  specialty: z.string().min(1, "Veuillez sélectionner une spécialité"),
  doctor: z.string().min(1, "Veuillez sélectionner un médecin"),
  date: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  time: z.string().min(1, "Veuillez sélectionner une heure"),
  reason: z
    .string()
    .min(5, "Veuillez fournir une raison pour votre rendez-vous")
    .max(500, "La raison ne peut pas dépasser 500 caractères"),
  type: z.enum(["in-person", "video"], {
    required_error: "Veuillez sélectionner un type de consultation",
  }),
});

export default function BookAppointmentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  // Filter doctors based on search term and specialty
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      !selectedSpecialty ||
      doctor.specialty
        .toLowerCase()
        .includes(
          specialities
            .find((s) => s.value === selectedSpecialty)
            ?.label.toLowerCase() || ""
        );

    return matchesSearch && matchesSpecialty;
  });

  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialty: "",
      doctor: "",
      reason: "",
      type: "in-person",
    },
  });

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setConfirmDialogOpen(true);
  }

  // Handle booking confirmation
  function confirmBooking() {
    // In a real app, this would call an API to create the appointment
    console.log("Booking confirmed");
    setConfirmDialogOpen(false);
    setBookingComplete(true);
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Prendre un Rendez-vous
        </h2>
        <p className="text-muted-foreground">
          Réservez une consultation avec un médecin en quelques étapes simples.
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Rechercher un médecin</TabsTrigger>
          <TabsTrigger value="form">Formulaire de rendez-vous</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un médecin, un hôpital..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select
              value={selectedSpecialty || ""}
              onValueChange={setSelectedSpecialty}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Spécialité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les spécialités</SelectItem>
                {specialities.map((specialty) => (
                  <SelectItem key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-lg font-medium">Aucun médecin trouvé</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Essayez de modifier vos critères de recherche.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden">
                        <img
                          src={doctor.avatar || "/placeholder.svg"}
                          alt={doctor.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {doctor.name}
                        </CardTitle>
                        <CardDescription>{doctor.specialty}</CardDescription>
                        <div className="mt-1 flex items-center">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(doctor.rating)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 15.585l-7.07 3.707 1.35-7.857L.587 7.11l7.897-1.147L10 0l2.516 5.963 7.897 1.147-5.693 5.325 1.35 7.857z"
                                />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({doctor.reviewCount} avis)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="grid gap-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{doctor.hospital}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          Prochaine disponibilité:{" "}
                          {format(doctor.availableDates[0], "d MMMM", {
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        form.setValue("doctor", doctor.id);
                        document.getElementById("booking-form-tab")?.click();
                      }}
                    >
                      Prendre rendez-vous
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="form" id="booking-form-tab" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Formulaire de rendez-vous</CardTitle>
              <CardDescription>
                Remplissez ce formulaire pour prendre rendez-vous avec un
                médecin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spécialité</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedSpecialty(value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une spécialité" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="default" disabled>
                                Sélectionnez une spécialité
                              </SelectItem>
                              {specialities.map((specialty) => (
                                <SelectItem
                                  key={specialty.value}
                                  value={specialty.value}
                                >
                                  {specialty.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choisissez la spécialité médicale dont vous avez
                            besoin.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="doctor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Médecin</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedDoctor(
                                doctors.find((d) => d.id === value)
                              );
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un médecin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {doctors
                                .filter(
                                  (doctor) =>
                                    !selectedSpecialty ||
                                    doctor.specialty
                                      .toLowerCase()
                                      .includes(
                                        specialities
                                          .find(
                                            (s) => s.value === selectedSpecialty
                                          )
                                          ?.label.toLowerCase() || ""
                                      )
                                )
                                .map((doctor) => (
                                  <SelectItem key={doctor.id} value={doctor.id}>
                                    {doctor.name} - {doctor.specialty}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choisissez le médecin avec lequel vous souhaitez
                            prendre rendez-vous.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${
                                    !field.value && "text-muted-foreground"
                                  }`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: fr })
                                  ) : (
                                    <span>Sélectionnez une date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => {
                                  // Disable dates that are not available for the selected doctor
                                  if (!selectedDoctor) return true;
                                  return !selectedDoctor.availableDates.some(
                                    (availableDate: Date) =>
                                      availableDate.getDate() ===
                                        date.getDate() &&
                                      availableDate.getMonth() ===
                                        date.getMonth() &&
                                      availableDate.getFullYear() ===
                                        date.getFullYear()
                                  );
                                }}
                                initialFocus
                                locale={fr}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Sélectionnez une date disponible pour votre
                            rendez-vous.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Heure</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une heure" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="default" disabled>
                                Sélectionnez une heure
                              </SelectItem>
                              {selectedDoctor?.availableTimeSlots.map(
                                (timeSlot: string) => (
                                  <SelectItem key={timeSlot} value={timeSlot}>
                                    {timeSlot}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choisissez l&apos;heure qui vous convient le mieux.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Type de consultation</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="in-person" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                En personne
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="video" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Téléconsultation vidéo
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          Choisissez si vous souhaitez consulter en personne ou
                          par vidéo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raison de la consultation</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez brièvement la raison de votre rendez-vous..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Ces informations aideront le médecin à se préparer
                          pour votre consultation.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Confirmer le rendez-vous
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer votre rendez-vous</DialogTitle>
            <DialogDescription>
              Veuillez vérifier les détails de votre rendez-vous avant de
              confirmer.
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && form.getValues().date && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img
                    src={selectedDoctor.avatar || "/placeholder.svg"}
                    alt={selectedDoctor.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedDoctor.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDoctor.specialty}
                  </p>
                </div>
              </div>

              <div className="rounded-md border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(form.getValues().date, "EEEE d MMMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{form.getValues().time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedDoctor.hospital}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {form.getValues().type === "in-person"
                      ? "En personne"
                      : "Téléconsultation vidéo"}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Modifier
            </Button>
            <Button onClick={confirmBooking}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Complete Dialog */}
      <Dialog open={bookingComplete} onOpenChange={setBookingComplete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rendez-vous confirmé !</DialogTitle>
            <DialogDescription>
              Votre rendez-vous a été réservé avec succès.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="mt-4 text-center">
              Vous recevrez un email de confirmation avec tous les détails de
              votre rendez-vous.
            </p>
          </div>
          <DialogFooter>
            <Button asChild onClick={() => setBookingComplete(false)}>
              <a href="/dashboard/patient/appointments/upcoming">
                Voir mes rendez-vous
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
