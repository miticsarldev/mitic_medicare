"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Clock, MoreHorizontal, User, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const doctorAppointments = [
  {
    id: "1",
    patientName: "Jean Dupont",
    date: new Date(2025, 2, 15, 10, 30),
    location: "Cabinet médical, Paris",
    status: "CONFIRMED",
    notes: "Consultation de suivi trimestrielle",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    patientName: "Marie Curie",
    date: new Date(2025, 2, 18, 14, 0),
    location: "Cabinet médical, Paris",
    status: "PENDING",
    notes: "Examen de routine",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    patientName: "Louis Pasteur",
    date: new Date(2025, 2, 20, 9, 15),
    location: "Cabinet médical, Paris",
    status: "CONFIRMED",
    notes: "Analyse des résultats de laboratoire",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

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

type Appointment = {
  id: string;
  doctorName?: string;
  patientName: string;
  date: Date;
  status: string;
  notes: string;
  location: string;
  avatar: string;
};

export default function Page() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const appointmentsForDate = date
    ? doctorAppointments.filter(
        (appointment) =>
          appointment.date.getDate() === date.getDate() &&
          appointment.date.getMonth() === date.getMonth() &&
          appointment.date.getFullYear() === date.getFullYear()
      )
    : [];

    const handleCancelAppointment = () => { 
      if (!selectedAppointment) return;
      console.log(`Cancelling appointment ${selectedAppointment.id}`);
      setCancelDialogOpen(false);
    };
    

  return (
    <div className="space-y-6 p-4">
      <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Prochains Rendez-vous
          </h2>
          <p className="text-muted-foreground">
            Consultez et gérez vos rendez-vous médicaux à venir.
          </p>
        </div>
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          {doctorAppointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={appointment.avatar}
                      alt={appointment.patientName}
                    />
                    <AvatarFallback>
                      {appointment.patientName.charAt(0)}
                    </AvatarFallback>
                  </Avatar> 
                  <div>
                    <CardTitle>{appointment.patientName}</CardTitle>
                    <CardDescription>{appointment.notes}</CardDescription>
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
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(appointment.date, "EEEE d MMMM yyyy", { locale: fr })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{format(appointment.date, "HH:mm")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{appointment.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="calendar">
          <Calendar mode="single" selected={date} onSelect={setDate} locale={fr} />
          {appointmentsForDate.length === 0 ? (
            <p>Aucun rendez-vous pour cette date.</p>
          ) : (
            appointmentsForDate.map((appointment) => (
              <p key={appointment.id}>{appointment.patientName} à {format(appointment.date, "HH:mm")}</p>
            ))
          )}
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
