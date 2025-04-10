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
import { Button } from "@/components/ui/button"

interface Department {
    id: string
    name: string
    description: string
    doctorCount: number
}

const ITEMS_PER_PAGE = 10

export default function DepartmentsTable() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [filtered, setFiltered] = useState<Department[]>([])
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true) // État de chargement

    useEffect(() => {
        const fetchDepartments = async () => {
            setLoading(true) // Début du chargement
            const res = await fetch("/api/hospital_admin/department")
            const data = await res.json()
            setDepartments(data.departments)
            setLoading(false) // Fin du chargement
        }
        fetchDepartments()
    }, [])

    useEffect(() => {
        const result = departments.filter((dep) =>
            dep.name.toLowerCase().includes(search.toLowerCase())
        )
        setFiltered(result)
        setCurrentPage(1)
    }, [search, departments])

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filtered.slice(start, start + ITEMS_PER_PAGE)
    }, [filtered, currentPage])

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold mb-4">Départements médicaux</h1>

            <div className="flex flex-wrap items-center gap-4">
                <Input
                    placeholder="Rechercher un département"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-1/3"
                />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Nombre de médecins</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                Chargement...
                            </TableCell>
                        </TableRow>
                    ) : paginated.length > 0 ? (
                        paginated.map((dep) => (
                            <TableRow key={dep.id}>
                                <TableCell>{dep.name}</TableCell>
                                <TableCell>{dep.description || "—"}</TableCell>
                                <TableCell>{dep.doctorCount}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                Aucun département trouvé.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

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
