"use client"

import React, { useEffect, useState, useMemo } from "react"
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface Prescription {
    id: string
    patient: string
    medication: string
    dosage: string
    period: {
        start: string
        end?: string | null
    }
    status: "Active" | "Inactive"
}

const ITEMS_PER_PAGE = 10

export default function PrescriptionsTable() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [filtered, setFiltered] = useState<Prescription[]>([])
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const fetchPrescriptions = async () => {
            const res = await fetch("/api/hospital_admin/prescription")
            const data = await res.json()
            setPrescriptions(data.prescriptions)
        }
        fetchPrescriptions()
    }, [])

    // Filtrage dynamique
    useEffect(() => {
        const result = prescriptions.filter((p) => {
            const matchesName = p.patient.toLowerCase().includes(search.toLowerCase())
            const matchesStatus = statusFilter ? p.status === statusFilter : true
            return matchesName && matchesStatus
        })
        setFiltered(result)
        setCurrentPage(1)
    }, [search, statusFilter, prescriptions])

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filtered.slice(start, start + ITEMS_PER_PAGE)
    }, [filtered, currentPage])

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold mb-4">Liste des Prescription effectuer</h1>

            {/* Filtres */}
            <div className="flex flex-wrap items-center gap-4">
                <Input
                    placeholder="Rechercher par nom du patient"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-1/3"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-1/4">
                        <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="Active">Actif</SelectItem>
                        <SelectItem value="Inactive">Inactif</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tableau */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Médicament</TableHead>
                        <TableHead>Posologie</TableHead>
                        <TableHead>Période</TableHead>
                        <TableHead>Statut</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginated.length > 0 ? (
                        paginated.map((prescription) => (
                            <TableRow key={prescription.id}>
                                <TableCell>{prescription.patient}</TableCell>
                                <TableCell>{prescription.medication}</TableCell>
                                <TableCell>{prescription.dosage}</TableCell>
                                <TableCell>
                                    {format(new Date(prescription.period.start), "dd/MM/yyyy")}
                                    {prescription.period.end && (
                                        <> - {format(new Date(prescription.period.end), "dd/MM/yyyy")}</>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className={prescription.status === "Active" ? "text-green-600" : "text-red-600"}>
                                        {prescription.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                Aucune prescription trouvée.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        Précédent
                    </Button>
                    <span className="text-sm">
                        Page {currentPage} sur {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        Suivant
                    </Button>
                </div>
            )}
        </div>
    )
}
