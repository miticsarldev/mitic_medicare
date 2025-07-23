"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Activity,
  User,
  HeartPulse,
  Calendar,
  AlertCircle,
  Plus,
  User2,
  FileSearch,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PatientDetails {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  dateOfBirth: Date;
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  medicalNotes?: string;
  medicalHistories: {
    id: string;
    title: string;
    condition: string;
    diagnosedDate?: Date;
    status: string;
    details?: string;
  }[];
  appointments: {
    id: string;
    doctor: {
      user: {
        name: string;
      };
    };
    scheduledAt: Date;
    status: string;
    type?: string;
    reason?: string;
    notes?: string;
    medicalRecord?: {
      id: string;
      diagnosis: string;
      treatment?: string;
      prescriptions: {
        id: string;
        medicationName: string;
        dosage: string;
        frequency: string;
        duration?: string;
        instructions?: string;
      }[];
    };
  }[];
  vitalSigns: {
    id: string;
    temperature?: number;
    heartRate?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    recordedAt: Date;
  }[];
}

interface Hospital {
  id: string;
  name: string;
}
interface Patient {
  id: string;
  bloodType?: string;
}
interface Appointment {
  id: string;
  status: string;
  reason: string;
}
interface MedicalRecord {
  id: string;
  diagnosis: string;
  treatment?: string;
  notes: string;
  createdAt: string | number | Date;
  hospital: Hospital;
  appointment: Appointment;
  patient: Patient;
}

export default function PatientMedicalRecord() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("infos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState("");
  const [details, setDetails] = useState("");
  const [diagnosedDate, setDiagnosedDate] = useState("");
  const [isVitalModalOpen, setIsVitalModalOpen] = useState(false);
  const [temperature, setTemperature] = useState<number | undefined>();
  const [heartRate, setHeartRate] = useState<number | undefined>();
  const [bloodPressureSystolic, setBPsys] = useState<number | undefined>();
  const [bloodPressureDiastolic, setBPdia] = useState<number | undefined>();
  const [oxygenSaturation, setOxy] = useState<number | undefined>();
  const [weight, setWeight] = useState<number | undefined>();
  const [height, setHeight] = useState<number | undefined>();
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordData, setRecordData] = useState<MedicalRecord | null>(null);

  const fetchPatientData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hospital_doctor/patient/${patientId}`);
      if (!response.ok) {
        throw new Error("Patient non trouvé");
      }
      const data = await response.json();
      setPatient(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: err.message,
        });
      } else {
        setError("Une erreur est survenue");
      }
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatientData();
  }, [patientId, fetchPatientData]);

  const formatDate = (date: Date) => new Date(date).toLocaleDateString();

  const formatBloodType = (type?: string) => {
    if (!type) return "Non spécifié";
    const types: Record<string, string> = {
      A_POSITIVE: "A+",
      A_NEGATIVE: "A-",
      B_POSITIVE: "B+",
      B_NEGATIVE: "B-",
      AB_POSITIVE: "AB+",
      AB_NEGATIVE: "AB-",
      O_POSITIVE: "O+",
      O_NEGATIVE: "O-",
    };
    return types[type] || type.replace("_", " ");
  };

  const completedAppointments = Array.isArray(patient?.appointments)
    ? patient.appointments
        .filter((app) => app.status === "COMPLETED")
        .sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime()
        )
    : [];

  const latestVitalSigns = useMemo(() => {
    if (!patient?.vitalSigns || patient.vitalSigns.length === 0) return null;
    return patient.vitalSigns.reduce((latest, current) =>
      new Date(current.recordedAt) > new Date(latest.recordedAt)
        ? current
        : latest
    );
  }, [patient?.vitalSigns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/hospital_doctor/patient/${patientId}/medical-history`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            condition,
            details,
            diagnosedDate: diagnosedDate || undefined,
            status: "ACTIVE",
          }),
        }
      );

      if (response.ok) {
        await fetchPatientData();
        setIsModalOpen(false);
        setTitle("");
        setCondition("");
        setDetails("");
        setDiagnosedDate("");
        toast({
          title: "Succès",
          description: "Antécédent médical ajouté avec succès",
        });
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'historique", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de l'ajout de l'antécédent médical",
      });
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    try {
      const response = await fetch(
        `/api/hospital_doctor/patient/${patientId}/medical-history/${historyId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchPatientData();
        toast({
          title: "Succès",
          description: "Antécédent médical supprimé avec succès",
        });
      }
    } catch (err) {
      console.error("Erreur lors de la suppression", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de la suppression de l'antécédent médical",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setHistoryToDelete(null);
    }
  };

  const handleViewDiagnosis = async (appointmentId: string) => {
    try {
      const res = await fetch(
        `/api/hospital_doctor/history/record?appointmentId=${appointmentId}`
      );
      const data = await res.json();
      setRecordData(data[0]);
      setIsRecordModalOpen(true);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du dossier médical:",
        error
      );
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le dossier médical",
      });
    }
  };

  const translateStatus = (status: string) => {
    const statusTranslations: Record<string, string> = {
      ACTIVE: "Actif",
      INACTIVE: "Inactif",
      CHRONIC: "Chronique",
      RESOLVED: "Résolu",
      PENDING: "En attente",
      CONTROLLED: "Contrôlé",
    };
    return statusTranslations[status] || status;
  };

  const handleVitalSignsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/hospital_doctor/patient/${patientId}/vital-signs`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            temperature: temperature || null,
            heartRate: heartRate || null,
            bloodPressureSystolic: bloodPressureSystolic || null,
            bloodPressureDiastolic: bloodPressureDiastolic || null,
            oxygenSaturation: oxygenSaturation || null,
            weight: weight || null,
            height: height || null,
          }),
        }
      );

      if (response.ok) {
        await fetchPatientData();
        setIsVitalModalOpen(false);
        toast({
          title: "Succès",
          description: "Signes vitaux mis à jour avec succès",
        });
      } else {
        const errorData = await response.json();
        console.error("Erreur lors de la mise à jour:", errorData.error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description:
            errorData.error || "Échec de la mise à jour des signes vitaux",
        });
      }
    } catch (err) {
      console.error(
        "Erreur réseau lors de la mise à jour des signes vitaux",
        err
      );
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur réseau lors de la mise à jour des signes vitaux",
      });
    }
  };

  const statusColors = {
    CONFIRMED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-800",
    COMPLETED: "bg-blue-100 text-blue-800",
  };

  useEffect(() => {
    if (latestVitalSigns) {
      setTemperature(latestVitalSigns.temperature);
      setHeartRate(latestVitalSigns.heartRate);
      setBPsys(latestVitalSigns.bloodPressureSystolic);
      setBPdia(latestVitalSigns.bloodPressureDiastolic);
      setOxy(latestVitalSigns.oxygenSaturation);
      setWeight(latestVitalSigns.weight);
      setHeight(latestVitalSigns.height);
    } else {
      setTemperature(undefined);
      setHeartRate(undefined);
      setBPsys(undefined);
      setBPdia(undefined);
      setOxy(undefined);
      setWeight(undefined);
      setHeight(undefined);
    }
  }, [latestVitalSigns, isVitalModalOpen]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!patient) return <div>Patient non trouvé</div>;

  return (
    <div className="p-6 space-y-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* En-tête : Informations du patient */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-4">
              <User className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {patient.user?.name || "Nom inconnu"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Date de naissance: {formatDate(patient.dateOfBirth)} | Groupe
                  sanguin : {formatBloodType(patient.bloodType)}
                </p>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {patient.allergies && (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-gray-900 dark:text-gray-100">
                Allergies : {patient.allergies}
              </p>
            </div>
          )}
          {completedAppointments.length > 0 && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <p className="text-sm text-gray-900 dark:text-gray-100">
                Dernière consultation :{" "}
                {formatDate(completedAppointments[0].scheduledAt)} avec Dr.{" "}
                {completedAppointments[0].doctor.user.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Système d'onglets */}
      <Tabs
        defaultValue="infos"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="infos">
            <User2 className="w-4 h-4 mr-2" />
            Infos
          </TabsTrigger>
          <TabsTrigger value="medical-history">
            <HeartPulse className="w-4 h-4 mr-2" />
            Antécédents
          </TabsTrigger>
          <TabsTrigger value="vital-signs">
            <Activity className="w-4 h-4 mr-2" />
            Signes vitaux
          </TabsTrigger>
          <TabsTrigger value="appointments">
            <Calendar className="w-4 h-4 mr-2" />
            Consultations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="infos">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <User className="w-6 h-6 text-blue-500" />
                Informations du patient
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Coordonnées
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        Email:
                      </span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {patient.user?.email || "Email inconnu"}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        Téléphone:
                      </span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {patient.user?.phone || "phone inconnu"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Informations médicales
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        Date de naissance:
                      </span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(patient.dateOfBirth)}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        Groupe sanguin:
                      </span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {formatBloodType(patient.bloodType)}
                      </p>
                    </div>
                    {patient.allergies && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                          Allergies:
                        </span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {patient.allergies}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Urgence
                  </h3>
                  <div className="space-y-2">
                    {patient.emergencyContact && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                          Contact:
                        </span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {patient.emergencyContact}
                        </p>
                      </div>
                    )}
                    {patient.emergencyPhone && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                          Téléphone:
                        </span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {patient.emergencyPhone}
                        </p>
                      </div>
                    )}
                    {patient.emergencyRelation && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                          Relation:
                        </span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {patient.emergencyRelation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu de l'onglet Antécédents médicaux */}
        <TabsContent value="medical-history">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <HeartPulse className="w-6 h-6 text-purple-500" />
                  Antécédents médicaux
                </CardTitle>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un historique
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {patient.medicalHistories?.length > 0 ? (
                <ul className="space-y-3">
                  {patient.medicalHistories.map((history) => (
                    <li
                      key={history.id}
                      className="flex items-center justify-between gap-4 p-3 border rounded-md dark:border-gray-700"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="shrink-0">
                          {translateStatus(history.status)}
                        </Badge>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {history.title} - {history.condition}
                          </p>
                          {history.diagnosedDate && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Diagnostiqué le:{" "}
                              {formatDate(history.diagnosedDate)}
                            </p>
                          )}
                          {history.details && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {history.details}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setHistoryToDelete(history.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun antécédent médical enregistré
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu de l'onglet Signes vitaux */}
        <TabsContent value="vital-signs">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Activity className="w-6 h-6 text-orange-500" />
                  Signes vitaux
                </CardTitle>
                <Button onClick={() => setIsVitalModalOpen(true)}>
                  {latestVitalSigns ? (
                    <Edit className="mr-2 h-4 w-4" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {latestVitalSigns ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {latestVitalSigns ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {latestVitalSigns.temperature !== undefined && (
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Température
                        </p>
                        <p className="font-medium">
                          {latestVitalSigns.temperature}°C
                        </p>
                      </div>
                    )}
                    {latestVitalSigns.bloodPressureSystolic !== undefined &&
                      latestVitalSigns.bloodPressureDiastolic !== undefined && (
                        <div className="border rounded-md p-3">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Pression artérielle
                          </p>
                          <p className="font-medium">
                            {latestVitalSigns.bloodPressureSystolic}/
                            {latestVitalSigns.bloodPressureDiastolic} mmHg
                          </p>
                        </div>
                      )}
                    {latestVitalSigns.heartRate !== undefined && (
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Rythme cardiaque
                        </p>
                        <p className="font-medium">
                          {latestVitalSigns.heartRate} bpm
                        </p>
                      </div>
                    )}
                    {latestVitalSigns.oxygenSaturation !== undefined && (
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Saturation O₂
                        </p>
                        <p className="font-medium">
                          {latestVitalSigns.oxygenSaturation}%
                        </p>
                      </div>
                    )}
                    {latestVitalSigns.weight !== undefined && (
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Poids
                        </p>
                        <p className="font-medium">
                          {latestVitalSigns.weight} kg
                        </p>
                      </div>
                    )}
                    {latestVitalSigns.height !== undefined && (
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Taille
                        </p>
                        <p className="font-medium">
                          {latestVitalSigns.height} cm
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Mesuré le: {formatDate(latestVitalSigns.recordedAt)}
                  </p>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun signe vital enregistré
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu de l'onglet Consultations */}
        <TabsContent value="appointments">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Rendez-vous</h2>
              <p className="text-sm text-muted-foreground">
                Historique des consultations du patient
              </p>
            </div>
          </div>

          {completedAppointments?.length ? (
            <div className="space-y-4">
              {completedAppointments.map((appt) => (
                <Card
                  key={appt.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="font-medium">
                            {appt.doctor.user.name}
                          </div>
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
                        <Badge
                          className={`${statusColors[appt.status]} capitalize`}
                        >
                          {appt.status.toLowerCase()}
                        </Badge>
                        {appt.medicalRecord && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleViewDiagnosis(appt.id)}
                          >
                            <FileSearch className="h-4 w-4" />
                            Voir dossier
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Aucun rendez-vous trouvé
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal pour ajouter un historique médical */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un historique médical</DialogTitle>
            <DialogDescription>
              Renseignez les détails de la condition médicale du patient.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Hypertension artérielle"
                required
              />
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Ex: Chronique"
                required
              />
            </div>
            <div>
              <Label htmlFor="diagnosedDate">
                Date de diagnostic (optionnel)
              </Label>
              <Input
                id="diagnosedDate"
                type="date"
                value={diagnosedDate}
                onChange={(e) => setDiagnosedDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="details">Détails (optionnel)</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Détails supplémentaires sur la condition"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal pour enregistrer les signes vitaux */}
      <Dialog open={isVitalModalOpen} onOpenChange={setIsVitalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer les signes vitaux</DialogTitle>
            <DialogDescription>
              Renseignez les dernières mesures du patient.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVitalSignsSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperature">Température (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  value={temperature || ""}
                  onChange={(e) =>
                    setTemperature(
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="Ex: 36.6"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="heartRate">Rythme cardiaque (bpm)</Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={heartRate || ""}
                  onChange={(e) =>
                    setHeartRate(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="Ex: 72"
                />
              </div>
              <div>
                <Label htmlFor="bloodPressureSystolic">
                  Pression art. systolique (mmHg)
                </Label>
                <Input
                  id="bloodPressureSystolic"
                  type="number"
                  value={bloodPressureSystolic || ""}
                  onChange={(e) =>
                    setBPsys(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="Ex: 120"
                />
              </div>
              <div>
                <Label htmlFor="bloodPressureDiastolic">
                  Pression art. diastolique (mmHg)
                </Label>
                <Input
                  id="bloodPressureDiastolic"
                  type="number"
                  value={bloodPressureDiastolic || ""}
                  onChange={(e) =>
                    setBPdia(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="Ex: 80"
                />
              </div>
              <div>
                <Label htmlFor="oxygenSaturation">Saturation O₂ (%)</Label>
                <Input
                  id="oxygenSaturation"
                  type="number"
                  value={oxygenSaturation || ""}
                  onChange={(e) =>
                    setOxy(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="Ex: 98"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight || ""}
                  onChange={(e) =>
                    setWeight(
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="Ex: 70.5"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="height">Taille (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height || ""}
                  onChange={(e) =>
                    setHeight(
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="Ex: 175"
                  step="0.1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsVitalModalOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement cet antécédent médical et
              ne pourra pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                historyToDelete && handleDeleteHistory(historyToDelete)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal pour voir le dossier médical */}
      <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Diagnostic & Dossier Médical</DialogTitle>
          </DialogHeader>

          {recordData ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Diagnostic</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  {recordData.diagnosis || "Non spécifié"}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Traitement</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  {recordData.treatment || "Non spécifié"}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">
                  Informations sur le rendez-vous
                </h3>
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <p>
                    <strong>Hôpital :</strong>{" "}
                    {recordData.hospital?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Date du dossier :</strong>{" "}
                    {new Date(recordData.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Motif de consultation :</strong>{" "}
                    {recordData.appointment?.reason || "N/A"}
                  </p>
                </div>
              </div>

              {recordData.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-line">
                    {recordData.notes}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Aucun dossier trouvé pour ce rendez-vous.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
