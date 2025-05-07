import { format } from "date-fns"
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import {
    Calendar,
    CalendarDays,
    MapPin,
    Phone,
    User2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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
    allergies: string | null
    notes: string | null
}

export interface Patient {
    id: string
    name: string
    gender: string
    phone?: string
    address?: string
    numberOfAppointments: number
    lastAppointment?: string
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
                <div
                    className="
                                w-10 h-10 rounded-full
                                 bg-gray-200 text-gray-900
                                 dark:bg-gray-800 dark:text-gray-100
                                flex items-center justify-center
                                font-bold text-sm
                                "
                >
                    {initials}
                </div>

                <div className="flex-1">
                    <h2 className="text-md font-semibold leading-tight truncate">{patient.name}</h2>
                    <p className="text-xs text-muted-foreground">
                        {patient.gender === "MALE" ? "Homme" : "Femme"}
                    </p>
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
                                Dernier RDV: {format(new Date(patient.lastAppointment), "dd/MM/yyyy")}
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
                        <Link href={`/dashboard/hopital_admin/patients/${patient.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                                <User2 className="w-4 h-4 mr-1" />
                                Voir le profil
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
