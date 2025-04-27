'use client';

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Calendar as CalendarIcon,
    User2,
    Users2,
    Info,
    Mail,
    Phone,
    MapPin,
    Star,
    Notebook,
    HeartPulse,
    FileText,
    History,
    User,
    Calendar1,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Patient } from "@/types/patient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateAppointmentModal } from "./CreateAppointmentModal";
import { CreateVitalSignModal } from "./CreateVitalSignModal";
import { CreateMedicalHistoryModal } from "./CreateMedicalHistoryModal";
import { AppointmentStatus } from "@prisma/client";

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
};

//type historique medical
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

//type vital signs
type vitalSign = { 
    id: string;
    temperature?: number;
    heartRate?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    notes?: string;
    recordedAt: Date;
    createdAt: Date;
  } 


export default function PatientProfilePage({ patient }: { patient: Patient }) {
    const [appointments, setAppointments] = useState<Appointment[]>(patient.appointments || []);
    const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>(patient.medicalHistories || []);
    const [vitalSigns, setVitalSigns] = useState<vitalSign[]>(patient.vitalSigns || []);
    const [selectedDate, setSelectedDate] = useState(new Date());

    if (!patient) return <div className="p-4 text-center">Chargement...</div>;

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase();
    };

    // Fonction pour ajouter un rendez-vous à la liste locale
    const addAppointment = (newAppointment: Appointment) => {
        setAppointments((prev) => [...prev, newAppointment]);
    };

    // Fonction pour ajouter un historique médical à la liste locale
    const addMedicalHistory = (newHistory: MedicalHistory) => {
        setMedicalHistories((prev) => [...prev, newHistory]);
    }

    // Fonction pour ajouter un signe vital à la liste locale
    const addVitalSign = (newVitalSign: vitalSign) => {
        setVitalSigns((prev) => [...prev, newVitalSign]);
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Photo + nom */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-2 sm:p-4 mb-4 w-full">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Avatar + infos principales */}
                    <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-28 w-28 md:h-40 md:w-40 border-4 border-white dark:border-gray-800 shadow-lg">
                            <AvatarImage
                                src={patient.user.profile?.avatarUrl || "/avatar-placeholder.png"}
                                alt={patient.user.name}
                            />
                            <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                                {getInitials(patient.user.name)}
                            </AvatarFallback>
                        </Avatar>

                        {/* Genre + Groupe Sanguin */}
                        <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <User2 className="h-4 w-4" />
                                <span>{patient.user.profile?.genre || "Genre non renseigné"}</span>
                            </div>
                            {patient.bloodType && (
                                <Badge variant="secondary" className="ml-2">
                                    Groupe sanguin : {patient.bloodType}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Informations détaillées */}
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
                        </div>

                        {/* Grid des infos */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            {/* Date de naissance */}
                            <div className="flex items-center gap-2">
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

                            {/* Téléphone */}
                            <div className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">
                                        {patient.user.phone || "Non renseigné"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Téléphone</p>
                                </div>
                            </div>

                            {/* Adresse */}
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">
                                        {patient.user.profile?.address || "Adresse non renseignée"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Adresse</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {/* Tabs */}
                <div className="md:col-span-2 space-y-4">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <Tabs defaultValue="about" className="w-full">
                                <TabsList className="grid grid-cols-5 w-full">
                                    {[
                                        { value: 'about', label: 'Infos', icon: <Info className="w-4 h-4" /> },
                                        { value: 'appointments', label: 'Rendez-vous', icon: <Users2 className="w-4 h-4" /> },
                                        { value: 'medical', label: 'Dossiers médicaux', icon: <FileText className="w-4 h-4" /> },
                                        { value: 'vitals', label: 'Signes vitaux', icon: <HeartPulse className="w-4 h-4" /> },
                                        { value: 'medicalHistory', label: 'Historique Médical', icon: <History className="w-4 h-4" /> },
                                    ].map((tab) => (
                                        <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 justify-center">
                                            {tab.icon} {tab.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {/* Infos du patient */}
                                <TabsContent value="about">
                                    <CardContent className="space-y-6 pt-6 text-sm text-muted-foreground">
                                        <div>
                                            <h2 className="text-lg font-semibold text-foreground mb-2">Infos du patient</h2>
                                            <div className="border-b mb-4"></div>
                                            <div className="space-y-3">
                                                {/* Infos personnelles */}
                                                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {patient.user.email}</div>
                                                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {patient.user.phone || 'Non renseigné'}</div>
                                                <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5" />
                                                    <span>
                                                        {patient.user.profile?.address || 'Non renseignée'},<br />
                                                        {patient.user.profile?.city}, {patient.user.profile?.state}, {patient.user.profile?.country}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2"><Notebook className="w-4 h-4" /> Assurance : {patient.insuranceProvider || 'Non renseignée'}</div>
                                                <div className="flex items-center gap-2"><Star className="w-4 h-4" /> Numéro : {patient.insuranceNumber || 'Non renseigné'}</div>
                                                <div className="flex items-center gap-2"><Calendar1 className="w-4 h-4" /> Date de naissance : {patient.dateOfBirth?.toLocaleDateString() || 'Non renseignée'}</div>
                                                <div className="flex items-center gap-2"><User className="w-4 h-4" /> Genre : {patient.user.profile?.genre || 'Non renseigné'}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </TabsContent>

                                {/* Rendez-vous */}
                                <TabsContent value="appointments">
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold text-foreground">Rendez-vous</h2>
                                            <CreateAppointmentModal patientId={patient.id} addAppointment={addAppointment} />
                                        </div>
                                        <div className="border-b mb-4"></div>
                                        {appointments?.length ? (
                                            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                                                {appointments.map((appt) => (
                                                    <Card key={appt.id} className="bg-muted/50 border p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="font-medium">{appt.doctor.user.name}</div>
                                                                <div className="text-xs text-muted-foreground">{appt.doctor.specialization}</div>
                                                                <div className="text-xs mt-1">
                                                                    {new Date(appt.scheduledAt).toLocaleDateString()} - {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                                <div className="text-xs mt-1">Motif : {appt.reason || 'Aucun motif'}</div>
                                                            </div>
                                                            <Badge variant="secondary">{appt.status}</Badge>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground text-center py-10">Aucun rendez-vous trouvé.</div>
                                        )}
                                    </CardContent>
                                </TabsContent>

                                {/* Dossiers médicaux */}
                                <TabsContent value="medical">
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold text-foreground">Dossiers médicaux</h2>
                                        </div>
                                        <div className="border-b mb-4"></div>
                                        {patient.medicalRecords?.length ? (
                                            <div className="space-y-4">
                                                {patient.medicalRecords.map((record) => (
                                                    <Card key={record.id} className="p-4 border bg-muted/50">
                                                        <div className="font-semibold mb-1">{record.diagnosis}</div>
                                                        <div className="text-sm text-muted-foreground">{record.notes}</div>
                                                        <div className="text-sm text-muted-foreground">{record.treatment}</div>
                                                        <div className="text-xs text-muted-foreground mt-2">
                                                            Créé le : {new Date(record.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground text-center py-10">Aucun dossier médical trouvé.</div>
                                        )}
                                    </CardContent>
                                </TabsContent>

                                {/* Signes vitaux */}
                                <TabsContent value="vitals">
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold text-foreground">Signes vitaux</h2>
                                            <CreateVitalSignModal patientId={patient.id} addVitalSign={addVitalSign}/>
                                        </div>
                                        <div className="border-b mb-4"></div>
                                        {vitalSigns?.length ? (
                                            <div className="space-y-3 text-sm text-muted-foreground">
                                                {vitalSigns.map((vs) => (
                                                    <Card key={vs.id} className="p-4 border bg-muted/50">
                                                        <div>Température : {vs.temperature} °C</div>
                                                        <div>Pression artérielle : {vs.bloodPressureDiastolic}</div>
                                                        <div>Fréquence respiratoire : {vs.respiratoryRate} /min</div>
                                                        <div>Oxygénation : {vs.oxygenSaturation} %</div>
                                                        <div>Poids : {vs.weight} kg</div>
                                                        <div>Taille : {vs.height} cm</div>
                                                        <div>Fréquence cardiaque : {vs.heartRate} bpm</div>
                                                        <div>Autres Infos : {vs.notes}</div>
                                                        <div className="text-xs mt-2">Relevé le : {new Date(vs.createdAt).toLocaleDateString()}</div>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground text-center py-10">Aucun relevé trouvé.</div>
                                        )}
                                    </CardContent>
                                </TabsContent>

                                {/* Historique Médical */}
                                <TabsContent value="medicalHistory">
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold text-foreground">Historique médical</h2>
                                            <CreateMedicalHistoryModal patientId={patient.id} addHistorique={addMedicalHistory}/>
                                        </div>
                                        <div className="border-b mb-4"></div>
                                        {medicalHistories?.length ? (
                                            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                                                {medicalHistories.map((history) => (
                                                    <Card key={history.id} className="p-4 border bg-muted/50">
                                                        <div className="font-semibold mb-1">{history.title}</div>
                                                        <div className="text-sm text-muted-foreground">Condition : {history.condition}</div>
                                                        <div className="text-xs text-muted-foreground">Statut : {history.status}</div>
                                                        <div className="text-sm text-muted-foreground">{history.details}</div>
                                                        <div className="text-xs text-muted-foreground mt-2">
                                                            Diagnostiqué le : {history.diagnosedDate ? new Date(history.diagnosedDate).toLocaleDateString() : 'Date non renseignée'}
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground text-center py-10">Aucun historique médical trouvé.</div>
                                        )}
                                    </CardContent>
                                </TabsContent>
                            </Tabs>
                        </CardHeader>
                    </Card>
                </div>

                {/* Calendrier */}
                <div className="space-y-4">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CalendarIcon className="w-5 h-5" /> Prendre rendez-vous
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(day) => day && setSelectedDate(day)}
                                className="rounded-md border"
                            />
                            <div className="mt-4 w-full">
                                <CreateAppointmentModal patientId={patient.id} addAppointment={addAppointment} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
