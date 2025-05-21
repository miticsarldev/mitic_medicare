'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pill, Activity, User, HeartPulse, Calendar, AlertCircle, Plus, User2 } from "lucide-react";
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

export default function PatientMedicalRecord() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState("");
  const [details, setDetails] = useState("");
  const [diagnosedDate, setDiagnosedDate] = useState("");
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
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

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch(`/api/hospital_doctor/patient/${patientId}`);
        if (!response.ok) {
          throw new Error('Patient non trouvé');
        }
        const data = await response.json();
        setPatient(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Une erreur est survenue");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const formatDate = (date: Date) => new Date(date).toLocaleDateString();
  const formatBloodType = (type?: string) => type ? type.replace('_', ' ') : 'Non spécifié';

  const completedAppointments = Array.isArray(patient?.appointments)
  ? patient.appointments
      .filter(app => app.status === 'COMPLETED')
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
  : [];

  const prescriptions = completedAppointments
    .flatMap(app => app.medicalRecord?.prescriptions || [])
    .filter(pres => pres);

  const latestVitalSigns = useMemo(() => {
    if (!patient?.vitalSigns || patient.vitalSigns.length === 0) return null;
    return patient.vitalSigns.reduce((latest, current) =>
      new Date(current.recordedAt) > new Date(latest.recordedAt) ? current : latest
    );
  }, [patient?.vitalSigns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/hospital_doctor/patient/${patientId}/medical-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, condition, details, diagnosedDate: diagnosedDate || undefined, status: 'ACTIVE' })
      });
      if (response.ok) {
        const updatedPatient = await response.json();
        setPatient(updatedPatient);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'historique", err);
    }
  };
  const handleViewDiagnosis = async (appointmentId: string) => {
    try {
    const res = await fetch(`/api/hospital_doctor/history/record?appointmentId=${appointmentId}`);
    const data = await res.json();
    setRecordData(data[0]); 
    setIsRecordModalOpen(true);
  } catch (error) {
    console.error("Erreur lors de la récupération du dossier médical:", error);
  }
    };

  const translateStatus = (status: string) => {
  const statusTranslations: Record<string, string> = {
    'ACTIVE': 'Actif',
    'INACTIVE': 'Inactif', 
    'CHRONIC': 'Chronique',
    'RESOLVED': 'Résolu',
    'PENDING': 'En attente',
    'CONTROLLED': 'Contrôlé'
  };
  
  return statusTranslations[status] || status;
};
  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lastAppointment = completedAppointments[0];
      const medicalRecordId = lastAppointment?.medicalRecord?.id;
      const response = await fetch(`/api/hospital_doctor/patient/${patient?.id}/prescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicalRecordId, medicationName, dosage, frequency, duration: duration || undefined, instructions: instructions || undefined, startDate })
      });
      if (response.ok) {
        const updatedPatient = await response.json();
        setPatient(updatedPatient);
        setIsPrescriptionModalOpen(false);
        setMedicationName(''); setDosage(''); setFrequency(''); setDuration(''); setInstructions('');
        setStartDate(new Date().toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout de la prescription", err);
    }
  };

const handleVitalSignsSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await fetch(`/api/hospital_doctor/patient/${patientId}/vital-signs`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        temperature: temperature || null,
        heartRate: heartRate || null,
        bloodPressureSystolic: bloodPressureSystolic || null,
        bloodPressureDiastolic: bloodPressureDiastolic || null,
        oxygenSaturation: oxygenSaturation || null,
        weight: weight || null,
        height: height || null
      })
    });

    if (response.ok) {
      const updatedPatient = await response.json();
      setPatient(updatedPatient);
      setIsVitalModalOpen(false);
    } else {
      const errorData = await response.json();
      console.error("Erreur lors de la mise à jour:", errorData.error);
    }
  } catch (err) {
    console.error("Erreur réseau lors de la mise à jour des signes vitaux", err);
  }
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
                  Date de naissance: {formatDate(patient.dateOfBirth)} | Groupe sanguin : {formatBloodType(patient.bloodType)}
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
                Dernière consultation : {formatDate(completedAppointments[0].scheduledAt)} avec Dr. {completedAppointments[0].doctor.user.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Système d'onglets */}
      <Tabs defaultValue="medical-history" className="w-full">
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
                {patient.user?.phone || "phone inconnu"}
              </p> 
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Informations médicales</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Date de naissance:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(patient.dateOfBirth)}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Groupe sanguin:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100">{formatBloodType(patient.bloodType)}</p>
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

          {/* <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assurance</h3>
            <div className="space-y-2">
              {patient.insuranceProvider && (
                <div className="flex items-start gap-3">
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Assureur:</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{patient.insuranceProvider}</p>
                </div>
              )}
              {patient.insuranceNumber && (
                <div className="flex items-start gap-3">
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Numéro:</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{patient.insuranceNumber}</p>
                </div>
              )}
            </div>
          </div> */}
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
                    <li key={history.id} className="flex items-center gap-4 p-3 border rounded-md dark:border-gray-700">
                      <Badge variant="outline" className="shrink-0">
                        {translateStatus(history.status)}
                      </Badge>
                      <div>
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
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun antécédent médical enregistré</p>
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
          <Plus className="mr-2 h-4 w-4" /> 
          {latestVitalSigns ? 'Modifier' : 'Ajouter'}
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

        {/* Contenu de l'onglet Prescriptions */}
        <TabsContent value="prescriptions">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Pill className="w-6 h-6 text-green-500" />
                  Prescriptions en cours
                </CardTitle>
                <Button onClick={() => setIsPrescriptionModalOpen(true)}>
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

        {/* Contenu de l'onglet Consultations */}
        <TabsContent value="appointments">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Calendar className="w-6 h-6 text-blue-500" />
                Historique des consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedAppointments.length > 0 ? (
                <ul className="space-y-4">
                  {completedAppointments.map((appointment) => (
                    <li key={appointment.id} className="border rounded-md p-4 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Consultation avec Dr. {appointment.doctor.user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(appointment.scheduledAt)} - {appointment.type}
                          </p>
                          {appointment.reason && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Motif: {appointment.reason}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleViewDiagnosis(appointment.id)}
                        >
                          Voir diagnostic
                        </Button>
                      </div>
                      {appointment.medicalRecord && (
                        <div className="mt-3 pt-3 border-t dark:border-gray-700">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Diagnostic: {appointment.medicalRecord.diagnosis}
                          </p>
                          {appointment.medicalRecord.treatment && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Traitement: {appointment.medicalRecord.treatment}
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucune consultation terminée</p>
              )}
            </CardContent>
          </Card>
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
              <Label htmlFor="diagnosedDate">Date de diagnostic (optionnel)</Label>
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </div>
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
            value={temperature || ''}
            onChange={(e) => setTemperature(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Ex: 36.6"
            step="0.1"
          />
        </div>
        <div>
          <Label htmlFor="heartRate">Rythme cardiaque (bpm)</Label>
          <Input
            id="heartRate"
            type="number"
            value={heartRate || ''}
            onChange={(e) => setHeartRate(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Ex: 72"
          />
        </div>
        <div>
          <Label htmlFor="bloodPressureSystolic">Pression art. systolique (mmHg)</Label>
          <Input
            id="bloodPressureSystolic"
            type="number"
            value={bloodPressureSystolic || ''}
            onChange={(e) => setBPsys(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Ex: 120"
          />
        </div>
        <div>
          <Label htmlFor="bloodPressureDiastolic">Pression art. diastolique (mmHg)</Label>
          <Input
            id="bloodPressureDiastolic"
            type="number"
            value={bloodPressureDiastolic || ''}
            onChange={(e) => setBPdia(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Ex: 80"
          />
        </div>
        <div>
          <Label htmlFor="oxygenSaturation">Saturation O₂ (%)</Label>
          <Input
            id="oxygenSaturation"
            type="number"
            value={oxygenSaturation || ''}
            onChange={(e) => setOxy(e.target.value ? parseInt(e.target.value) : undefined)}
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
            value={weight || ''}
            onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Ex: 70.5"
            step="0.1"
          />
        </div>
        <div>
          <Label htmlFor="height">Taille (cm)</Label>
          <Input
            id="height"
            type="number"
            value={height || ''}
            onChange={(e) => setHeight(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Ex: 175"
            step="0.1"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setIsVitalModalOpen(false)}>
          Annuler
        </Button>
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  </DialogContent>
</Dialog>

<Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Diagnostic & Dossier Médical</DialogTitle>
    </DialogHeader>

    {recordData ? (
      <div className="space-y-3 text-sm">
        <p><strong>📝 Diagnostic :</strong> {recordData.diagnosis || 'N/A'}</p>
        <p><strong>💊 Traitement :</strong> {recordData.treatment || 'N/A'}</p>

        <p><strong>🏥 Hôpital :</strong> {recordData.hospital?.name || 'N/A'}</p>
        <p><strong>📅 Date du dossier :</strong> {new Date(recordData.createdAt).toLocaleDateString()}</p>

        <p><strong>📋 Statut du rendez-vous :</strong> {recordData.appointment?.status || 'N/A'}</p>
        <p><strong>📄 Motif de consultation :</strong> {recordData.appointment?.reason || 'N/A'}</p>

        <p><strong>🧾 Notes :</strong> {recordData.notes || 'N/A'}</p>

        {recordData.followUpNeeded && (
          <p><strong>📅 Suivi nécessaire le :</strong> {recordData.followUpDate ? new Date(recordData.followUpDate).toLocaleDateString() : 'À définir'}</p>
        )}

        {recordData.patient?.bloodType && (
          <p><strong>🩸 Groupe sanguin :</strong> {recordData.patient.bloodType}</p>
        )}

        {recordData.prescriptions?.length > 0 && (
          <div>
            <p className="font-semibold mt-4">💊 Prescriptions :</p>
            <ul className="list-disc list-inside">
              {recordData.prescriptions.map((pres: Prescription) => (
                <li key={pres.id}>
                  {pres.medicationName} - {pres.dosage} - {pres.frequency} pendant {pres.duration}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ) : (
      <p>Aucun dossier trouvé pour ce rendez-vous.</p>
    )}
  </DialogContent>
</Dialog>


      {/* Modal pour ajouter une prescription */}
      <Dialog open={isPrescriptionModalOpen} onOpenChange={setIsPrescriptionModalOpen}>
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
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                placeholder="Ex: Paracétamol"
                required
              />
            </div>
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Ex: 500mg"
                required
              />
            </div>
            <div>
              <Label htmlFor="frequency">Fréquence</Label>
              <Input
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="Ex: 3 fois par jour"
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Durée (optionnel)</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex: 7 jours"
              />
            </div>
            <div>
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="instructions">Instructions (optionnel)</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Instructions particulières"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPrescriptionModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Prescrire</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}