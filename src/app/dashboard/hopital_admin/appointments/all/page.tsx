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
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, User, Stethoscope, ClipboardList, Mail, Phone, Droplets, AlertCircle, Building2 } from "lucide-react"


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
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [page, setPage] = useState(1)
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
    const [dateFilter, setDateFilter] = useState<string>("")

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await fetch("/api/hospital_admin/appointment/list")
                const data = await res.json()

                if (!res.ok) throw new Error(data.error || "Erreur lors du chargement")

                setAppointments(data.appointments || [])
                setFiltered(data.appointments || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchAppointments()
    }, [])

    useEffect(() => {
        let filtered = appointments

        if (statusFilter && statusFilter !== "all") {
            filtered = filtered.filter((a) => a.status === statusFilter)
        }
        if (dateFilter) {
            filtered = filtered.filter((a) => new Date(a.scheduledAt).toLocaleDateString() === new Date(dateFilter).toLocaleDateString())
        }
        setFiltered(filtered)
        setPage(1)
    }, [statusFilter, dateFilter, appointments])

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const currentItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "bg-green-100 text-green-700"
            case "PENDING": return "bg-yellow-100 text-yellow-700"
            case "CANCELLED": return "bg-red-100 text-red-700"
            case "COMPLETED": return "bg-blue-100 text-blue-700"
            default: return "bg-gray-100 text-gray-700"
        }
    }

    const getStatusLabelFr = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "Confirmé"
            case "PENDING": return "En attente"
            case "CANCELED": return "Annulé"
            case "COMPLETED": return "Terminé"
            default: return "Inconnu"
        }
    }


    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">Liste des rendez-vous</h1>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Filtres</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] h-10">
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="PENDING">En attente</SelectItem>
                            <SelectItem value="COMPLETED">Complété</SelectItem>
                            <SelectItem value="CANCELED">Annulé</SelectItem>
                        </SelectContent>
                    </Select>

                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-[180px] h-10 border rounded px-3 text-sm"
                    />

                    <Button
                        variant="outline"
                        onClick={() => {
                            setStatusFilter("")
                            setDateFilter("")
                        }}
                        className="w-[180px] h-10"
                    >
                        Réinitialiser
                    </Button>
                </CardContent>
            </Card>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
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
                    ))
                ) : error ? (
                    <p className="col-span-full text-center text-red-500">{error}</p>
                ) : currentItems.length === 0 ? (
                    <p className="col-span-full text-center text-muted-foreground">Aucun rendez-vous trouvé.</p>
                ) : (
                    currentItems.map((appt) => (
                        <Card key={appt.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedAppointment(appt)}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" /> {appt.patient.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4" /> {appt.doctor.name} ({appt.doctor.specialization})
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4" /> {new Date(appt.scheduledAt).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" /> {appt.reason}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className={getStatusBadgeColor(appt.status)}>{getStatusLabelFr(appt.status)}</Badge> - {appt.type}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {filtered.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">
                        Page {page} sur {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            )}

            <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Détails du rendez-vous</DialogTitle>
                    </DialogHeader>
                    {selectedAppointment && (
                        <Tabs defaultValue="doctor" className="mt-4">
                            <TabsList className="w-full grid grid-cols-2 mb-4">
                                <TabsTrigger value="doctor">Médecin</TabsTrigger>
                                <TabsTrigger value="patient">Patient</TabsTrigger>
                            </TabsList>
                            <TabsContent value="doctor" className="grid grid-cols-1 gap-2">
                                <div className="flex items-center gap-2"><User className="w-4 h-4" /> {selectedAppointment.doctor.name}</div>
                                <div className="flex items-center gap-2"><Stethoscope className="w-4 h-4" /> {selectedAppointment.doctor.specialization}</div>
                                <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /> {selectedAppointment.doctor.department}</div>
                            </TabsContent>
                            <TabsContent value="patient" className="grid grid-cols-1 gap-2">
                                <div className="flex items-center gap-2"><User className="w-4 h-4" /> {selectedAppointment.patient.name}</div>
                                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {selectedAppointment.patient.email}</div>
                                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {selectedAppointment.patient.phone}</div>
                                <div className="flex items-center gap-2"><Droplets className="w-4 h-4" /> Groupe sanguin : {selectedAppointment.patient.bloodType}</div>
                                <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Allergies : {selectedAppointment.patient.allergies}</div>
                                <div className="flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Notes médicales : {selectedAppointment.patient.medicalNotes}</div>
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
