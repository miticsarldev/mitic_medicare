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
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"

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
    const [loading, setLoading] = useState(true)

    // State pour les modals
    const [openAddModal, setOpenAddModal] = useState(false)
    const [openEditModal, setOpenEditModal] = useState(false)
    const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null)
    const [formData, setFormData] = useState({ name: "", description: "" })

    useEffect(() => {
        const fetchDepartments = async () => {
            setLoading(true)
            const res = await fetch("/api/hospital_admin/department")
            const data = await res.json()
            setDepartments(data.departments || [])
            setLoading(false)
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

    // Gestion du formulaire : changer les valeurs
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Gestion de l'ajout
    const handleAddDepartment = async () => {
        // Envoie de la requête au backend pour ajouter
        await fetch("/api/hospital_admin/department/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
        setOpenAddModal(false)
        setFormData({ name: "", description: "" })
        window.location.reload()
    }

    // Gestion de la modification (l'ID est dans currentDepartment)
    const handleEditDepartment = async () => {
        if (!currentDepartment) return
        await fetch(`/api/hospital_admin/department/modify/${currentDepartment.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
        setOpenEditModal(false)
        setCurrentDepartment(null)
        setFormData({ name: "", description: "" })
        window.location.reload()
    }

    // Gestion de la suppression
    const handleDeleteDepartment = async (departmentId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) return
        await fetch(`/api/hospital_admin/department/delete/${departmentId}`, {
            method: "DELETE",
        })
        window.location.reload()
    }

    // Lorsque l'on ouvre le modal de modification, pré-remplir les champs
    const openEditModalForDepartment = (dep: Department) => {
        setCurrentDepartment(dep)
        setFormData({ name: dep.name, description: dep.description })
        setOpenEditModal(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">Gestion des départements</h2>
                <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
                    <DialogTrigger asChild>
                        <Button>Nouveau département</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Ajouter un département</DialogTitle>
                            <DialogDescription>
                                Remplissez les informations du nouveau département.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                name="name"
                                placeholder="Nom du département"
                                value={formData.name}
                                onChange={handleFormChange}
                            />
                            <Input
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleFormChange}
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddDepartment}>Ajouter</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

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
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                Chargement...
                            </TableCell>
                        </TableRow>
                    ) : paginated.length > 0 ? (
                        paginated.map((dep) => (
                            <TableRow key={dep.id}>
                                <TableCell>{dep.name}</TableCell>
                                <TableCell>{dep.description || "—"}</TableCell>
                                <TableCell>{dep.doctorCount}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => openEditModalForDepartment(dep)}>Modifier</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDeleteDepartment(dep.id)}>Supprimer</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
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

            {/* Modal de modification */}
            <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
                <DialogTrigger asChild>
                    <span className="hidden" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Modifier le département</DialogTitle>
                        <DialogDescription>
                            Modifiez les informations du département.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            name="name"
                            placeholder="Nom du département"
                            value={formData.name}
                            onChange={handleFormChange}
                        />
                        <Input
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleFormChange}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleEditDepartment}>Enregistrer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
