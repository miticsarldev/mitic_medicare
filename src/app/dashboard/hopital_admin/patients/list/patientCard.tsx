import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Calendar,
  CalendarDays,
  Mail,
  Phone,
  User2,
  History,
  Stethoscope,
  Edit,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateMedicalHistoryModal } from "../CreateMedicalHistoryModal";
import { EditMedicalHistoryModal } from "../EditMedicalHistoryModal";
import { DeleteMedicalHistoryModal } from "../DeleteMedicalHistoryModal";
import { toast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  reason: string;
  doctor: {
    id: string;
    name: string;
    email: string;
    specialty: string;
  };
}
interface MedicalHistory {
  id: string;
  title: string;
  condition: string;
  diagnosedDate: string;
  status: string;
  details: string;
  doctor?: {
    id: string;
    specialty: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}
interface MedicalRecord {
  id: string;
  diagnosis: string;
  treatment: string;
  createdAt: string;
}
interface Patient {
  id: string;
  name: string;
  gender: string;
  dateOfBirth: string | null;
  numberOfAppointments: number;
  lastAppointment?: string;
  email: string;
  phone?: string;
  address?: string;
  city: string | undefined;
  state: string | undefined;
  zipCode: string | undefined;
  numberOfMedicalRecords: number;
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  healthStatus: { allergies: string | null; notes: string | null };
  medicalHistories: MedicalHistory[];
}
interface PatientCardProps {
  patient: Patient;
}

export const PatientCard: FC<PatientCardProps> = ({
  patient: initialPatient,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [editingHistory, setEditingHistory] = useState<MedicalHistory | null>(
    null
  );
  const [deletingHistory, setDeletingHistory] = useState<MedicalHistory | null>(
    null
  );

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const formatDoctorInfo = (doctor: MedicalHistory["doctor"]) => {
    if (!doctor) return "Médecin non spécifié";
    return `${doctor.name}${doctor.specialty ? ` (${doctor.specialty})` : ""}`;
  };

  const addHistorique = (history: MedicalHistory) => {
    setPatient((prev) => ({
      ...prev,
      medicalHistories: [...prev.medicalHistories, history],
    }));
    setShowHistory(true);
  };

  const updateHistorique = (updatedHistory: MedicalHistory) => {
    setPatient((prev) => ({
      ...prev,
      medicalHistories: prev.medicalHistories.map((h) =>
        h.id === updatedHistory.id ? updatedHistory : h
      ),
    }));
    toast({
      title: "Succès",
      description: "L'historique médical a été mis à jour avec succès.",
    });
  };

  const removeHistorique = (historyId: string) => {
    setPatient((prev) => ({
      ...prev,
      medicalHistories: prev.medicalHistories.filter((h) => h.id !== historyId),
    }));
    toast({
      title: "Succès",
      description: "L'historique médical a été supprimé avec succès.",
    });
  };

  return (
    <>
      <Card className="rounded-xl shadow-sm border hover:shadow-md transition-shadow h-full">
        <CardHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold truncate">
                {patient.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-[10px]">
                  {patient.gender === "MALE"
                    ? "Homme"
                    : patient.gender === "FEMALE"
                      ? "Femme"
                      : "Non précisé"}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {patient.numberOfMedicalRecords} dossier(s)
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center justify-center gap-2">
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>{patient.numberOfAppointments} rendez-vous</span>
            </div>

            <div className="flex items-center justify-center gap-2 truncate">
              <Mail className="w-4 h-4 shrink-0" />
              <span
                className="truncate"
                title={patient.email || "Email inconnue"}
              >
                {patient.email || "Email inconnue"}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 shrink-0" />
              <span className="truncate">{patient.phone || "N° inconnu"}</span>
            </div>

            {patient.lastAppointment && (
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <Badge variant="outline" className="text-xs">
                  Dernier RDV&nbsp;:{" "}
                  {format(new Date(patient.lastAppointment), "dd/MM/yyyy")}
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <Link
              href={`/dashboard/hopital_admin/patients/${patient.id}`}
              className="w-full"
            >
              <Button variant="outline" className="w-full">
                <User2 className="w-4 h-4 mr-1" />
                Profil complet
              </Button>
            </Link>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowHistory(true)}
            >
              <Stethoscope className="w-4 h-4 mr-1" />
              Historique médical
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historique médical */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <History className="w-5 h-5" />
              Historique médical de {patient.name}
              <Badge variant="secondary" className="ml-2">
                {patient.medicalHistories.length} entrées
              </Badge>
            </DialogTitle>
            <CreateMedicalHistoryModal
              patientId={patient.id}
              addHistorique={addHistorique}
            />
          </DialogHeader>

          <ScrollArea className="flex-1 px-6">
            <div className="py-4">
              <div className="space-y-6">
                {patient.medicalHistories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun historique médical enregistré
                  </div>
                ) : (
                  patient.medicalHistories
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((history) => (
                      <div key={history.id} className="flex gap-4 group">
                        {/* Timeline */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-3 h-3 rounded-full bg-primary mt-1 z-10" />
                          <div className="w-px h-full bg-border group-last:hidden" />
                        </div>

                        {/* Item */}
                        <div className="flex-1 pb-6">
                          <div className="relative space-y-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingHistory(history)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                onClick={() => setDeletingHistory(history)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-base">
                                {history.title}
                              </h3>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {history.condition}
                              </Badge>
                              {history.status && (
                                <Badge
                                  variant={
                                    history.status === "ACTIVE"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {history.status === "ACTIVE"
                                    ? "Actif"
                                    : "Résolu"}
                                </Badge>
                              )}
                            </div>

                            {history.diagnosedDate && (
                              <div className="flex items-center gap-2 text-sm mt-2">
                                <CalendarDays className="w-4 h-4 shrink-0" />
                                <span>
                                  Diagnostiqué le&nbsp;
                                  {format(
                                    new Date(history.diagnosedDate),
                                    "dd/MM/yyyy"
                                  )}
                                </span>
                              </div>
                            )}

                            {history.details && (
                              <p className="mt-2 text-sm line-clamp-3">
                                {history.details}
                              </p>
                            )}

                            <div className="flex items-center gap-2 text-sm mt-2">
                              <Stethoscope className="w-4 h-4 shrink-0" />
                              <span>{formatDoctorInfo(history.doctor)}</span>
                            </div>

                            <div className="flex flex-col items-end text-xs text-muted-foreground">
                              <span>
                                {format(
                                  new Date(history.createdAt),
                                  "dd MMM yyyy"
                                )}
                              </span>
                              {history.updatedAt !== history.createdAt && (
                                <span className="text-xs">(modifié)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </ScrollArea>

          <div className="p-4 border-t flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowHistory(false)}
              className="px-6"
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      {editingHistory && (
        <EditMedicalHistoryModal
          history={editingHistory}
          onClose={() => setEditingHistory(null)}
          onUpdate={updateHistorique}
        />
      )}
      {deletingHistory && (
        <DeleteMedicalHistoryModal
          history={deletingHistory}
          onClose={() => setDeletingHistory(null)}
          onDelete={removeHistorique}
        />
      )}
    </>
  );
};
