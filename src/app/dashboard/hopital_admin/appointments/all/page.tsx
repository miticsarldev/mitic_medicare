"use client"

import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { Select } from "@/components/ui/select"
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type Appointment = {
    id: string
    scheduledAt: string
    status: string
    reason: string
    type: string
    doctor: {
        user: {
            name: string
        }
    }
    patient: {
        user: {
            name: string
        }
    }
}

const ITEMS_PER_PAGE = 10

export default function AppointmentsTable() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [filtered, setFiltered] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [typeFilter, setTypeFilter] = useState<string>("")
    const [page, setPage] = useState(1)

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
        let filtered = appointments;
      
        if (statusFilter && statusFilter !== "all") {
          filtered = filtered.filter((a) => a.status === statusFilter);
        }
      
        if (typeFilter && typeFilter !== "all") {
          filtered = filtered.filter((a) => a.type === typeFilter);
        }
      
        setFiltered(filtered);
        setPage(1); // reset to first page on filter change
      }, [statusFilter, typeFilter, appointments]);
      

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const currentItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-2xl font-bold mb-4">Liste des rendez-vous</h1>
            {/* Filtres */}
            <div className="flex flex-wrap gap-4">
                <div className="w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="PENDING">En attente</SelectItem>
                            <SelectItem value="COMPLETED">Complété</SelectItem>
                            <SelectItem value="CANCELLED">Annulé</SelectItem>
                        </SelectContent>
                    </Select>

                </div>

                <div className="w-48">
                    <Select onValueChange={setTypeFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrer par type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="CONSULTATION">Consultation</SelectItem>
                            <SelectItem value="SUIVI">Suivi</SelectItem>
                            <SelectItem value="EXAMEN">Examen</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Tableau */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Médecin</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date / Heure</TableHead>
                        <TableHead>Motif</TableHead>
                        <TableHead>Type</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                Chargement des rendez-vous...
                            </TableCell>
                        </TableRow>
                    ) : error ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-red-500">{error}</TableCell>
                        </TableRow>
                    ) : currentItems.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                Aucun rendez-vous trouvé.
                            </TableCell>
                        </TableRow>
                    ) : (
                        currentItems.map((appt) => (
                            <TableRow key={appt.id}>
                                <TableCell>{appt.doctor.user.name}</TableCell>
                                <TableCell>{appt.patient.user.name}</TableCell>
                                <TableCell>{appt.status}</TableCell>
                                <TableCell>{new Date(appt.scheduledAt).toLocaleString()}</TableCell>
                                <TableCell>{appt.reason}</TableCell>
                                <TableCell>{appt.type}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>

            </Table>

            {/* Pagination */}
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
        </div>
    )
}
