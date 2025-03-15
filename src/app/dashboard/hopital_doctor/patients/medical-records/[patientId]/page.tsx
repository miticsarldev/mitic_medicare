'use client';

import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Stethoscope, Pill, Activity, FileText, User, HeartPulse, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { patients } from '@/data/patient-data';

export default function PatientMedicalRecord() {
  const { patientId } = useParams();
  const patient = patients.find(p => p.id === parseInt(Array.isArray(patientId) ? patientId[0] : patientId));

  if (!patient) {
    return <div>Patient non trouvé</div>;
  }

  const medicalHistory = [
    { id: 1, type: "Maladie", description: "Hypertension artérielle", date: "2018" },
    { id: 2, type: "Intervention", description: "Appendicectomie", date: "2010" },
    { id: 3, type: "Allergie", description: "Pénicilline", date: "2005" },
  ];

  const consultations = [
    { id: 1, date: "12 Mars 2024", reason: "Contrôle annuel", diagnosis: "Tout va bien" },
    { id: 2, date: "10 Février 2024", reason: "Douleurs thoraciques", diagnosis: "Reflux gastro-œsophagien" },
    { id: 3, date: "15 Janvier 2024", reason: "Vaccination", diagnosis: "Vaccin contre la grippe administré" },
  ];

  const prescriptions = [
    { id: 1, medication: "Paracétamol", dosage: "500mg", frequency: "3 fois par jour", duration: "7 jours" },
    { id: 2, medication: "Oméprazole", dosage: "20mg", frequency: "1 fois par jour", duration: "30 jours" },
  ];

  const labResults = [
    { id: 1, test: "Analyse sanguine", date: "10 Mars 2024", result: "Normal" },
    { id: 2, test: "Radiographie thoracique", date: "11 Mars 2024", result: "Aucune anomalie détectée" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* En-tête : Informations du patient */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <User className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{patient.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
               Date de naissance: {patient.dateOfBirth} {} | Groupe sanguin : {patient.bloodType}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-gray-900 dark:text-gray-100">
              Allergies : {patient.allergies}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <p className="text-sm text-gray-900 dark:text-gray-100">
              Dernière consultation : {patient.lastVisit} | Prochain rendez-vous : {}
            </p>
          </div>
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
          <ul className="space-y-3">
            {medicalHistory.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-3 border rounded-md dark:border-gray-700">
                <Badge variant="outline" className="shrink-0">
                  {item.type}
                </Badge>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section : Consultations récentes */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Stethoscope className="w-6 h-6 text-blue-500" />
            Consultations récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {consultations.map((consultation) => (
              <li key={consultation.id} className="p-3 border rounded-md dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{consultation.reason}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{consultation.date}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {consultation.diagnosis}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section : Prescriptions en cours */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Pill className="w-6 h-6 text-green-500" />
            Prescriptions en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {prescriptions.map((prescription) => (
              <li key={prescription.id} className="p-3 border rounded-md dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{prescription.medication}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {prescription.dosage} - {prescription.frequency} ({prescription.duration})
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    En cours
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section : Résultats d'analyses */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Activity className="w-6 h-6 text-orange-500" />
            Résultats d&aposanalyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {labResults.map((result) => (
              <li key={result.id} className="p-3 border rounded-md dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{result.test}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{result.date}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {result.result}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section : Notes médicales */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <FileText className="w-6 h-6 text-gray-500" />
            Notes médicales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            rows={4}
            placeholder="Ajouter une note médicale..."
          />
        </CardContent>
      </Card>
    </div>
  );
}