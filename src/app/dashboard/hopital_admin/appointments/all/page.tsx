"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, User, Stethoscope, ClipboardList, Mail, Phone, Droplets, AlertCircle, Building2, FileText, File, FileImage, FileArchive, FileVideo, Download, FilePlus2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"


//interface pour prescription
interface Prescription {
    id: string
    medicationName: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
    isActive: boolean
    startDate: string
    endDate: string
}

interface Attachment {
    id: string
    fileName: string
    fileType: string
    fileUrl: string
    fileSize: number
    uploadedAt: string
}
interface MedicalRecord {
    id: string
    diagnosis: string
    treatment: string
    notes: string
    followUpNeeded: boolean
    followUpDate: string | null
    createdAt: string
    updatedAt: string
    attachments: Attachment[]
    prescriptions: Prescription[]
}
interface Doctor {
    id: string
    name: string
    specialization: string
    department: string
}

interface Patient {
    id: string
    name: string
    gender: string
    email: string
    phone: string
    bloodType: string
    allergies: string
    medicalNotes: string
}
interface Appointment {
    id: string
    scheduledAt: string
    status: string
    reason: string
    type: string
    doctor: Doctor
    patient: Patient
    medicalRecord: MedicalRecord | null
}
interface PaginationData {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}
// Use the DateRange type from react-day-picker to ensure compatibility
import type { DateRange } from "react-day-picker";
const ITEMS_PER_PAGE = 9

const STATUS_OPTIONS = [
    { value: "all", label: "Tous les statuts" },
    { value: "PENDING", label: "En attente" },
    { value: "CONFIRMED", label: "Confirmé" },
    { value: "COMPLETED", label: "Terminé" },
    { value: "CANCELED", label: "Annulé" },
    { value: "NO_SHOW", label: "Non présenté" },
]

const STATUS_COLORS = {
    CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    CANCELED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    NO_SHOW: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    DEFAULT: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
} as const

const FILE_ICONS = {
    'application/pdf': <FileText className="w-5 h-5" />,
    'application/msword': <FileText className="w-5 h-5" />,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': <FileText className="w-5 h-5" />,
    'image/jpeg': <FileImage className="w-5 h-5" />,
    'image/png': <FileImage className="w-5 h-5" />,
    'application/zip': <FileArchive className="w-5 h-5" />,
    'application/x-rar-compressed': <FileArchive className="w-5 h-5" />,
    'video/mp4': <FileVideo className="w-5 h-5" />,
    default: <File className="w-5 h-5" />
}

export default function AppointmentsTable() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [pagination, setPagination] = useState<PaginationData>({
        currentPage: 1,
        pageSize: ITEMS_PER_PAGE,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
    })
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

    const fetchAppointments = useCallback(async (page: number = 1) => {
        setLoading(true)
        try {
            const url = new URL("/api/hospital_admin/appointment/list", window.location.origin)
            url.searchParams.set("page", page.toString())
            url.searchParams.set("pageSize", ITEMS_PER_PAGE.toString())
            if (statusFilter !== "all") {
                url.searchParams.set("status", statusFilter)
            }

            const res = await fetch(url.toString())
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Erreur lors du chargement")

            // Filtrage côté client si dateRange est défini
            let filteredAppointments = data.appointments || []
            if (dateRange?.from && dateRange?.to) {
                filteredAppointments = filteredAppointments.filter((appt: Appointment) => {
                    const appointmentDate = new Date(appt.scheduledAt)
                    return appointmentDate >= dateRange.from! && appointmentDate <= dateRange.to!
                })
            }

            setAppointments(filteredAppointments)
            if (data.pagination) {
                // Ajuster la pagination pour le filtrage client
                const totalFilteredItems = dateRange?.from && dateRange?.to
                    ? filteredAppointments.length
                    : data.pagination.totalItems

                setPagination({
                    currentPage: data.pagination.currentPage,
                    pageSize: data.pagination.pageSize,
                    totalItems: totalFilteredItems,
                    totalPages: Math.ceil(totalFilteredItems / ITEMS_PER_PAGE),
                    hasNextPage: data.pagination.hasNextPage,
                    hasPreviousPage: data.pagination.hasPreviousPage,
                })
            }
        } catch (err) {
            setError("Erreur lors du chargement des rendez-vous")
            console.error(err)
            toast({
                title: "Erreur",
                description: "Échec du chargement des rendez-vous",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [statusFilter, dateRange]) // Ajoutez dateRange aux dépendances

    useEffect(() => {
        fetchAppointments()
    }, [fetchAppointments])

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage < 1 || newPage > pagination.totalPages) return
        fetchAppointments(newPage)
    }, [fetchAppointments, pagination.totalPages])

    const resetFilters = useCallback(() => {
        setStatusFilter("all")
        setDateRange(undefined)
        fetchAppointments(1)
    }, [fetchAppointments])

    const getStatusLabel = (status: string) => {
        const option = STATUS_OPTIONS.find(opt => opt.value === status)
        return option ? option.label : status
    }

    const getFileIcon = (fileType: string) => {
        const icon = Object.entries(FILE_ICONS).find(([key]) => fileType.includes(key.split('/')[1]));
        return icon ? icon[1] : FILE_ICONS.default;
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Gestion des rendez-vous</h1>
                <Button variant="outline" onClick={() => fetchAppointments(pagination.currentPage)}>
                    Actualiser
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="border-b">
                    <CardTitle>Filtres</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-wrap gap-4">
                    <div className="w-full sm:w-auto">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:w-auto">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[250px] justify-start text-left font-normal">
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {dateRange?.from && dateRange?.to
                                        ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
                                        : "Période spécifique"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                                <div className="p-2 border-t">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setDateRange(undefined)}
                                    >
                                        Effacer la sélection
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button
                        variant="outline"
                        onClick={resetFilters}
                        disabled={loading}
                    >
                        Réinitialiser
                    </Button>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                                <Card key={idx} className="animate-pulse space-y-2 p-4">
                                    <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                                    <div className="h-4 bg-muted rounded w-2/3" />
                                    <div className="h-4 bg-muted rounded w-3/4" />
                                    <div className="h-4 bg-muted rounded w-1/3" />
                                    <div className="flex gap-2 pt-2">
                                        <div className="h-8 w-20 bg-muted rounded" />
                                        <div className="h-8 w-20 bg-muted rounded" />
                                        <div className="h-8 w-28 bg-muted rounded" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-500">{error}</p>
                            <Button variant="outline" onClick={() => fetchAppointments()} className="mt-4">
                                Réessayer
                            </Button>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Aucun rendez-vous trouvé</p>
                            <Button variant="outline" onClick={resetFilters} className="mt-4">
                                Réinitialiser les filtres
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {appointments.map((appt) => (
                                    <Card
                                        key={appt.id}
                                        className="cursor-pointer hover:shadow-md transition-all border-border"
                                        onClick={() => setSelectedAppointment(appt)}
                                    >
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="w-5 h-5" />
                                                <span className="truncate">{appt.patient.name}</span>
                                                {appt.medicalRecord && (
                                                    <Badge variant="secondary" className="ml-auto">
                                                        Dossier médical
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 truncate">
                                                <Stethoscope className="w-4 h-4 flex-shrink-0" />
                                                <span className="truncate">{appt.doctor.name} ({appt.doctor.specialization})</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4" />
                                                {format(new Date(appt.scheduledAt), 'PPpp', { locale: fr })}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={STATUS_COLORS[appt.status as keyof typeof STATUS_COLORS] || "bg-gray-100"}>
                                                    {getStatusLabel(appt.status)}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {pagination.totalPages > 1 && (
                                <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center mt-6 gap-4 border-t pt-4">
                                    <p className="text-sm text-muted-foreground text-center sm:text-left">
                                        Affichage{" "}
                                        <span className="font-medium">
                                            {((pagination.currentPage - 1) * pagination.pageSize) + 1}-
                                            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
                                        </span>{" "}
                                        sur <span className="font-medium">{pagination.totalItems}</span> rendez-vous
                                    </p>

                                    <div className="flex items-center justify-center sm:justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!pagination.hasPreviousPage || loading}
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        >
                                            Précédent
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Page {pagination.currentPage} / {pagination.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!pagination.hasNextPage || loading}
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        >
                                            Suivant
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Détails du rendez-vous</DialogTitle>
                    </DialogHeader>
                    {selectedAppointment && (
                        <Tabs defaultValue="patient" className="flex-1 flex flex-col">
                            <TabsList className="grid grid-cols-3 w-full">
                                <TabsTrigger value="patient">Patient</TabsTrigger>
                                <TabsTrigger value="doctor">Médecin</TabsTrigger>
                                <TabsTrigger value="medical" disabled={!selectedAppointment.medicalRecord}>
                                    Dossier médical
                                </TabsTrigger>
                            </TabsList>

                            <ScrollArea className="flex-1 py-4">
                                <TabsContent value="patient" className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-medium flex items-center gap-2 text-lg">
                                            <User className="w-5 h-5" />
                                            Informations patient
                                        </h3>
                                        <div className="pl-6 space-y-4 text-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="font-semibold">Nom complet</p>
                                                    <p>{selectedAppointment.patient.name}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Genre</p>
                                                    <p>{selectedAppointment.patient.gender}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold flex items-center gap-2">
                                                        <Mail className="w-4 h-4" />
                                                        Email
                                                    </p>
                                                    <p>{selectedAppointment.patient.email}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold flex items-center gap-2">
                                                        <Phone className="w-4 h-4" />
                                                        Téléphone
                                                    </p>
                                                    <p>{selectedAppointment.patient.phone}</p>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="font-semibold flex items-center gap-2">
                                                        <Droplets className="w-4 h-4" />
                                                        Groupe sanguin
                                                    </p>
                                                    <p>{selectedAppointment.patient.bloodType}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Allergies
                                                    </p>
                                                    <p>{selectedAppointment.patient.allergies}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="font-semibold flex items-start gap-2">
                                                    <ClipboardList className="w-4 h-4 mt-0.5" />
                                                    Notes médicales
                                                </p>
                                                <p className="whitespace-pre-line mt-2 p-3 bg-muted/50 rounded-md">
                                                    {selectedAppointment.patient.medicalNotes}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="doctor" className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-medium flex items-center gap-2 text-lg">
                                            <Stethoscope className="w-5 h-5" />
                                            Informations médecin
                                        </h3>
                                        <div className="pl-6 space-y-4 text-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="font-semibold">Nom</p>
                                                    <p>{selectedAppointment.doctor.name}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Spécialisation</p>
                                                    <p>{selectedAppointment.doctor.specialization}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold flex items-center gap-2">
                                                        <Building2 className="w-4 h-4" />
                                                        Département
                                                    </p>
                                                    <p>{selectedAppointment.doctor.department}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-medium flex items-center gap-2 text-lg">
                                            <CalendarDays className="w-5 h-5" />
                                            Détails du rendez-vous
                                        </h3>
                                        <div className="pl-6 space-y-4 text-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="font-semibold">Date</p>
                                                    <p>{format(new Date(selectedAppointment.scheduledAt), 'PPpp', { locale: fr })}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Motif</p>
                                                    <p>{selectedAppointment.reason}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Type</p>
                                                    <p>{selectedAppointment.type}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Statut</p>
                                                    <Badge className={STATUS_COLORS[selectedAppointment.status as keyof typeof STATUS_COLORS] || "bg-gray-100"}>
                                                        {getStatusLabel(selectedAppointment.status)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {selectedAppointment.medicalRecord && (
                                    <TabsContent value="medical" className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-medium flex items-center gap-2 text-lg">
                                                <FilePlus2 className="w-5 h-5" />
                                                Dossier médical
                                            </h3>

                                            <div className="pl-6 space-y-6 text-sm">
                                                {/* Diagnostic et traitement */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="font-semibold">Diagnostic</p>
                                                        <p className="whitespace-pre-line mt-2 p-3 bg-muted/50 rounded-md">
                                                            {selectedAppointment.medicalRecord.diagnosis}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">Traitement</p>
                                                        <p className="whitespace-pre-line mt-2 p-3 bg-muted/50 rounded-md">
                                                            {selectedAppointment.medicalRecord.treatment}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Notes complémentaires */}
                                                <div>
                                                    <p className="font-semibold">Notes complémentaires</p>
                                                    <p className="whitespace-pre-line mt-2 p-3 bg-muted/50 rounded-md">
                                                        {selectedAppointment.medicalRecord.notes || "Aucune note supplémentaire"}
                                                    </p>
                                                </div>

                                                {/* Suivi et mise à jour */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="font-semibold">Suivi nécessaire</p>
                                                        <p>{selectedAppointment.medicalRecord.followUpNeeded ? "Oui" : "Non"}</p>
                                                        {selectedAppointment.medicalRecord.followUpNeeded && (
                                                            <p className="mt-2">
                                                                <span className="font-semibold">Date de suivi: </span>
                                                                {selectedAppointment.medicalRecord.followUpDate
                                                                    ? format(new Date(selectedAppointment.medicalRecord.followUpDate), "PPpp", { locale: fr })
                                                                    : "Non précisée"}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">Dernière mise à jour</p>
                                                        <p>{format(new Date(selectedAppointment.medicalRecord.updatedAt), "PPpp", { locale: fr })}</p>
                                                    </div>
                                                </div>

                                                {/* Pièces jointes */}
                                                <div className="space-y-3">
                                                    <p className="font-semibold">Pièces jointes ({selectedAppointment.medicalRecord.attachments.length})</p>
                                                    {selectedAppointment.medicalRecord.attachments.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {selectedAppointment.medicalRecord.attachments.map((file) => (
                                                                <div
                                                                    key={file.id}
                                                                    className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                                                                >
                                                                    <div className="flex-shrink-0">{getFileIcon(file.fileType)}</div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium truncate">{file.fileName}</p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {formatFileSize(file.fileSize)} • {format(new Date(file.uploadedAt), "PP", { locale: fr })}
                                                                        </p>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => window.open(file.fileUrl, "_blank")}
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-muted/30 text-sm text-muted-foreground rounded-md">
                                                            Aucune pièce jointe disponible pour ce rendez-vous.
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Prescriptions */}
                                                <div className="space-y-3 pt-4">
                                                    <p className="font-semibold">Prescriptions ({selectedAppointment.medicalRecord.prescriptions.length})</p>
                                                    {selectedAppointment.medicalRecord.prescriptions.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {selectedAppointment.medicalRecord.prescriptions.map((prescription) => (
                                                                <div
                                                                    key={prescription.id}
                                                                    className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                                                                >
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium truncate">{prescription.medicationName}</p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-muted/30 text-sm text-muted-foreground rounded-md">
                                                            Aucune prescription enregistrée pour ce rendez-vous.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                )}

                            </ScrollArea>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}