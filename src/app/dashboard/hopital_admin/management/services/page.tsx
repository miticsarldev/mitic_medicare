"use client"

import React, { useEffect, useState, useCallback } from "react"
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

interface PaginationData {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

const DEFAULT_PAGE_SIZE = 10

export default function DepartmentsTable() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [processing, setProcessing] = useState(false) // For Add/Edit operations

  // State for modals
  const [openAddModal, setOpenAddModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false) // New state for delete confirmation modal
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null)
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null) // New state to store department for deletion
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [isDeleting, setIsDeleting] = useState(false) // New state for delete operation loading

  const fetchDepartments = useCallback(async (page: number = 1, searchQuery: string = "") => {
    setIsLoading(true)
    try {
      const url = new URL("/api/hospital_admin/department", window.location.origin)
      url.searchParams.set("page", page.toString())
      url.searchParams.set("pageSize", pagination.pageSize.toString())
      if (searchQuery) {
        url.searchParams.set("search", searchQuery)
      }

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Échec du chargement des départements")
      
      const data = await res.json()
      setDepartments(data.departments || [])
      
      if (data.pagination) {
        setPagination({
          currentPage: data.pagination.currentPage,
          pageSize: data.pagination.pageSize,
          totalItems: data.pagination.totalItems,
          totalPages: data.pagination.totalPages,
          hasNextPage: data.pagination.hasNextPage,
          hasPreviousPage: data.pagination.hasPreviousPage,
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les départements",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [pagination.pageSize])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    fetchDepartments(newPage, search)
  }

  // Délai pour la recherche avec reset à la première page
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDepartments(1, search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search, fetchDepartments])

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
      fetchDepartments(1, search) // Retour à la première page après ajout
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout",
        variant: "destructive"
      })
      console.error("Erreur:", error)
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
      fetchDepartments(pagination.currentPage, search)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification",
        variant: "destructive"
      })
      console.error("Erreur:", error)
    } finally {
      setProcessing(false)
    }
  }

  // Function to open the delete confirmation modal
  const openDeleteConfirmationModal = (dep: Department) => {
    setDepartmentToDelete(dep)
    setOpenDeleteModal(true)
  }

  // Function to perform the actual deletion after confirmation
  const confirmDeleteDepartment = async () => {
    if (!departmentToDelete) return // Should not happen if modal is opened correctly

    setIsDeleting(true) // Start loading state for modal's delete button
    try {
      const response = await fetch(`/api/hospital_admin/department/delete/${departmentToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Échec de la suppression")

      toast({
        title: "Succès",
        description: "Département supprimé avec succès",
      })
      setOpenDeleteModal(false) // Close modal on success
      setDepartmentToDelete(null) // Clear department to delete

      // Réajuster la pagination si nécessaire
      const newPage = departments.length === 1 && pagination.currentPage > 1
        ? pagination.currentPage - 1
        : pagination.currentPage
      fetchDepartments(newPage, search)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive"
      })
      console.error("Erreur:", error)
    } finally {
      setIsDeleting(false) // End loading state
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
                <Button disabled={isLoading}>
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
                disabled={isLoading}
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Chargement en cours...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : departments.length > 0 ? (
                  departments.map((dep) => (
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
                            disabled={processing || isLoading}
                          >
                            Modifier
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => openDeleteConfirmationModal(dep)}
                            disabled={processing || isLoading}
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

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-4">
              <div className="text-sm text-muted-foreground">
                {pagination.totalItems} département{pagination.totalItems > 1 ? 's' : ''} au total
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPreviousPage || isLoading}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm font-medium">
                    Page {pagination.currentPage} sur {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage || isLoading}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
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

      {/* NOUVEAU: Modal de confirmation de suppression */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le département{" "}
              <span className="font-semibold text-red-600">
                {departmentToDelete?.name}
              </span>
              ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteModal(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDepartment}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
