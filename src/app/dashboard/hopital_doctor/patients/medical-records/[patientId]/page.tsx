'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pill, Activity, User, HeartPulse, Calendar, AlertCircle, Plus, Pencil, User2, FileSearch, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader } from '@/components/loader';
import { useToast } from "@/hooks/use-toast";
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
import { debounce } from 'lodash';

interface PatientDetails {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
  };
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

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
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
  prescriptions: Prescription[];
  followUpNeeded: boolean;
  followUpDate?: string | Date | null;
}

interface VitalSignsForm {
  temperature?: number;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
}

interface MedicalHistoryForm {
  title: string;
  condition: string;
  details: string;
  diagnosedDate: string;
}

interface PrescriptionForm {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  startDate: string;
}

export default function PatientMedicalRecord() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isVitalModalOpen, setIsVitalModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordData, setRecordData] = useState<MedicalRecord | null>(null);
  const [isAddingHistory, setIsAddingHistory] = useState(false);
  const [isUpdatingHistory, setIsUpdatingHistory] = useState(false);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);
  const [isUpdatingVitals, setIsUpdatingVitals] = useState(false);
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);
  const [isViewingRecord, setIsViewingRecord] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("infos");
  const [editingHistory, setEditingHistory] = useState<PatientDetails['medicalHistories'][0] | null>(null);
  const { toast } = useToast();

  // État consolidé pour les formulaires
  const [medicalHistoryForm, setMedicalHistoryForm] = useState<MedicalHistoryForm>({
    title: '',
    condition: '',
    details: '',
    diagnosedDate: '',
  });
  const [prescriptionForm, setPrescriptionForm] = useState<PrescriptionForm>({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
  });
  const [vitalSignsForm, setVitalSignsForm] = useState<VitalSignsForm>({
    temperature: undefined,
    heartRate: undefined,
    bloodPressureSystolic: undefined,
    bloodPressureDiastolic: undefined,
    oxygenSaturation: undefined,
    weight: undefined,
    height: undefined,
  });

  const getBloodTypeInfo = (bloodType: string) => {
    const bloodTypeMap: Record<string, { display: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
      'A_POSITIVE': { display: 'A+', variant: 'destructive' },
      'A_NEGATIVE': { display: 'A-', variant: 'outline' },
      'B_POSITIVE': { display: 'B+', variant: 'destructive' },
      'B_NEGATIVE': { display: 'B-', variant: 'outline' },
      'AB_POSITIVE': { display: 'AB+', variant: 'destructive' },
      'AB_NEGATIVE': { display: 'AB-', variant: 'outline' },
      'O_POSITIVE': { display: 'O+', variant: 'destructive' },
      'O_NEGATIVE': { display: 'O-', variant: 'outline' },
    };
    return bloodTypeMap[bloodType] || { display: bloodType, variant: 'secondary' };
  };

  const fetchPatientData = debounce(async () => {
    try {
      setLoading(true);
      const timestamp = Date.now(); // Ajouter un timestamp pour éviter le cache
      const response = await fetch(`/api/hospital_doctor/patient/${patientId}?timestamp=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch patient data');
      }
      const data = await response.json();
      setPatient(data);
      setError(null);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du patient",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    fetchPatientData();
    return () => fetchPatientData.cancel();
  }, [patientId]);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Date inconnue';
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return 'Date invalide';
      return parsedDate.toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  const formatBloodType = (type?: string) => {
    const bloodTypeMap: Record<string, string> = {
      'A_POSITIVE': 'A+',
      'A_NEGATIVE': 'A-',
      'B_POSITIVE': 'B+',
      'B_NEGATIVE': 'B-',
      'AB_POSITIVE': 'AB+',
      'AB_NEGATIVE': 'AB-',
      'O_POSITIVE': 'O+',
      'O_NEGATIVE': 'O-',
    };
    return type ? bloodTypeMap[type] || type : 'Non spécifié';
  };

  const completedAppointments = useMemo(() => {
    return Array.isArray(patient?.appointments)
      ? patient.appointments
          .filter(app => app.status === 'COMPLETED')
          .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      : [];
  }, [patient?.appointments]);

  const prescriptions = useMemo(() => {
    return completedAppointments
      .flatMap(app => app.medicalRecord?.prescriptions || [])
      .filter(pres => pres);
  }, [completedAppointments]);

  const latestVitalSigns = useMemo(() => {
    if (!patient?.vitalSigns || patient.vitalSigns.length === 0) return null;
    return patient.vitalSigns.reduce((latest, current) =>
      new Date(current.recordedAt) > new Date(latest.recordedAt) ? current : latest
    );
  }, [patient?.vitalSigns]);

  useEffect(() => {
    if (latestVitalSigns && isVitalModalOpen) {
      setVitalSignsForm({
        temperature: latestVitalSigns.temperature,
        heartRate: latestVitalSigns.heartRate,
        bloodPressureSystolic: latestVitalSigns.bloodPressureSystolic,
        bloodPressureDiastolic: latestVitalSigns.bloodPressureDiastolic,
        oxygenSaturation: latestVitalSigns.oxygenSaturation,
        weight: latestVitalSigns.weight,
        height: latestVitalSigns.height,
      });
    } else if (!latestVitalSigns && isVitalModalOpen) {
      setVitalSignsForm({
        temperature: undefined,
        heartRate: undefined,
        bloodPressureSystolic: undefined,
        bloodPressureDiastolic: undefined,
        oxygenSaturation: undefined,
        weight: undefined,
        height: undefined,
      });
    }
  }, [latestVitalSigns, isVitalModalOpen]);

  const resetMedicalHistoryForm = () => {
    setEditingHistory(null);
    setMedicalHistoryForm({
      title: '',
      condition: '',
      details: '',
      diagnosedDate: '',
    });
  };

  const resetPrescriptionForm = () => {
    setPrescriptionForm({
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  const resetVitalSignsForm = () => {
    setVitalSignsForm({
      temperature: undefined,
      heartRate: undefined,
      bloodPressureSystolic: undefined,
      bloodPressureDiastolic: undefined,
      oxygenSaturation: undefined,
      weight: undefined,
      height: undefined,
    });
  };

  const handleEditHistory = (history: PatientDetails['medicalHistories'][0]) => {
    setEditingHistory(history);
    setMedicalHistoryForm({
      title: history.title,
      condition: history.condition,
      details: history.details || '',
      diagnosedDate: history.diagnosedDate ? new Date(history.diagnosedDate).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteHistory = async (historyId: string) => {
    setIsDeletingHistory(true);
    try {
      const response = await fetch(`/api/hospital_doctor/patient/${patientId}/medical-history/${historyId}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (response.ok) {
        await fetchPatientData();
        setActiveTab("medical-history");
        toast({
          title: "Succès",
          description: "Antécédent supprimé avec succès",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.error || "Échec de la suppression",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur réseau lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsDeletingHistory(false);
      setIsDeleteModalOpen(false);
      setHistoryToDelete(null);
    }
  };

 const handleMedicalHistorySubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const isEditing = !!editingHistory;
  setIsAddingHistory(!isEditing);
  setIsUpdatingHistory(isEditing);
  try {
    const endpoint = editingHistory
      ? `/api/hospital_doctor/patient/${patientId}/medical-history/${editingHistory.id}`
      : `/api/hospital_doctor/patient/${patientId}/medical-history`;
    const method = editingHistory ? 'PUT' : 'POST';
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      body: JSON.stringify({
        title: medicalHistoryForm.title,
        condition: medicalHistoryForm.condition,
        details: medicalHistoryForm.details,
        diagnosedDate: medicalHistoryForm.diagnosedDate || undefined,
        status: 'ACTIVE',
      }),
    });
    if (response.ok) {
      setIsModalOpen(false);
      resetMedicalHistoryForm();
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchPatientData();
      if (patient?.medicalHistories?.find(h => h.id === editingHistory?.id)?.title !== medicalHistoryForm.title) {
        toast({
          title: "Succès",
          description: "Antécédent supprimé avec succès",
          variant: "default",
        });
        setTimeout(fetchPatientData, 3000); 
      } else {
        setActiveTab("medical-history");
        toast({
          title: "Succès",
          description: isEditing ? "Antécédent mis à jour" : "Antécédent ajouté",
          variant: "default",
        });
      }
    } else {
      const errorData = await response.json();
      toast({
        title: "Erreur",
        description: errorData.error || "Échec de l'opération",
        variant: "destructive",
      });
    }
  } catch {
    toast({
      title: "Erreur",
      description: "Erreur réseau lors de l'opération",
      variant: "destructive",
    });
  } finally {
    setIsAddingHistory(false);
    setIsUpdatingHistory(false);
  }
};

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingPrescription(true);
    try {
      const lastAppointment = completedAppointments[0];
      const medicalRecordId = lastAppointment?.medicalRecord?.id;
      if (!medicalRecordId) {
        toast({
          title: "Erreur",
          description: "Aucun dossier médical trouvé pour ce patient",
          variant: "destructive",
        });
        return;
      }
      const response = await fetch(`/api/hospital_doctor/patient/${patient?.id}/prescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicalRecordId, ...prescriptionForm }),
      });
      if (response.ok) {
        await fetchPatientData();
        setIsPrescriptionModalOpen(false);
        resetPrescriptionForm();
        setActiveTab("prescriptions");
        toast({
          title: "Succès",
          description: "Prescription ajoutée",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.error || "Échec de l'ajout de la prescription",
          variant: "destructive",
        });
      }
    } catch  {
      toast({
        title: "Erreur",
        description: "Erreur réseau lors de l'ajout de la prescription",
        variant: "destructive",
      });
    } finally {
      setIsAddingPrescription(false);
    }
  };

  const handleVitalSignsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingVitals(true);
    try {
      const response = await fetch(`/api/hospital_doctor/patient/${patientId}/vital-signs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitalSignsForm),
      });
      if (response.ok) {
        await fetchPatientData();
        setIsVitalModalOpen(false);
        resetVitalSignsForm();
        setActiveTab("vital-signs");
        toast({
          title: "Succès",
          description: "Signes vitaux mis à jour",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.error || "Échec de la mise à jour",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur réseau lors de la mise à jour des signes vitaux",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingVitals(false);
    }
  };

  const handleViewDiagnosis = async (appointmentId: string) => {
    setIsViewingRecord(true);
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/hospital_doctor/history/record?appointmentId=${appointmentId}&timestamp=${timestamp}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) throw new Error('Failed to fetch medical record');
      const data = await res.json();
      setRecordData(data[0] || null);
      setIsRecordModalOpen(true);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger le dossier médical",
        variant: "destructive",
      });
    } finally {
      setIsViewingRecord(false);
    }
  };

  const translateStatus = (status: string) => {
    const statusTranslations: Record<string, string> = {
      'ACTIVE': 'Actif',
      'INACTIVE': 'Inactif',
      'CHRONIC': 'Chronique',
      'RESOLVED': 'Résolu',
      'PENDING': 'En attente',
      'CONTROLLED': 'Contrôlé',
    };
    return statusTranslations[status] || status;
  };

  const statusColors = {
    CONFIRMED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-800",
    COMPLETED: "bg-blue-100 text-blue-800",
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!patient) return <div>Patient non trouvé</div>;

  return (
    <div className="p-6 space-y-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
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
                  Date de naissance: {patient.user ? formatDate(patient.user.dateOfBirth) : 'Non spécifiée'} | Groupe sanguin : <Badge
                    variant="outline"
                    className="border-blue-500 text-blue-500 dark:border-blue-300 dark:text-blue-300"
                  >
                    {formatBloodType(patient.bloodType)}
                  </Badge>
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
                Dernière consultation : {formatDate(completedAppointments[0].scheduledAt)} avec {completedAppointments[0].doctor.user.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          {/* <TabsTrigger value="prescriptions">
            <Pill className="w-4 h-4 mr-2" />
            Prescriptions
          </TabsTrigger> */}
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
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Coordonnées</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Email:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {patient.user?.email || "Email inconnu"}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Téléphone:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {patient.user?.phone || "Téléphone inconnu"}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Informations médicales</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Date de naissance:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {patient.user ? formatDate(patient.user.dateOfBirth) : 'Date de naissance non disponible'}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Groupe sanguin:</span>
                      <Badge
                        variant="outline"
                        className="border-blue-500 text-blue-500 dark:border-blue-300 dark:text-blue-300"
                      >
                        {formatBloodType(patient.bloodType)}
                      </Badge>
                    </div>
                    {patient.allergies && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Allergies:</span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{patient.allergies}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Urgence</h3>
                  <div className="space-y-2">
                    {patient.emergencyContact && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Contact:</span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{patient.emergencyContact}</p>
                      </div>
                    )}
                    {patient.emergencyPhone && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Téléphone:</span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{patient.emergencyPhone}</p>
                      </div>
                    )}
                    {patient.emergencyRelation && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Relation:</span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{patient.emergencyRelation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical-history">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <HeartPulse className="w-6 h-6 text-purple-500" />
                  Antécédents médicaux
                </CardTitle>
                <Button onClick={() => {
                  resetMedicalHistoryForm();
                  setIsModalOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un historique
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {patient.medicalHistories?.length > 0 ? (
                <ul className="space-y-3">
                  {patient.medicalHistories.map((history) => (
                    <li key={history.id} className="flex justify-between items-start gap-4 p-3 border rounded-md dark:border-gray-700">
                      <div className="flex items-center gap-4 flex-1">
                        <Badge variant="outline" className="shrink-0">
                          {translateStatus(history.status)}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{history.title} - {history.condition}</p>
                          {history.diagnosedDate && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Diagnostiqué le: {formatDate(history.diagnosedDate)}
                            </p>
                          )}
                          {history.details && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{history.details}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditHistory(history)}
                          disabled={isAddingHistory || isUpdatingHistory || isDeletingHistory}
                        >
                          {isUpdatingHistory && editingHistory?.id === history.id ? (
                            <Loader className="mr-2 h-4 w-4" />
                          ) : null}
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setHistoryToDelete(history.id);
                            setIsDeleteModalOpen(true);
                          }}
                          disabled={isDeletingHistory || isAddingHistory || isUpdatingHistory}
                        >
                          {isDeletingHistory ? (
                            <Loader className="mr-2 h-4 w-4" />
                          ) : null}
                          Supprimer
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun antécédent médical enregistré</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vital-signs">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Activity className="w-6 h-6 text-orange-500" />
                  Signes vitaux
                </CardTitle>
                <Button onClick={() => {
                  resetVitalSignsForm();
                  setIsVitalModalOpen(true);
                }}>
                  {latestVitalSigns ? (
                    <>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {latestVitalSigns ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {latestVitalSigns.temperature !== undefined && (
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Température</p>
                        <p className="font-medium">{latestVitalSigns.temperature}°C</p>
                      </div>
                    )}
                    {latestVitalSigns.bloodPressureSystolic !== undefined && latestVitalSigns.bloodPressureDiastolic !== undefined && (
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pression artérielle</p>
                        <p className="font-medium">
                          {latestVitalSigns.bloodPressureSystolic}/{latestVitalSigns.bloodPressureDiastolic} mmHg
                        </p>
                      </div>
                    )}
                    {latestVitalSigns.heartRate !== undefined && (
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Rythme cardiaque</p>
                        <p className="font-medium">{latestVitalSigns.heartRate} bpm</p>
                      </div>
                    )}
                    {latestVitalSigns.oxygenSaturation !== undefined && (
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Saturation O₂</p>
                        <p className="font-medium">{latestVitalSigns.oxygenSaturation}%</p>
                      </div>
                    )}
                    {latestVitalSigns.weight !== undefined && (
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Poids</p>
                        <p className="font-medium">{latestVitalSigns.weight} kg</p>
                      </div>
                    )}
                    {latestVitalSigns.height !== undefined && (
                      <div className="border rounded-md p-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Taille</p>
                        <p className="font-medium">{latestVitalSigns.height} cm</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Mesuré le: {formatDate(latestVitalSigns.recordedAt)}
                  </p>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun signe vital enregistré</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Pill className="w-6 h-6 text-green-500" />
                  Prescriptions en cours
                </CardTitle>
                <Button onClick={() => {
                  resetPrescriptionForm();
                  setIsPrescriptionModalOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Nouvelle prescription
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {prescriptions.length > 0 ? (
                <ul className="space-y-3">
                  {prescriptions.map((prescription) => (
                    <li key={prescription.id} className="p-3 border rounded-md dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{prescription.medicationName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {prescription.dosage} - {prescription.frequency} {prescription.duration && `(${prescription.duration})`}
                          </p>
                          {prescription.instructions && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Instructions: {prescription.instructions}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          En cours
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucune prescription active</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                <Card key={appt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{appt.doctor.user.name}</div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">
                            {new Date(appt.scheduledAt).toLocaleDateString()}
                          </span>
                          <span className="mx-2">•</span>
                          <span>
                            {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Motif : {appt.reason || 'Non spécifié'}
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <Badge className={`${statusColors[appt.status]} capitalize`}>
                          {appt.status.toLowerCase()}
                        </Badge>
                        {appt.medicalRecord && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleViewDiagnosis(appt.id)}
                            disabled={isViewingRecord}
                          >
                            {isViewingRecord ? (
                              <Loader className="h-4 w-4" />
                            ) : (
                              <FileSearch className="h-4 w-4" />
                            )}
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
              <p className="text-sm text-muted-foreground">Aucun rendez-vous trouvé</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) resetMedicalHistoryForm();
        setIsModalOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingHistory ? "Modifier l'historique médical" : "Ajouter un historique médical"}
            </DialogTitle>
            <DialogDescription>
              {editingHistory
                ? "Modifiez les détails de la condition médicale du patient."
                : "Renseignez les détails de la condition médicale du patient."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMedicalHistorySubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={medicalHistoryForm.title}
                onChange={(e) => setMedicalHistoryForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Hypertension artérielle"
                required
              />
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                value={medicalHistoryForm.condition}
                onChange={(e) => setMedicalHistoryForm(prev => ({ ...prev, condition: e.target.value }))}
                placeholder="Ex: Chronique"
                required
              />
            </div>
            <div>
              <Label htmlFor="diagnosedDate">Date de diagnostic (optionnel)</Label>
              <Input
                id="diagnosedDate"
                type="date"
                value={medicalHistoryForm.diagnosedDate}
                onChange={(e) => setMedicalHistoryForm(prev => ({ ...prev, diagnosedDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="details">Détails (optionnel)</Label>
              <Textarea
                id="details"
                value={medicalHistoryForm.details}
                onChange={(e) => setMedicalHistoryForm(prev => ({ ...prev, details: e.target.value }))}
                placeholder="Détails supplémentaires sur la condition"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetMedicalHistoryForm();
                  setIsModalOpen(false);
                }}
                disabled={isAddingHistory || isUpdatingHistory}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isAddingHistory || isUpdatingHistory}
              >
                {isAddingHistory || isUpdatingHistory ? (
                  <>
                    <Loader className="mr-2 h-4 w-4" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isVitalModalOpen} onOpenChange={(open) => {
        if (!open) resetVitalSignsForm();
        setIsVitalModalOpen(open);
      }}>
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
                  value={vitalSignsForm.temperature ?? ''}
                  onChange={(e) => setVitalSignsForm(prev => ({
                    ...prev,
                    temperature: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))}
                  placeholder="Ex: 36.6"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="heartRate">Rythme cardiaque (bpm)</Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={vitalSignsForm.heartRate ?? ''}
                  onChange={(e) => setVitalSignsForm(prev => ({
                    ...prev,
                    heartRate: e.target.value ? parseInt(e.target.value) : undefined,
                  }))}
                  placeholder="Ex: 72"
                />
              </div>
              <div>
                <Label htmlFor="bloodPressureSystolic">Pression art. systolique (mmHg)</Label>
                <Input
                  id="bloodPressureSystolic"
                  type="number"
                  value={vitalSignsForm.bloodPressureSystolic ?? ''}
                  onChange={(e) => setVitalSignsForm(prev => ({
                    ...prev,
                    bloodPressureSystolic: e.target.value ? parseInt(e.target.value) : undefined,
                  }))}
                  placeholder="Ex: 120"
                />
              </div>
              <div>
                <Label htmlFor="bloodPressureDiastolic">Pression art. diastolique (mmHg)</Label>
                <Input
                  id="bloodPressureDiastolic"
                  type="number"
                  value={vitalSignsForm.bloodPressureDiastolic ?? ''}
                  onChange={(e) => setVitalSignsForm(prev => ({
                    ...prev,
                    bloodPressureDiastolic: e.target.value ? parseInt(e.target.value) : undefined,
                  }))}
                  placeholder="Ex: 80"
                />
              </div>
              <div>
                <Label htmlFor="oxygenSaturation">Saturation O₂ (%)</Label>
                <Input
                  id="oxygenSaturation"
                  type="number"
                  value={vitalSignsForm.oxygenSaturation ?? ''}
                  onChange={(e) => setVitalSignsForm(prev => ({
                    ...prev,
                    oxygenSaturation: e.target.value ? parseInt(e.target.value) : undefined,
                  }))}
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
                  value={vitalSignsForm.weight ?? ''}
                  onChange={(e) => setVitalSignsForm(prev => ({
                    ...prev,
                    weight: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))}
                  placeholder="Ex: 70.5"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="height">Taille (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={vitalSignsForm.height ?? ''}
                  onChange={(e) => setVitalSignsForm(prev => ({
                    ...prev,
                    height: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))}
                  placeholder="Ex: 175"
                  step="0.1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetVitalSignsForm();
                  setIsVitalModalOpen(false);
                }}
                disabled={isUpdatingVitals}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingVitals}
              >
                {isUpdatingVitals ? (
                  <Loader className="mr-2 h-4 w-4" />
                ) : null}
                Enregistrer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPrescriptionModalOpen} onOpenChange={(open) => {
        if (!open) resetPrescriptionForm();
        setIsPrescriptionModalOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle prescription</DialogTitle>
            <DialogDescription>
              Renseignez les détails du médicament à prescrire.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
            <div>
              <Label htmlFor="medicationName">Nom du médicament</Label>
              <Input
                id="medicationName"
                value={prescriptionForm.medicationName}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medicationName: e.target.value }))}
                placeholder="Ex: Paracétamol"
                required
              />
            </div>
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={prescriptionForm.dosage}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="Ex: 500mg"
                required
              />
            </div>
            <div>
              <Label htmlFor="frequency">Fréquence</Label>
              <Input
                id="frequency"
                value={prescriptionForm.frequency}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, frequency: e.target.value }))}
                placeholder="Ex: 3 fois par jour"
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Durée (optionnel)</Label>
              <Input
                id="duration"
                value={prescriptionForm.duration}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Ex: 7 jours"
              />
            </div>
            <div>
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                value={prescriptionForm.startDate}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="instructions">Instructions (optionnel)</Label>
              <Textarea
                id="instructions"
                value={prescriptionForm.instructions}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Instructions particulières"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetPrescriptionForm();
                  setIsPrescriptionModalOpen(false);
                }}
                disabled={isAddingPrescription}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isAddingPrescription}
              >
                {isAddingPrescription ? (
                  <Loader className="mr-2 h-4 w-4" />
                ) : null}
                Prescrire
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
                  {recordData.diagnosis || 'Non spécifié'}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Traitement</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  {recordData.treatment || 'Non spécifié'}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Informations sur le rendez-vous</h3>
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <p><strong>Hôpital :</strong> {recordData.hospital?.name || 'N/A'}</p>
                  <p><strong>Date du dossier :</strong> {new Date(recordData.createdAt).toLocaleDateString()}</p>
                  <p><strong>Motif de consultation :</strong> {recordData.appointment?.reason || 'N/A'}</p>
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
              {recordData.followUpNeeded && (
                <div>
                  <h3 className="font-medium mb-2">Suivi</h3>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p>Un suivi est nécessaire</p>
                    {recordData.followUpDate && (
                      <p className="mt-2">
                        Date de suivi: {new Date(recordData.followUpDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {recordData.patient?.bloodType && (
                <div>
                  <h3 className="font-medium mb-2">Informations patient</h3>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p>
                      Groupe sanguin: {' '}
                      <Badge variant={getBloodTypeInfo(recordData.patient.bloodType).variant}>
                        {getBloodTypeInfo(recordData.patient.bloodType).display}
                      </Badge>
                    </p>
                  </div>
                </div>
              )}
              {recordData.prescriptions?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Prescriptions ({recordData.prescriptions.length})</h3>
                  <div className="space-y-2">
                    {recordData.prescriptions.map((pres: Prescription) => (
                      <div key={pres.id} className="p-3 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{pres.medicationName}</p>
                            <p className="text-sm text-muted-foreground">
                              {pres.dosage} • {pres.frequency} • {pres.duration}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Aucun dossier trouvé pour ce rendez-vous.</p>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement cet antécédent médical. Vous ne pourrez pas annuler cette action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setHistoryToDelete(null);
                setIsDeleteModalOpen(false);
              }}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => historyToDelete && handleDeleteHistory(historyToDelete)}
              disabled={isDeletingHistory}
            >
              {isDeletingHistory ? (
                <Loader className="mr-2 h-4 w-4" />
              ) : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}