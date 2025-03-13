'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Stethoscope, Pill, Activity, FileText, User, HeartPulse, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PatientMedicalRecord() {
 
  const patient = {
    name: "Jean Dupont",
    age: 45,
    gender: "Homme",
    bloodType: "A+",
    allergies: ["Pénicilline", "Noix"],
    lastConsultation: "12 Mars 2024",
    nextAppointment: "20 Mars 2024",
  };

  
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
    <div className="p-6 space-y-6">
      
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <User className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">{patient.name}</h1>
              <p className="text-sm text-gray-500">
                {patient.age} ans, {patient.gender} | Groupe sanguin : {patient.bloodType}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm">
              Allergies : {patient.allergies.join(", ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <p className="text-sm">
              Dernière consultation : {patient.lastConsultation} | Prochain rendez-vous : {patient.nextAppointment}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section : Antécédents médicaux */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-purple-500" />
            Antécédents médicaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {medicalHistory.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-3 border rounded-md">
                <Badge variant="outline" className="shrink-0">
                  {item.type}
                </Badge>
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section : Consultations récentes */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-blue-500" />
            Consultations récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {consultations.map((consultation) => (
              <li key={consultation.id} className="p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{consultation.reason}</p>
                    <p className="text-sm text-gray-500">{consultation.date}</p>
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
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-6 h-6 text-green-500" />
            Prescriptions en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {prescriptions.map((prescription) => (
              <li key={prescription.id} className="p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{prescription.medication}</p>
                    <p className="text-sm text-gray-500">
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
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-orange-500" />
            Résultats d&aposanalyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {labResults.map((result) => (
              <li key={result.id} className="p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{result.test}</p>
                    <p className="text-sm text-gray-500">{result.date}</p>
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
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-gray-500" />
            Notes médicales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Ajouter une note médicale..."
          />
        </CardContent>
      </Card>
    </div>
  );
}