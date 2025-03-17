"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, FileText, MoreHorizontal, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Appointment } from "@/types";

const appointmentHistory = [
  {
    id: "1",
    patientName: "Hassane Diallo",
    date: new Date(2024, 11, 15, 10, 30),
    motif: "Contrôle de routine",
    status: "CONFIRMED",
    notes: "Tension artérielle normale. Continuer le traitement actuel.",
    prescription: true,
    followUp: "Dans 3 mois",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    patientName: "Fatima Coulibaly",
    date: new Date(2024, 10, 5, 14, 0),
    motif: "Consultation pour douleurs",
    status: "CONFIRMED",
    notes: "Éruption cutanée en voie de guérison. Continuer la crème prescrite.",
    prescription: true,
    followUp: "Si nécessaire",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    patientName: "Sanata Diarra",
    date: new Date(2024, 9, 20, 9, 15),
    motif: "Suivi post-opératoire",
    status: "CONFIRMED",
    notes: "Vision stable. Pas de changement de prescription nécessaire.",
    prescription: false,
    followUp: "Dans 1 an",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    patientName: "Moussa Traoré",
    date: new Date(2024, 8, 10, 11, 0),
    motif: "Problèmes respiratoires",
    status: "CANCELED",
    notes: "Annulé par le patient",
    prescription: false,
    followUp: null,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    patientName: "Awa Keita",
    date: new Date(2024, 7, 25, 15, 30),
    motif: "Allergies saisonnières",
    status: "CONFIRMED",
    notes: "Niveaux de thyroïde normaux. Continuer le traitement actuel.",
    prescription: true,
    followUp: "Dans 6 mois",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

const getStatusBadge = (status) => {
  switch (status) {
    case "CONFIRMED":
      return <Badge className="bg-green-500 hover:bg-green-600">Terminé</Badge>;
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

export default function DoctorAppointmentHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Filtrer les rendez-vous
  const filteredAppointments = appointmentHistory.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.motif.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      appointment.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Historique des Rendez-vous
        </h2>
        <p className="text-muted-foreground">
          Consultez l&apos;historique des rendez-vous de vos patients.
        </p>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">Tableau</TabsTrigger>
          <TabsTrigger value="cards">Cartes</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 md:max-w-sm">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un patient, un motif..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="confirmed">Terminés</SelectItem>
                <SelectItem value="canceled">Annulés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden md:table-cell">Motif</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        Aucun rendez-vous trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full overflow-hidden">
                              <img
                                src={appointment.avatar || "/placeholder.svg"}
                                alt={appointment.patientName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <span>{appointment.patientName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(appointment.date, "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {appointment.motif}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(appointment.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setDetailsDialogOpen(true);
                                }}
                              >
                                Voir les détails
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 md:max-w-sm">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un patient, un motif..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="confirmed">Terminés</SelectItem>
                <SelectItem value="canceled">Annulés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAppointments.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-lg font-medium">
                    Aucun rendez-vous trouvé
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Essayez de modifier vos critères de recherche.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={appointment.avatar || "/placeholder.svg"}
                          alt={appointment.patientName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {appointment.patientName}
                        </CardTitle>
                        <CardDescription>{appointment.motif}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
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
                      {appointment.prescription && (
                        <div className="flex items-center text-sm">
                          <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Prescription disponible</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <div className="border-t p-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setDetailsDialogOpen(true);
                      }}
                    >
                      Voir les détails
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog pour les détails du rendez-vous */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
            <DialogDescription>
              Informations complètes sur la consultation.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img
                    src={selectedAppointment.avatar || "/placeholder.svg"}
                    alt={selectedAppointment.patientName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">
                    {selectedAppointment.patientName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.motif}
                  </p>
                </div>
              </div>

              <div className="rounded-md border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
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
                <div className="flex items-center gap-2">
                  <span className="font-medium">Statut:</span>
                  {getStatusBadge(selectedAppointment.status)}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Notes de consultation</h4>
                <p className="text-sm rounded-md border p-3">
                  {selectedAppointment.notes}
                </p>
              </div>

              {selectedAppointment.prescription && (
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Prescription médicale</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Télécharger
                  </Button>
                </div>
              )}

              {selectedAppointment.followUp && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    Prochain rendez-vous recommandé:
                  </span>
                  <span>{selectedAppointment.followUp}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}