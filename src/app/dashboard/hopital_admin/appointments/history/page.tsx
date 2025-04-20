"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type Appointment = {
    id: string
    scheduledAt: string
    status: string
    type: string
    reason: string
    doctor: {
        id: string
        name: string
        specialization: string
    }
    patient: {
        id: string
        name: string
        gender: string
    }
}

const ITEMS_PER_PAGE = 10

export default function AppointmentHistory() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [filtered, setFiltered] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)

    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

    const [page, setPage] = useState(1)

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await fetch("/api/hospital_admin/appointment/history")
                const data = await res.json()
                setAppointments(data.appointments || [])
                setFiltered(data.appointments || [])
            } catch (error) {
                console.error("Erreur récupération historique :", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAppointments()
    }, [])

    // Filtrage
    useEffect(() => {
        const filteredData = appointments.filter((apt) => {
            const matchName = apt.patient.name.toLowerCase().includes(search.toLowerCase())
            const matchStatus = statusFilter ? apt.status === statusFilter : true
            return matchName && matchStatus
        })

        setFiltered(filteredData)
        setPage(1) // reset to first page on filter
    }, [search, statusFilter, appointments])

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    if (loading) {
        return <Skeleton className="w-full h-40 rounded-xl" />
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Historique des rendez-vous</h2>

            {/* Zone de filtre */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    placeholder="Rechercher un patient..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <Select onValueChange={(value) => setStatusFilter(value)} value={statusFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tous les statuts</SelectItem>
                        <SelectItem value="COMPLETED">Terminé</SelectItem>
                        <SelectItem value="CANCELLED">Annulé</SelectItem>
                        <SelectItem value="NO_SHOW">Non venu</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Liste des rendez-vous */}
            {paginated.length === 0 ? (
                <p className="text-muted-foreground">Aucun rendez-vous trouvé.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paginated.map((apt) => (
                        <Card key={apt.id} className="shadow-md rounded-xl">
                            <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">{apt.patient.name}</h3>
                                    <Badge>{apt.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Date:</span>{" "}
                                    {new Date(apt.scheduledAt).toLocaleString("fr-FR")}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Médecin:</span> {apt.doctor.name} ({apt.doctor.specialization})
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Motif:</span> {apt.reason}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Genre:</span> {apt.patient.gender}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                        Précédent
                    </Button>
                    <span className="text-sm">
                        Page {page} sur {totalPages}
                    </span>
                    <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                        Suivant
                    </Button>
                </div>
            )}
        </div>
    )
}
