"use client"

import React, { useEffect, useState } from "react"
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
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    CalendarDays,
    User,
    Stethoscope,
    ClipboardList,
    Mail,
    Phone,
    Droplets,
    AlertCircle,
    Building2,
} from "lucide-react"

// Type définissant un rendez-vous

type Appointment = {
    id: string
    scheduledAt: string
    status: string
    reason: string
    type: string
    doctor: {
        id: string
        name: string
        specialization: string
        department: string
    }
    patient: {
        id: string
        name: string
        gender: string
        email: string
        phone: string
        bloodType: string
        allergies: string
        medicalNotes: string
    }
}

const ITEMS_PER_PAGE = 9

export default function AppointmentsTable() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [filtered, setFiltered] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [page, setPage] = useState(1)
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true)
            try {
                const res = await fetch("/api/hospital_admin/appointment/list")
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || "Erreur lors du chargement")
                setAppointments(data.appointments || [])
                setFiltered(data.appointments || [])
            } catch (err) {
                setError("Erreur lors du chargement des rendez-vous")
                console.error("Erreur chargement rendez-vous", err)
            } finally {
                setLoading(false)
            }
        }
        fetchAppointments()
    }, [])

    useEffect(() => {
        let result = appointments
        if (statusFilter !== "all") result = result.filter(a => a.status === statusFilter)
        if (typeFilter !== "all") result = result.filter(a => a.type === typeFilter)
        setFiltered(result)
        setPage(1)
    }, [statusFilter, typeFilter, appointments])

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const currentItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "bg-green-100 text-green-700"
            case "PENDING":   return "bg-yellow-100 text-yellow-700"
            case "CANCELLED": return "bg-red-100 text-red-700"
            case "COMPLETED": return "bg-blue-100 text-blue-700"
            default:           return "bg-gray-100 text-gray-700"
        }
    }

    return (
        <div className="space-y-6 p-10">
            <h1 className="text-2xl font-bold">Liste des rendez-vous</h1>

            <Card className="w-full">
                <CardHeader><CardTitle>Filtres</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrer par statut"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="PENDING">En attente</SelectItem>
                            <SelectItem value="COMPLETED">Complété</SelectItem>
                            <SelectItem value="CANCELLED">Annulé</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrer par type"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="CONSULTATION">Consultation</SelectItem>
                            <SelectItem value="SUIVI">Suivi</SelectItem>
                            <SelectItem value="EXAMEN">Examen</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Liste ou skeleton */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                        <div key={idx} className="border rounded-lg p-4 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <p className="col-span-full text-center text-red-500">{error}</p>
            ) : currentItems.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground">Aucun rendez-vous trouvé.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentItems.map(appt => (
                        <Card key={appt.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedAppointment(appt)}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><User className="w-5 h-5"/>{appt.patient.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2"><Stethoscope className="w-4 h-4"/>{appt.doctor.name}</div>
                                <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4"/>{new Date(appt.scheduledAt).toLocaleString()}</div>
                                <div className="flex items-center gap-2"><ClipboardList className="w-4 h-4"/>{appt.reason}</div>
                                <div className="flex items-center gap-2">
                                    <Badge className={getStatusBadgeColor(appt.status)}>{appt.status}</Badge> - {appt.type}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">Page {page} sur {totalPages}</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
                        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
                    </div>
                </div>
            )}

            {/* Modal de détails */}
            <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
                <DialogTrigger asChild />
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Détails du rendez-vous</DialogTitle></DialogHeader>
                    {selectedAppointment && (
                        <Tabs defaultValue="doctor" className="mt-4">
                            <TabsList className="w-full grid grid-cols-2 mb-4">
                                <TabsTrigger value="doctor">Médecin</TabsTrigger>
                                <TabsTrigger value="patient">Patient</TabsTrigger>
                            </TabsList>
                            <TabsContent value="doctor" className="grid grid-cols-1 gap-2">
                                <div className="flex items-center gap-2"><User className="w-4 h-4"/>{selectedAppointment.doctor.name}</div>
                                <div className="flex items-center gap-2"><Stethoscope className="w-4 h-4"/>{selectedAppointment.doctor.specialization}</div>
                                <div className="flex items-center gap-2"><Building2 className="w-4 h-4"/>{selectedAppointment.doctor.department}</div>
                            </TabsContent>
                            <TabsContent value="patient" className="grid grid-cols-1 gap-2">
                                <div className="flex items-center gap-2"><User className="w-4 h-4"/>{selectedAppointment.patient.name}</div>
                                <div className="flex items-center gap-2"><Mail className="w-4 h-4"/>{selectedAppointment.patient.email}</div>
                                <div className="flex items-center gap-2"><Phone className="w-4 h-4"/>{selectedAppointment.patient.phone}</div>
                                <div className="flex items-center gap-2"><Droplets className="w-4 h-4"/>Groupe sanguin : {selectedAppointment.patient.bloodType}</div>
                                <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4"/>Allergies : {selectedAppointment.patient.allergies}</div>
                                <div className="flex items-center gap-2"><ClipboardList className="w-4 h-4"/>Notes médicales : {selectedAppointment.patient.medicalNotes}</div>
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
