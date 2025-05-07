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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2, PlusCircle, Search } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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
  const [processing, setProcessing] = useState(false)

  // State pour les modals
  const [openAddModal, setOpenAddModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/hospital_admin/department")
        if (!res.ok) throw new Error("Échec du chargement des départements")
        const data = await res.json()
        setDepartments(data.departments || [])
      } catch (error) {
        console.error("Erreur:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les départements",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddDepartment = async () => {
    setProcessing(true)
    try {
      const response = await fetch("/api/hospital_admin/department/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Échec de l'ajout")

      toast({
        title: "Succès",
        description: "Département ajouté avec succès",
      })
      setOpenAddModal(false)
      setFormData({ name: "", description: "" })
      // Rafraîchir les données sans recharger la page
      const updatedData = await fetch("/api/hospital_admin/department")
      const newData = await updatedData.json()
      setDepartments(newData.departments || [])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleEditDepartment = async () => {
    if (!currentDepartment) return
    setProcessing(true)
    try {
      const response = await fetch(`/api/hospital_admin/department/modify/${currentDepartment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Échec de la modification")

      toast({
        title: "Succès",
        description: "Département modifié avec succès",
      })
      setOpenEditModal(false)
      setCurrentDepartment(null)
      setFormData({ name: "", description: "" })
      // Rafraîchir les données
      const updatedData = await fetch("/api/hospital_admin/department")
      const newData = await updatedData.json()
      setDepartments(newData.departments || [])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) return
    setProcessing(true)
    try {
      const response = await fetch(`/api/hospital_admin/department/delete/${departmentId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Échec de la suppression")

      toast({
        title: "Succès",
        description: "Département supprimé avec succès",
      })
      // Rafraîchir les données
      const updatedData = await fetch("/api/hospital_admin/department")
      const newData = await updatedData.json()
      setDepartments(newData.departments || [])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const openEditModalForDepartment = (dep: Department) => {
    setCurrentDepartment(dep)
    setFormData({ name: dep.name, description: dep.description })
    setOpenEditModal(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold">Gestion des départements</CardTitle>
            <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nouveau département
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau département</DialogTitle>
                  <DialogDescription>
                    Renseignez les informations du département
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Nom du département
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ex: Cardiologie"
                      value={formData.name}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Description du département"
                      value={formData.description}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddDepartment} disabled={processing}>
                    {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {processing ? "En cours..." : "Créer le département"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un département..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Nom</TableHead>
                  <TableHead className="w-[45%]">Description</TableHead>
                  <TableHead className="w-[15%]">Médecins</TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Chargement des départements...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginated.length > 0 ? (
                  paginated.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell className="font-medium">{dep.name}</TableCell>
                      <TableCell>{dep.description || <span className="text-muted-foreground">Aucune description</span>}</TableCell>
                      <TableCell>{dep.doctorCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openEditModalForDepartment(dep)}
                            disabled={processing}
                          >
                            Modifier
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteDepartment(dep.id)}
                            disabled={processing}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      {search ? "Aucun département correspondant à votre recherche" : "Aucun département enregistré"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-4">
              <div className="text-sm text-muted-foreground">
                {filtered.length} département{filtered.length > 1 ? 's' : ''} au total
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1 || loading}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages || loading}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de modification */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le département</DialogTitle>
            <DialogDescription>
              Modifiez les informations du département
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Nom du département
              </label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditDepartment} disabled={processing}>
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {processing ? "En cours..." : "Enregistrer les modifications"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}