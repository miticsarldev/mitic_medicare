'use client';

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Users2,
  Info,
  Mail,
  Phone,
  MapPin,
  HeartPulse,
  FileText,
  History,
  FileSearch,
  FilePlus2,
  Download,
  FileImage,
  FileArchive,
  FileVideo,
  File,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Patient } from "@/types/patient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateAppointmentModal } from "./CreateAppointmentModal";
import { AppointmentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Appointment = {
  id: string;
  scheduledAt: Date;
  endTime: Date | null;
  status: AppointmentStatus;
  type?: string;
  reason?: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
  doctor: {
    id: string;
    specialization: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  hospital?: {
    id: string;
    name: string;
    city: string;
  };
  medicalRecord?: {
    id: string;
    diagnosis: string;
    treatment?: string;
    notes?: string;
    followUpNeeded: boolean;
    followUpDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    attachments: {
      id: string;
      fileName: string;
      fileType: string;
      fileUrl: string;
      fileSize: number;
      uploadedAt: Date;
    }[];
    prescription?: {
      id: string;
      medicationName: string;
      dosage: string;
      frequency: string;
      duration?: string;
      instructions?: string;
      isActive: boolean;
      startDate: Date;
      endDate?: Date;
      createdAt: Date;
      updatedAt: Date;
      doctor: {
        id: string;
        user: {
          id: string;
          name: string;
        };
      };
    }[];
  };
};

type MedicalHistory = {
  id: string;
  title: string;
  condition: string;
  diagnosedDate?: Date;
  status: string;
  details?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

const FILE_ICONS = {
  'application/pdf': <FileText className="w-5 h-5" />,
  'application/msword': <FileText className="w-5 h-5" />,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': <FileText className="w-5 h-5" />,
  'image/jpeg': <FileImage className="w-5 h-5" />,
  'image/png': <FileImage className="w-5 h-5" />,
  'application/zip': <FileArchive className="w-5 h-5" />,
  'application/x-rar-compressed': <FileArchive className="w-5 h-5" />,
  'video/mp4': <FileVideo className="w-5 h-5" />,
  default: <File className="w-5 h-5" />
}

export default function PatientProfilePage({ patient }: { patient: Patient }) {
  const [appointments, setAppointments] = useState<Appointment[]>(patient.appointments || []);
  const [medicalHistories] = useState<MedicalHistory[]>(patient.medicalHistories || []);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<Appointment['medicalRecord'] | null>(null);

  if (!patient) return <div className="p-4 text-center">Chargement...</div>;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  function formatBloodType(bloodType: string): string {
    const map: Record<string, string> = {
      A_POSITIVE: "A+",
      A_NEGATIVE: "A-",
      B_POSITIVE: "B+",
      B_NEGATIVE: "B-",
      AB_POSITIVE: "AB+",
      AB_NEGATIVE: "AB-",
      O_POSITIVE: "O+",
      O_NEGATIVE: "O-",
    };

    return map[bloodType] || bloodType; // fallback si la valeur n’est pas reconnue
  }


  const addAppointment = (newAppointment: Appointment) => {
    setAppointments((prev) => [...prev, newAppointment]);
  };

  const statusColors = {
    CONFIRMED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    CANCELED: "bg-red-100 text-red-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    NO_SHOW: "bg-gray-100 text-gray-800",
    DEFAULT: "bg-gray-100 text-gray-800",
  };

  // historique statu "ACTIVE", "RESOLVED", "CHRONIC"
  const historiqueColors = {
    ACTIVE: "bg-green-100 text-green-800",
    RESOLVED: "bg-blue-100 text-blue-800",
    CHRONIC: "bg-yellow-100 text-yellow-800",
  }

  // Traduction des statuts de l'istorique 
  const translateHistorique = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Actif";
      case "RESOLVED":
        return "Résolu";
      case "CHRONIC":
        return "Chronique";
      default:
        return status;
    }
  }


  const translateStatus = (status: AppointmentStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmé";
      case "PENDING":
        return "En attente";
      case "CANCELED":
        return "Annulé";
      case "COMPLETED":
        return "Terminé";
      case "NO_SHOW":
        return "Absent";
      default:
        return status;
    }
  }

  const getFileIcon = (fileType: string) => {
    const icon = Object.entries(FILE_ICONS).find(([key]) => fileType.includes(key.split('/')[1]));
    return icon ? icon[1] : FILE_ICONS.default;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header avec photo et infos */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 md:p-6 w-full">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white dark:border-gray-800 shadow-lg">
            <AvatarImage
              src={patient.user.profile?.avatarUrl || "/avatar-placeholder.png"}
              alt={patient.user.name}
            />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {getInitials(patient.user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
                  {patient.user.name}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {patient.user.email || "Email non renseigné"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {patient.user.profile?.genre === "MALE" ? "Homme" : "Femme"}
                </Badge>
                {patient.bloodType && (
                  <Badge variant="outline" className="text-sm">
                    {formatBloodType(patient.bloodType)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {patient.dateOfBirth
                      ? new Date(patient.dateOfBirth).toLocaleDateString()
                      : "Non renseignée"}
                  </p>
                  <p className="text-xs text-muted-foreground">Date de naissance</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {patient.user.phone || "Non renseigné"}
                  </p>
                  <p className="text-xs text-muted-foreground">Téléphone</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium line-clamp-1">
                    {patient.user.profile?.city || "Ville non renseignée"}
                  </p>
                  <p className="text-xs text-muted-foreground">Localisation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Tabs principales */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-sm">
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="w-full flex overflow-x-auto">
                {[
                  { value: 'appointments', label: 'Rendez-vous', icon: <Users2 className="w-4 h-4 mr-2" /> },
                  { value: 'about', label: 'Informations', icon: <Info className="w-4 h-4 mr-2" /> },
                  { value: 'vitals', label: 'Signes vitaux', icon: <HeartPulse className="w-4 h-4 mr-2" /> },
                  { value: 'medicalHistory', label: 'Historique', icon: <History className="w-4 h-4 mr-2" /> },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center whitespace-nowrap"
                  >
                    {tab.icon} {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Contenu des tabs */}
              <div className="p-6">
                {/* Rendez-vous */}
                <TabsContent value="appointments">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">Rendez-vous</h2>
                      <p className="text-sm text-muted-foreground">
                        Historique des consultations du patient
                      </p>
                    </div>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
                    {appointments?.length ? (
                      appointments.map((appt) => (
                        <Card key={appt.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className="font-medium">{appt.doctor.user.name}</div>
                                  <Badge variant="outline" className="text-xs">
                                    {appt.doctor.specialization}
                                  </Badge>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">
                                    {new Date(appt.scheduledAt).toLocaleDateString()}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span>
                                    {new Date(appt.scheduledAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Motif : {appt.reason || "Non spécifié"}
                                </div>
                              </div>
                              <div className="flex flex-col sm:items-end gap-2">
                                <Badge className={`${statusColors[appt.status]} capitalize`}>
                                  {translateStatus(appt.status)}
                                </Badge>
                                {appt.medicalRecord && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setSelectedMedicalRecord(appt.medicalRecord)}
                                  >
                                    <FileSearch className="h-4 w-4" />
                                    Voir dossier
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-10 space-y-2">
                        <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Aucun rendez-vous trouvé
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>


                {/* Informations du patient */}
                <TabsContent value="about">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Coordonnées</h3>
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Mail className="h-5 w-5 text-primary" />
                            <span>{patient.user.email}</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Phone className="h-5 w-5 text-primary" />
                            <span>{patient.user.phone || 'Non renseigné'}</span>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            <MapPin className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <p>{patient.user.profile?.address || 'Non renseignée'}</p>
                              <p className="text-sm text-muted-foreground">
                                {patient.user.profile?.city}, {patient.user.profile?.zipCode}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h2 className="text-xl font-semibold mb-4">Informations médicales</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Allergies</h3>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            {patient.allergies?.length ? (
                              <ul className="list-disc list-inside space-y-1">
                                {patient.allergies.map((allergy, i) => (
                                  <li key={i}>{allergy}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted-foreground">Aucune allergie déclarée</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Conditions chroniques</h3>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            {patient.chronicConditions?.length ? (
                              <ul className="list-disc list-inside space-y-1">
                                {patient.chronicConditions.map((condition, i) => (
                                  <li key={i}>{condition}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted-foreground">Aucune condition déclarée</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Signes vitaux */}
                <TabsContent value="vitals">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Signes vitaux</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Historique des mesures physiologiques du patient
                    </p>

                    {patient.vitalSigns?.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4 border bg-muted/50">
                          <div>Température : {patient.vitalSigns[0].temperature} °C</div>
                          <div>Pression artérielle : {patient.vitalSigns[0].bloodPressureDiastolic}</div>
                          <div>Fréquence respiratoire : {patient.vitalSigns[0].respiratoryRate} /min</div>
                          <div>Oxygénation : {patient.vitalSigns[0].oxygenSaturation} %</div>
                          <div>Poids : {patient.vitalSigns[0].weight} kg</div>
                          <div>Taille : {patient.vitalSigns[0].height} cm</div>
                          <div>Fréquence cardiaque : {patient.vitalSigns[0].heartRate} bpm</div>
                          <div>Autres Infos : {patient.vitalSigns[0].notes}</div>
                          <div className="text-xs mt-2">
                            Relevé le : {new Date(patient.vitalSigns[0].createdAt).toLocaleDateString()}
                          </div>
                        </Card>
                      </div>
                    ) : (
                      <div className="text-center py-10 space-y-2">
                        <HeartPulse className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Aucun relevé trouvé</p>
                      </div>
                    )}
                  </div>
                </TabsContent>


                {/* Historique médical */}
                <TabsContent value="medicalHistory">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">Historique médical</h2>
                      <p className="text-sm text-muted-foreground">
                        Conditions et antécédents du patient
                      </p>
                    </div>
                  </div>

                  {medicalHistories?.length ? (
                    <div className="space-y-4">
                      {medicalHistories.map((history) => (
                        <Card key={history.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-2">
                                <h3 className="font-medium">{history.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {history.condition}
                                </p>
                                {history.details && (
                                  <p className="text-sm line-clamp-2">
                                    {history.details}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant="outline" className={`${historiqueColors[history.status]} capitalize`}>
                                  {translateHistorique(history.status)}
                                </Badge>
                                {history.diagnosedDate && (
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(history.diagnosedDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-2">
                      <History className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Aucun historique médical trouvé</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar avec calendrier */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" /> Prendre rendez-vous
              </CardTitle>
              <CardDescription>
                Sélectionnez une date pour programmer une consultation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => day && setSelectedDate(day)}
                className="rounded-md border"
                locale={fr}
              />
              <CreateAppointmentModal
                patientId={patient.id}
                addAppointment={addAppointment}
                appointmentDate={selectedDate}
              />
            </CardContent>
          </Card>

          {/* Statistiques rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{appointments.length}</div>
                <div className="text-sm text-muted-foreground">Rendez-vous</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{medicalHistories.length}</div>
                <div className="text-sm text-muted-foreground">Antécédents</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{patient.vitalSigns?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Relevés</div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Modal pour afficher le dossier médical */}
      <Dialog open={!!selectedMedicalRecord} onOpenChange={(open) => !open && setSelectedMedicalRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMedicalRecord && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2 text-lg">
                <FilePlus2 className="w-5 h-5" />
                Dossier médical
              </h3>

              <div className="pl-6 space-y-6 text-sm">
                {/* Diagnostic et traitement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold">Diagnostic</p>
                    <p className="whitespace-pre-line mt-2 p-3 bg-muted/50 rounded-md">
                      {selectedMedicalRecord.diagnosis}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Traitement</p>
                    <p className="whitespace-pre-line mt-2 p-3 bg-muted/50 rounded-md">
                      {selectedMedicalRecord.treatment}
                    </p>
                  </div>
                </div>

                {/* Notes complémentaires */}
                <div>
                  <p className="font-semibold">Notes complémentaires</p>
                  <p className="whitespace-pre-line mt-2 p-3 bg-muted/50 rounded-md">
                    {selectedMedicalRecord.notes || "Aucune note supplémentaire"}
                  </p>
                </div>

                {/* Suivi et mise à jour */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold">Suivi nécessaire</p>
                    <p>{selectedMedicalRecord.followUpNeeded ? "Oui" : "Non"}</p>
                    {selectedMedicalRecord.followUpNeeded && (
                      <p className="mt-2">
                        <span className="font-semibold">Date de suivi: </span>
                        {selectedMedicalRecord.followUpDate
                          ? format(new Date(selectedMedicalRecord.followUpDate), "PPpp", { locale: fr })
                          : "Non précisée"}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">Dernière mise à jour</p>
                    <p>{format(new Date(selectedMedicalRecord.updatedAt), "PPpp", { locale: fr })}</p>
                  </div>
                </div>

                {/* Pièces jointes */}
                <div className="space-y-3">
                  <p className="font-semibold">Pièces jointes ({selectedMedicalRecord.attachments.length})</p>
                  {selectedMedicalRecord.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedMedicalRecord.attachments.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-shrink-0">{getFileIcon(file.fileType)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.fileSize)} • {format(new Date(file.uploadedAt), "PP")}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(file.fileUrl, "_blank")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/30 text-sm text-muted-foreground rounded-md">
                      Aucune pièce jointe disponible pour ce rendez-vous.
                    </div>
                  )}
                </div>

                {/* Prescriptions */}
                <div className="space-y-3 pt-4">
                  <p className="font-semibold">Prescriptions ({selectedMedicalRecord.prescription?.length || 0})</p>
                  {(selectedMedicalRecord.prescription?.length ?? 0) > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedMedicalRecord.prescription?.map((prescription) => (
                        <div
                          key={prescription.id}
                          className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{prescription.medicationName}</p>
                            <p className="text-xs text-muted-foreground">
                              {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/30 text-sm text-muted-foreground rounded-md">
                      Aucune prescription enregistrée pour ce rendez-vous.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}