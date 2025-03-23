'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Stethoscope, Pill, Activity, User, HeartPulse, Calendar, AlertCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { patients } from '@/data/patient-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function PatientMedicalRecord() {
  const { patientId } = useParams();
  const patient = patients.find(p => p.id === parseInt(Array.isArray(patientId) ? patientId[0] : patientId));

  const [isModalOpen, setIsModalOpen] = useState(false); // État pour gérer l'ouverture du modal
  const [title, setTitle] = useState(""); // État pour le titre
  const [details, setDetails] = useState(""); // État pour les détails
  const [date, setDate] = useState(""); // État pour la date

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

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    // Pour l'instant, on affiche simplement les données dans la console
    console.log({ title, details, date });
    setIsModalOpen(false); // Fermer le modal après soumission
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{patient.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Date de naissance: {patient.dateOfBirth} | Groupe sanguin : {patient.bloodType}
                </p>
              </div>
            </CardTitle>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter un historique
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-gray-900 dark:text-gray-100">
              Allergies : {patient.allergies.join(", ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <p className="text-sm text-gray-900 dark:text-gray-100">
              Dernière consultation : {patient.lastVisit} 
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un historique</DialogTitle>
            <DialogDescription>
              Remplissez les détails pour ajouter un nouvel historique médical.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de l'historique"
                required
              />
            </div>
            <div>
              <Label htmlFor="details">Détails</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Détails de l'historique"
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Ajouter</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}