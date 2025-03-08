/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  Clock,
  MoreHorizontal,
  User,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Sample data for upcoming appointments
const upcomingAppointments = [
  {
    id: "1",
    doctorName: "Dr. Sophie Martin",
    doctorSpecialty: "Cardiologie",
    date: new Date(2025, 2, 15, 10, 30),
    location: "Hôpital Saint-Louis, Paris",
    status: "CONFIRMED",
    notes: "Consultation de suivi trimestrielle",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    doctorName: "Dr. Thomas Dubois",
    doctorSpecialty: "Dermatologie",
    date: new Date(2025, 2, 18, 14, 0),
    location: "Clinique des Champs-Élysées, Paris",
    status: "PENDING",
    notes: "Examen de routine",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    doctorName: "Dr. Marie Lefevre",
    doctorSpecialty: "Ophtalmologie",
    date: new Date(2025, 2, 20, 9, 15),
    location: "Centre Médical Montparnasse, Paris",
    status: "CONFIRMED",
    notes: "Contrôle de la vision",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

// Function to get status badge color
const getStatusBadge = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">Confirmé</Badge>
      );
    case "PENDING":
      return (
        <Badge variant="outline" className="text-amber-500 border-amber-500">
          En attente
        </Badge>
      );
    case "CANCELED":
      return <Badge variant="destructive">Annulé</Badge>;
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};

export default function UpcomingAppointmentsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Filter appointments for the selected date
  const appointmentsForDate = date
    ? upcomingAppointments.filter(
        (appointment) =>
          appointment.date.getDate() === date.getDate() &&
          appointment.date.getMonth() === date.getMonth() &&
          appointment.date.getFullYear() === date.getFullYear()
      )
    : [];

  // Function to handle appointment cancellation
  const handleCancelAppointment = () => {
    // In a real app, this would call an API to update the appointment status
    console.log(`Cancelling appointment ${selectedAppointment.id}`);
    setCancelDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Prochains Rendez-vous
          </h2>
          <p className="text-muted-foreground">
            Consultez et gérez vos rendez-vous médicaux à venir.
          </p>
        </div>
        <Button asChild>
          <a href="/dashboard/patient/appointments/book">
            Prendre un rendez-vous
          </a>
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Aucun rendez-vous à venir</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Vous n&apos;avez pas de rendez-vous programmés pour le moment.
                </p>
                <Button className="mt-4" asChild>
                  <a href="/dashboard/patient/appointments/book">
                    Prendre un rendez-vous
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                      <img
                        src={appointment.avatar || "/placeholder.svg"}
                        alt={appointment.doctorName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle>{appointment.doctorName}</CardTitle>
                      <CardDescription>
                        {appointment.doctorSpecialty}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(appointment.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setCancelDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          Annuler le rendez-vous
                        </DropdownMenuItem>
                        <DropdownMenuItem>Reprogrammer</DropdownMenuItem>
                        <DropdownMenuItem>Détails</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(appointment.date, "EEEE d MMMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{format(appointment.date, "HH:mm")}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{appointment.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <p className="text-xs text-muted-foreground">
                    {appointment.notes}
                  </p>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendrier des rendez-vous</CardTitle>
              <CardDescription>
                Sélectionnez une date pour voir vos rendez-vous.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-[1fr_300px]">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                locale={fr}
              />
              <div className="space-y-4">
                <h3 className="font-medium">
                  {date
                    ? format(date, "d MMMM yyyy", { locale: fr })
                    : "Aucune date sélectionnée"}
                </h3>
                {appointmentsForDate.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun rendez-vous pour cette date.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {appointmentsForDate.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {appointment.doctorName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(appointment.date, "HH:mm")}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Appointment Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler le rendez-vous</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action ne
              peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid gap-2 py-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {selectedAppointment.doctorName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(selectedAppointment.date, "EEEE d MMMM yyyy", {
                    locale: fr,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{format(selectedAppointment.date, "HH:mm")}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Confirmer l&apos;annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
