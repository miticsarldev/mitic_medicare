import { format } from "date-fns"
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import {
    Calendar,
    CalendarDays,
    Info,
    MapPin,
    Phone,
    AlertCircle,
    StickyNote,
    FileText,
    Stethoscope,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FC } from "react"

interface Doctor {
    name: string
    specialty: string
}

interface Appointment {
    id: string
    scheduledAt: string
    reason: string
    doctor: Doctor
}

interface MedicalRecord {
    id: string
    diagnosis: string
    treatment: string
    createdAt: string
}

interface HealthStatus {
    allergies: string | null;
    notes: string | null;
}

export interface Patient {
    id: string
    name: string
    gender: string
    phone?: string
    address?: string
    numberOfAppointments: number
    lastAppointment?: string;
    appointments: Appointment[]
    medicalRecords: MedicalRecord[]
    healthStatus: HealthStatus
}

interface PatientCardProps {
    patient: Patient
}

export const PatientCard: FC<PatientCardProps> = ({ patient }) => {
    const initials = patient.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()

    return (
        <Card key={patient.id} className="rounded-xl shadow-md overflow-hidden h-fit">
            <CardHeader className="flex flex-row items-center gap-3 bg-primary/10 py-3 px-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                    {initials}
                </div>
                <div className="flex-1">
                    <h2 className="text-md font-semibold leading-tight truncate">{patient.name}</h2>
                    <p className="text-xs text-muted-foreground">{patient.gender}</p>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
                            <CalendarDays className="w-4 h-4" />
                            <span>{patient.numberOfAppointments} rendez-vous à venir</span>
                        </div>
                        {patient.lastAppointment && (
                            <Badge variant="outline" className="text-xs w-fit flex items-center gap-1 col-span-2">
                                <Calendar className="h-3 w-3" />
                                Prochain RDV: {format(new Date(patient.lastAppointment), "dd/MM/yyyy")}
                            </Badge>
                        )}
                        <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
                            <MapPin className="w-4 h-4" />
                            <span>{patient.address || "Adresse inconnue"}</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
                            <Phone className="w-4 h-4" />
                            <span>{patient.phone || "N° inconnu"}</span>
                        </div>
                    </div>
                    <div className="mt-3">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full">
                                    <Info className="w-4 h-4 mr-1" /> Détails
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle className="text-lg">Dossier de {patient.name}</DialogTitle>
                                </DialogHeader>
                                <Tabs defaultValue="allergies" className="mt-4">
                                    <TabsList className="grid grid-cols-3 gap-2">
                                        <TabsTrigger value="allergies">
                                            <AlertCircle className="w-4 h-4 mr-1" /> Santé
                                        </TabsTrigger>
                                        <TabsTrigger value="appointments">
                                            <CalendarDays className="w-4 h-4 mr-1" /> Rendez-vous
                                        </TabsTrigger>
                                        <TabsTrigger value="records">
                                            <FileText className="w-4 h-4 mr-1" /> Médical
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="allergies" className="space-y-3 mt-4">
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" /> Allergies
                                            </h3>
                                            <p>{patient.healthStatus.allergies || "Aucune"}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-1">
                                                <StickyNote className="w-4 h-4" /> Notes médicales
                                            </h3>
                                            <p>{patient.healthStatus.notes || "Aucune"}</p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="appointments" className="mt-4">
                                        <ul className="space-y-2 max-h-64 overflow-auto">
                                            {patient.appointments.map((appt) => (
                                                <li key={appt.id} className="border p-2 rounded-md">
                                                    <p className="text-sm">
                                                        <span className="font-semibold">Date:</span> {new Date(appt.scheduledAt).toLocaleString()}
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-semibold">Raison:</span> {appt.reason}
                                                    </p>
                                                    <p className="text-sm flex items-center gap-1">
                                                        <Stethoscope className="w-4 h-4" /> Dr. {appt.doctor.name} ({appt.doctor.specialty})
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </TabsContent>

                                    <TabsContent value="records" className="mt-4">
                                        <ul className="space-y-2 max-h-64 overflow-auto">
                                            {patient.medicalRecords.map((record) => (
                                                <li key={record.id} className="border p-2 rounded-md">
                                                    <p className="text-sm">
                                                        <span className="font-semibold">Diagnostic:</span> {record.diagnosis}
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-semibold">Traitement:</span> {record.treatment}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Créé le {new Date(record.createdAt).toLocaleDateString()}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </TabsContent>
                                </Tabs>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}  
