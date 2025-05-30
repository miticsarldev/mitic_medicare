"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, Stethoscope, User, FileText, Pill, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/types/appointment";
import { format } from "date-fns";
import { AppointmentStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fr } from "date-fns/locale";

interface DetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: Appointment;
}

export function DetailsModal({ open, onOpenChange, appointment }: DetailsModalProps) {
    const getStatusBadge = (status: AppointmentStatus) => {
        switch (status) {
            case "PENDING":
                return <Badge variant="secondary">En attente</Badge>;
            case "CONFIRMED":
                return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Confirmé</Badge>;
            case "CANCELED":
                return <Badge variant="destructive">Annulé</Badge>;
            case "COMPLETED":
                return <Badge className="bg-green-500 hover:bg-green-600 text-white">Terminé</Badge>;
            case "NO_SHOW":
                return <Badge variant="outline" className="text-yellow-600">Absent</Badge>;
            default:
                return <Badge variant="outline">Inconnu</Badge>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800">Détails du rendez-vous</DialogTitle>
                    <Separator className="my-2" />
                </DialogHeader>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Patient Card */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                                    <User className="h-5 w-5 text-blue-600" /> Informations patient
                                </CardTitle>
                                <Separator />
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <InfoRow label="Nom" value={appointment.patient.name} />
                                <InfoRow label="Genre" value={appointment.patient.gender == "MALE" ? "Masculin" : "Feminin"} />
                                <InfoRow label="Email" value={appointment.patient.email} />
                                <InfoRow label="Téléphone" value={appointment.patient.phone} />
                                <InfoRow label="Groupe sanguin" value={appointment.patient.bloodType} />
                                <InfoRow label="Allergies" value={appointment.patient.allergies} />
                                <InfoRow label="Notes médicales" value={appointment.patient.medicalNotes} />
                            </CardContent>
                        </Card>

                        {/* Doctor & Appointment Card */}
                        <div className="space-y-6">
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                                        <Stethoscope className="h-5 w-5 text-blue-600" /> Médecin
                                    </CardTitle>
                                    <Separator />
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <InfoRow label="Nom" value={appointment.doctor.name} />
                                    <InfoRow label="Spécialisation" value={appointment.doctor.specialization || "Non précisée"} />
                                    <InfoRow label="Département" value={appointment.doctor.department} />
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                                        <Calendar className="h-5 w-5 text-blue-600" /> Rendez-vous
                                    </CardTitle>
                                    <Separator />
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <InfoRow 
                                        label="Date" 
                                        value={format(new Date(appointment.scheduledAt), "PPP", { locale: fr })} 
                                        icon={<Calendar className="h-4 w-4 text-gray-500" />}
                                    />
                                    <InfoRow 
                                        label="Heure" 
                                        value={format(new Date(appointment.scheduledAt), "p", { locale: fr })} 
                                        icon={<Clock className="h-4 w-4 text-gray-500" />}
                                    />
                                    <InfoRow label="Type" value={appointment.type || "Non précisé"} />
                                    <InfoRow label="Motif" value={appointment.reason || "Non précisé"} />
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-gray-600">Statut :</span>
                                        {getStatusBadge(appointment.status)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {appointment.medicalRecord && (
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                                    <FileText className="h-5 w-5 text-blue-600" /> Dossier Médical
                                </CardTitle>
                                <Separator />
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <InfoRow label="Diagnostic" value={appointment.medicalRecord.diagnosis} />
                                        <InfoRow label="Traitement" value={appointment.medicalRecord.treatment} />
                                        <InfoRow label="Notes" value={appointment.medicalRecord.notes || "Aucune note"} />
                                        <InfoRow 
                                            label="Suivi nécessaire" 
                                            value={appointment.medicalRecord.followUpNeeded ? "Oui" : "Non"} 
                                        />
                                        {appointment.medicalRecord.followUpNeeded && appointment.medicalRecord.followUpDate && (
                                            <InfoRow 
                                                label="Date de suivi" 
                                                value={format(new Date(appointment.medicalRecord.followUpDate), "PPP", { locale: fr })}
                                                icon={<Calendar className="h-4 w-4 text-gray-500" />} 
                                            />
                                        )}
                                        <InfoRow 
                                            label="Créé le" 
                                            value={format(new Date(appointment.medicalRecord.createdAt), "PPPp", { locale: fr })}
                                            icon={<Calendar className="h-4 w-4 text-gray-500" />} 
                                        />
                                        <InfoRow 
                                            label="Dernière mise à jour" 
                                            value={format(new Date(appointment.medicalRecord.updatedAt), "PPPp", { locale: fr })}
                                            icon={<Calendar className="h-4 w-4 text-gray-500" />} 
                                        />
                                    </div>

                                    {appointment.medicalRecord.prescriptions.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="font-medium flex items-center gap-2 text-gray-700">
                                                <Pill className="h-4 w-4 text-blue-600" /> Prescriptions
                                            </h4>
                                            <div className="space-y-3">
                                                {appointment.medicalRecord.prescriptions.map((prescription, index) => (
                                                    <Card key={index} className="border p-4 rounded-lg shadow-xs">
                                                        <CardContent className="p-0 space-y-2">
                                                            <p className="font-medium text-gray-800">{prescription.medicationName}</p>
                                                            <InfoRowSmall label="Posologie" value={`${prescription.dosage} - ${prescription.frequency}`} />
                                                            <InfoRowSmall label="Durée" value={prescription.duration} />
                                                            {prescription.instructions && (
                                                                <InfoRowSmall label="Instructions" value={prescription.instructions} />
                                                            )}
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-xs text-gray-600">Statut :</span>
                                                                {prescription.isActive ? (
                                                                    <Badge variant="default" className="text-xs">Active</Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                                                )}
                                                            </div>
                                                            <InfoRowSmall 
                                                                label="Période" 
                                                                value={`${format(new Date(prescription.startDate), "PP",{ locale: fr })} - ${format(new Date(prescription.endDate), "PP", { locale: fr })}`} 
                                                            />
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {appointment.medicalRecord.attachments.length > 0 && (
                                    <div className="mt-6 space-y-4">
                                        <h4 className="font-medium flex items-center gap-2 text-gray-700">
                                            <File className="h-4 w-4 text-blue-600" /> Pièces jointes
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {appointment.medicalRecord.attachments.map((attachment, index) => (
                                                <Card key={index} className="hover:shadow-md transition-shadow">
                                                    <CardContent className="p-4 space-y-2">
                                                        <p className="font-medium text-sm truncate text-gray-800">{attachment.fileName}</p>
                                                        <div className="flex justify-between text-xs text-gray-500">
                                                            <span>{attachment.fileType}</span>
                                                            <span>{(attachment.fileSize / 1024).toFixed(2)} KB</span>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full mt-2"
                                                            onClick={() => window.open(attachment.fileUrl, "_blank")}
                                                        >
                                                            Voir le fichier
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper component for consistent info rows
function InfoRow({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) {
    return (
        <div className="flex items-start gap-2">
            <div className="flex items-center gap-1 min-w-[120px]">
                {icon}
                <span className="font-medium text-sm text-gray-600">{label} :</span>
            </div>
            <span className="text-sm text-gray-800">{value}</span>
        </div>
    );
}

// Helper component for smaller info rows
function InfoRowSmall({ label, value }: { label: string; value: string | React.ReactNode }) {
    return (
        <div className="flex items-center gap-1">
            <span className="font-medium text-xs text-gray-600">{label} :</span>
            <span className="text-xs text-gray-700">{value}</span>
        </div>
    );
}