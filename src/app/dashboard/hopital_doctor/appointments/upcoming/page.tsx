"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Stethoscope,
  User,
  FileText,
  Check,
  X,
  Filter,
  Search,
  FilePlus,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Appointment, AppointmentsResponse } from "@/types/appointment";
import { AppointmentStatus } from "@prisma/client";
import { ConfirmModal } from "../components/confirm-modal";
import { CancelModal } from "../components/cancel-modal";
import { CompleteModal } from "../components/complete-modal";
import { DetailsModal } from "../components/details-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getSpecializationLabel } from "@/utils/function";

type MedicalRecordInput = {
  diagnosis: string;
  treatment: string;
  notes?: string;
  followUpNeeded?: boolean;
  followUpDate?: Date | string | undefined;
};
interface MedicalRecordData {
  diagnosis: string;
  treatment: string;
  notes?: string;
  followUpNeeded: boolean;
  followUpDate?: Date;
  attachments?: {
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
  }[];
  prescriptions?: {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    isActive: boolean;
    startDate: string;
    endDate: string;
  }[];
}

const statusOptions = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmé" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "CANCELED", label: "Annulé" },
  { value: "NO_SHOW", label: "Absent" },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [medicalRecordData, setMedicalRecordData] =
    useState<MedicalRecordData | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    canceled: 0,
  });
  const [filters, setFilters] = useState({
    status: "ALL",
    patientName: "",
  });
  type Filters = {
    status: string;
    patientName: string;
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 9,
    totalItems: 0,
    totalPages: 1,
  });
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [modalType, setModalType] = useState<
    | "confirm"
    | "cancel"
    | "complete"
    | "details"
    | "edit"
    | "deleteRecord"
    | null
  >(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/hospital_doctor/appointments/all?page=${pagination.currentPage}&pageSize=${pagination.pageSize}&includeMedicalRecordInfo=true`;

      if (filters.status !== "ALL") {
        url += `&status=${filters.status}`;
      }
      if (filters.patientName) {
        url += `&patientName=${encodeURIComponent(filters.patientName)}`;
      }
      if (dateRange?.from) {
        url += `&startDate=${dateRange.from.toISOString()}`;
      }
      if (dateRange?.to) {
        url += `&endDate=${dateRange.to.toISOString()}`;
      }

      const res = await fetch(url);
      const data: AppointmentsResponse = await res.json();
      setAppointments(data.appointments);
      setPagination({
        currentPage: data.pagination.currentPage,
        pageSize: data.pagination.pageSize,
        totalItems: data.pagination.totalItems,
        totalPages: data.pagination.totalPages,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les rendez-vous",
        variant: "destructive",
      });
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, dateRange, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, [pagination.currentPage, filters, dateRange, fetchAppointments]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/hospital_doctor/appointments/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleStatusUpdate = async (data: {
    appointmentId: string;
    action: "confirm" | "canceled" | "complete";
    medicalRecord?: MedicalRecordInput;
  }) => {
    try {
      const response = await fetch(
        "/api/hospital_doctor/appointments/update-status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Échec de la mise à jour");
      }

      toast({
        title: "Succès",
        description: "Rendez-vous mis à jour avec succès",
      });

      fetchAppointments();
      fetchStats();
      setModalType(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du rendez-vous",
        variant: "destructive",
      });
      console.error("Error updating appointment status:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleFilterChange = <K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      status: "ALL",
      patientName: "",
    });
    setDateRange(undefined);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">En attente</Badge>;
      case "CONFIRMED":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">Confirmé</Badge>
        );
      case "CANCELED":
        return <Badge variant="destructive">Annulé</Badge>;
      case "COMPLETED":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Terminé</Badge>
        );
      case "NO_SHOW":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Absent</Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Gestion des Rendez-vous</h1>
      </div>

      {/* Cartes Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <StatCard
          title="Total RDV"
          value={stats.total}
          icon={<FileText className="h-6 w-6 text-muted-foreground" />}
        />
        <StatCard
          title="En attente"
          value={stats.pending}
          icon={<Clock className="h-6 w-6 text-muted-foreground" />}
        />
        <StatCard
          title="Confirmés"
          value={stats.confirmed}
          icon={<Check className="h-6 w-6 text-muted-foreground" />}
        />
        <StatCard
          title="Terminés"
          value={stats.completed}
          icon={<Stethoscope className="h-6 w-6 text-muted-foreground" />}
        />
        <StatCard
          title="Annulés"
          value={stats.canceled}
          icon={<X className="h-6 w-6 text-muted-foreground" />}
        />
      </div>

      {/* Zone de Filtres */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Filtres</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Réinitialiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nom du patient
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un patient..."
                  className="pl-9"
                  value={filters.patientName}
                  onChange={(e) =>
                    handleFilterChange("patientName", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Période</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM yyyy", {
                            locale: fr,
                          })}{" "}
                          -{" "}
                          {format(dateRange.to, "dd MMM yyyy", { locale: fr })}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM yyyy", { locale: fr })
                      )
                    ) : (
                      <span>Sélectionner une période</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des rendez-vous */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            Aucun rendez-vous trouvé
          </h3>
          <p className="text-gray-500 mt-1">
            Aucun rendez-vous ne correspond à vos critères de recherche.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onAction={async (type, apt) => {
                  if (type === "edit") {
                    // Ouvre immédiatement le modal d'édition avec loader
                    setModalType("edit");
                    setMedicalRecordData(null);
                    try {
                      const res = await fetch(
                        `/api/hospital_doctor/medical-records/${apt.id}`,
                        { cache: "no-store" }
                      );
                      if (!res.ok) throw new Error("Dossier non trouvé");
                      const data = await res.json();
                      if (!data) throw new Error("Dossier vide");
                      const transformed: MedicalRecordData = {
                        diagnosis: data.diagnosis ?? "",
                        treatment: data.treatment ?? "",
                        notes: data.notes ?? "",
                        followUpNeeded: Boolean(data.followUpNeeded),
                        followUpDate: data.followUpDate
                          ? new Date(data.followUpDate)
                          : undefined,
                        attachments: Array.isArray(data.attachments)
                          ? data.attachments.map(
                              (a: {
                                fileName: string;
                                fileType: string;
                                fileUrl: string;
                                fileSize: number;
                              }) => ({
                                fileName: a.fileName,
                                fileType: a.fileType,
                                fileUrl: a.fileUrl,
                                fileSize: a.fileSize,
                              })
                            )
                          : [],
                        prescriptions: Array.isArray(data.prescription)
                          ? data.prescription.map(
                              (p: {
                                medicationName?: string;
                                dosage?: string;
                                frequency?: string;
                                duration?: string;
                                instructions?: string;
                                isActive?: boolean;
                                startDate?: string | Date;
                                endDate?: string | Date;
                              }) => ({
                                medicationName: p.medicationName ?? "",
                                dosage: p.dosage ?? "",
                                frequency: p.frequency ?? "",
                                duration: p.duration ?? "",
                                instructions: p.instructions ?? "",
                                isActive: Boolean(p.isActive),
                                startDate: p.startDate
                                  ? new Date(p.startDate)
                                      .toISOString()
                                      .slice(0, 10)
                                  : "",
                                endDate: p.endDate
                                  ? new Date(p.endDate)
                                      .toISOString()
                                      .slice(0, 10)
                                  : "",
                              })
                            )
                          : [],
                      };
                      setMedicalRecordData(transformed);
                    } catch {
                      toast({
                        title: "Erreur",
                        description:
                          "Le dossier médical n'existe plus ou a été supprimé.",
                        variant: "destructive",
                      });
                      setModalType(null);
                      setMedicalRecordData(null);
                      return;
                    }
                    setSelectedAppointment(apt);
                  } else if (type === "details") {
                    // Ouvre immédiatement la modale de détails avec loader
                    setSelectedAppointment(apt);
                    setModalType("details");
                    setLoadingDetails(true);
                    try {
                      const res = await fetch(
                        `/api/hospital_doctor/appointments/${apt.id}`,
                        { cache: "no-store" }
                      );
                      if (!res.ok) throw new Error("Not found");
                      const latest = await res.json();
                      setSelectedAppointment(latest);
                    } catch {
                      // Keep existing appointment data on error
                    } finally {
                      setLoadingDetails(false);
                    }
                  } else {
                    setSelectedAppointment(apt);
                    setModalType(type);
                  }
                }}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              Précédent
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} sur {pagination.totalPages} •{" "}
              {pagination.totalItems} rendez-vous
            </span>
            <Button
              variant="outline"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </>
      )}

      {/* Modals */}
      {selectedAppointment && (
        <>
          <ConfirmModal
            open={modalType === "confirm"}
            onOpenChange={(open) => !open && setModalType(null)}
            onConfirm={() => {
              handleStatusUpdate({
                appointmentId: selectedAppointment.id,
                action: "confirm",
              });
            }}
            title="Confirmer le rendez-vous"
            description="Êtes-vous sûr de vouloir confirmer ce rendez-vous ? "
            confirmText="Confirmer"
          />
          {modalType === "edit" &&
            selectedAppointment &&
            (medicalRecordData ? (
              <CompleteModal
                open={true}
                onOpenChange={(open) => {
                  if (!open) {
                    setModalType(null);
                    setMedicalRecordData(null);
                  }
                }}
                appointment={selectedAppointment}
                onSubmit={async (updatedData) => {
                  try {
                    const res = await fetch(
                      `/api/hospital_doctor/medical-records/${selectedAppointment.id}`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          ...updatedData,
                          patientId: selectedAppointment.patient.id,
                          doctorId: selectedAppointment.doctor.id,
                        }),
                      }
                    );

                    if (!res.ok) throw new Error("Erreur modification");

                    toast({
                      title: "Succès",
                      description: "Dossier modifié.",
                    });
                    setModalType(null);
                    fetchAppointments();
                  } catch {
                    toast({
                      title: "Erreur",
                      description: "Modification échouée.",
                      variant: "destructive",
                    });
                  }
                }}
                defaultValues={medicalRecordData}
              />
            ) : (
              <Dialog
                open={true}
                onOpenChange={(open) => !open && setModalType(null)}
              >
                <DialogContent className="max-w-lg">
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          {modalType === "deleteRecord" && selectedAppointment && (
            <ConfirmModal
              open={modalType === "deleteRecord"}
              onOpenChange={(open) => !open && setModalType(null)}
              onConfirm={() => {
                fetch(
                  `/api/hospital_doctor/medical-records/${selectedAppointment.id}`,
                  {
                    method: "DELETE",
                  }
                )
                  .then((res) => {
                    if (!res.ok) throw new Error("Erreur suppression");
                    toast({
                      title: "Succès",
                      description: "Dossier supprimé.",
                    });
                    setModalType(null);
                    fetchAppointments();
                  })
                  .catch(() =>
                    toast({
                      title: "Erreur",
                      description: "Suppression échouée.",
                      variant: "destructive",
                    })
                  );
              }}
              title="Supprimer le dossier médical"
              description="Êtes-vous sûr de vouloir supprimer définitivement ce dossier médical ? cette action est ireversible."
              confirmText="Supprimer"
              cancelText="Annuler"
              variant="destructive"
            />
          )}

          <CancelModal
            open={modalType === "cancel"}
            onOpenChange={(open) => !open && setModalType(null)}
            onConfirm={() => {
              handleStatusUpdate({
                appointmentId: selectedAppointment.id,
                action: "canceled",
              });
            }}
          />

          <CompleteModal
            open={modalType === "complete"}
            onOpenChange={(open) => !open && setModalType(null)}
            appointment={selectedAppointment}
            onSubmit={async (medicalRecordData) => {
              await handleStatusUpdate({
                appointmentId: selectedAppointment.id,
                action: "complete",
                medicalRecord: medicalRecordData,
              });
            }}
          />

          <DetailsModal
            open={modalType === "details"}
            onOpenChange={(open) => !open && setModalType(null)}
            appointment={selectedAppointment}
            loading={loadingDetails}
          />
        </>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function AppointmentCard({
  appointment,
  onAction,
  getStatusBadge,
}: {
  appointment: Appointment & { hasMedicalRecord?: boolean };
  onAction: (
    type:
      | "confirm"
      | "cancel"
      | "complete"
      | "details"
      | "edit"
      | "deleteRecord",
    apt: Appointment
  ) => void;
  getStatusBadge: (status: AppointmentStatus) => React.ReactNode;
}) {
  const hasMedicalRecord =
    appointment.medicalRecord !== null &&
    appointment.medicalRecord !== undefined &&
    Object.keys(appointment.medicalRecord).length > 0;
  return (
    <Card className="hover:shadow-lg transition-shadow relative">
      {hasMedicalRecord && (
        <div className="absolute top-4 right-4 bg-blue-100 p-2 rounded-full">
          <FileText className="h-4 w-4 text-blue-600" />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              {appointment.patient.name}
            </CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope className="h-4 w-4" />
                {appointment.doctor.name} -{" "}
                {getSpecializationLabel(
                  appointment.doctor.specialization ?? ""
                ) || "Spécialité non précisée"}
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {new Date(appointment.scheduledAt).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {new Date(appointment.scheduledAt).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="mb-3">{getStatusBadge(appointment.status)}</div>
        {appointment.reason && (
          <p className="text-sm text-gray-600 line-clamp-2">
            <span className="font-medium">Motif :</span> {appointment.reason}
          </p>
        )}
        {appointment.status === "COMPLETED" && hasMedicalRecord && (
          <div className="absolute top-2 right-2 bg-green-100 p-1 rounded-full">
            <FileText className="h-4 w-4 text-green-600" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction("details", appointment)}
        >
          Détails
        </Button>
        <div className="flex gap-2">
          {appointment.status === "COMPLETED" ? (
            hasMedicalRecord ? (
              <>
                <Button size="sm" onClick={() => onAction("edit", appointment)}>
                  <Pencil className="mr-2 h-4 w-4" /> Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onAction("deleteRecord", appointment)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => onAction("complete", appointment)}
              >
                <FilePlus className="mr-2 h-4 w-4" /> Ajouter un dossier
              </Button>
            )
          ) : appointment.status === "PENDING" ? (
            <>
              <Button
                size="sm"
                onClick={() => onAction("confirm", appointment)}
              >
                <Check className="mr-2 h-4 w-4" /> Confirmer
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onAction("cancel", appointment)}
              >
                <X className="mr-2 h-4 w-4" /> Annuler
              </Button>
            </>
          ) : (
            appointment.status === "CONFIRMED" && (
              <>
                <Button
                  size="sm"
                  onClick={() => onAction("complete", appointment)}
                >
                  <FileText className="mr-2 h-4 w-4" /> Compléter
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onAction("cancel", appointment)}
                >
                  <X className="mr-2 h-4 w-4" /> Annuler
                </Button>
              </>
            )
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
