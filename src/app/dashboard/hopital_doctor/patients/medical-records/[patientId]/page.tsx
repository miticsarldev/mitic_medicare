'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {  Pill, Activity, User, HeartPulse, Calendar, AlertCircle, Plus } from "lucide-react";
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

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!patient) return <div>Patient non trouvé</div>;

  // Formater les données pour l'affichage
  const formatDate = (date: Date) => new Date(date).toLocaleDateString();
  const formatBloodType = (type?: string) => type ? type.replace('_', ' ') : 'Non spécifié';

  // Filtrer les consultations complétées
  const completedAppointments = patient.appointments
    .filter(app => app.status === 'COMPLETED')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  // Récupérer toutes les prescriptions
  const prescriptions = completedAppointments
    .flatMap(app => app.medicalRecord?.prescriptions || [])
    .filter(pres => pres);

  // Récupérer les signes vitaux
  const latestVitalSigns = patient.vitalSigns.length > 0 
    ? patient.vitalSigns.reduce((latest, current) => 
        new Date(current.recordedAt) > new Date(latest.recordedAt) ? current : latest
      )
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/hospital_doctor/patient/${patientId}/medical-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          condition,
          details,
          diagnosedDate: diagnosedDate || undefined,
          status: 'ACTIVE'
        })
      });

      if (response.ok) {
        const updatedPatient = await response.json();
        setPatient(updatedPatient);
        setIsModalOpen(false);
        setTitle('');
        setCondition('');
        setDetails('');
        setDiagnosedDate('');
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'historique", err);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* En-tête : Informations du patient */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-4">
              <User className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{patient.user.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Date de naissance: {formatDate(patient.dateOfBirth)} | Groupe sanguin : {formatBloodType(patient.bloodType)}
                </p>
              </div>
            </CardTitle>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter un historique
            </Button>
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

      {/* Section : Antécédents médicaux */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <HeartPulse className="w-6 h-6 text-purple-500" />
            Antécédents médicaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.medicalHistories.length > 0 ? (
            <ul className="space-y-3">
              {patient.medicalHistories.map((history) => (
                <li key={history.id} className="flex items-center gap-4 p-3 border rounded-md dark:border-gray-700">
                  <Badge variant="outline" className="shrink-0">
                    {history.status}
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

      {/* Section : Signes vitaux */}
      {latestVitalSigns && (
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Activity className="w-6 h-6 text-orange-500" />
              Signes vitaux récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {latestVitalSigns.temperature && (
                <div className="border rounded-md p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Température</p>
                  <p className="font-medium">{latestVitalSigns.temperature}°C</p>
                </div>
              )}
              {latestVitalSigns.bloodPressureSystolic && latestVitalSigns.bloodPressureDiastolic && (
                <div className="border rounded-md p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pression artérielle</p>
                  <p className="font-medium">
                    {latestVitalSigns.bloodPressureSystolic}/{latestVitalSigns.bloodPressureDiastolic} mmHg
                  </p>
                </div>
              )}
              {latestVitalSigns.heartRate && (
                <div className="border rounded-md p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rythme cardiaque</p>
                  <p className="font-medium">{latestVitalSigns.heartRate} bpm</p>
                </div>
              )}
              {latestVitalSigns.oxygenSaturation && (
                <div className="border rounded-md p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Saturation O₂</p>
                  <p className="font-medium">{latestVitalSigns.oxygenSaturation}%</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Mesuré le: {formatDate(latestVitalSigns.recordedAt)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Section : Prescriptions en cours */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Pill className="w-6 h-6 text-green-500" />
            Prescriptions en cours
          </CardTitle>
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
    </div>
  );
}