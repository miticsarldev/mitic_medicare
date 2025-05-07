"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { LayoutGrid, List, Filter, Search, Plus, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DoctorCard } from "./DoctorCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import DoctorForm from "../add/page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type Doctor = {
  id: string
  name: string
  specialization: string
  isVerified: boolean
  isActive: boolean
  availableForChat: boolean
  averageRating: number
  patientsCount: number
  phone: string
  address?: string
  department?: {
    id: string
    name: string
  }
  education?: string
  experience?: string
  consultationFee?: string
  schedule?: { day: string; slots: string[] }[]
}

type Department = {
  id: string
  name: string
  description: string
}

const ITEMS_PER_PAGE = 6

export default function DoctorTable() {
  // États de base
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [openAdd, setOpenAdd] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null)
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Mémoïsation des données filtrées et paginées
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const searchLower = search.toLowerCase()
      const matchesSearch =
        doc.name.toLowerCase().includes(searchLower) ||
        doc.specialization.toLowerCase().includes(searchLower)
      const matchesSpecialty =
        specialtyFilter.length === 0 || specialtyFilter.includes(doc.specialization)
      const matchesRating = doc.averageRating >= minRating
      return matchesSearch && matchesSpecialty && matchesRating
    })
  }, [doctors, search, specialtyFilter, minRating])

  const totalPages = useMemo(() => Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE), [filteredDoctors])
  
  const paginatedDoctors = useMemo(() => {
    return filteredDoctors.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    )
  }, [filteredDoctors, currentPage])

  // Récupération des données
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [doctorsRes, departmentsRes] = await Promise.all([
        fetch("/api/hospital_admin/doctors"),
        fetch("/api/hospital_admin/department")
      ])
      
      const doctorsData = await doctorsRes.json()
      const departmentsData = await departmentsRes.json()
      
      setDoctors(doctorsData.doctors)
      setDepartments(departmentsData.departments)
    } catch (err) {
      console.error("Erreur lors de la récupération des données", err)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Gestion des filtres
  const toggleSpecialty = useCallback((specialty: string) => {
    setSpecialtyFilter(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    )
    setCurrentPage(1) // Reset à la première page lors du changement de filtre
  }, [])

  const resetFilters = useCallback(() => {
    setSearch("")
    setSpecialtyFilter([])
    setMinRating(0)
    setCurrentPage(1)
  }, [])

  // Gestion des médecins
  const onChangeDepartmentRequest = useCallback((doctor: Doctor) => {
    setCurrentDoctor(doctor)
    setSelectedDept(doctor.department?.id ?? "")
    setShowDeptModal(true)
  }, [])

  const saveDepartment = useCallback(async () => {
    if (!currentDoctor) return
    
    setLoading(true)
    try {
      await fetch("/api/hospital_admin/doctors/updateDepartement", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: currentDoctor.id,
          departmentId: selectedDept || null,
        }),
      })
      
      await fetchData()
      
      toast({
        title: "Succès",
        description: `Le département de ${currentDoctor.name} a été mis à jour.`,
      })
      setShowDeptModal(false)
    } catch {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du département",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [currentDoctor, selectedDept, fetchData])

  const toggleActive = useCallback(async (doctorId: string, isActive: boolean) => {
    setLoading(true)
    try {
      await fetch("/api/hospital_admin/doctors/toggle-active", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, isActive }),
      })
      
      await fetchData()
      
      toast({
        title: "Succès",
        description: `Le médecin a été ${isActive ? "activé" : "désactivé"}.`,
      })
    } catch (err) {
      console.error("Erreur lors de la mise à jour", err)
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du statut",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [fetchData])

  // Composant de filtres
  const renderFilters = useCallback(() => (
    <Card className="hidden md:block">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-lg">Filtres</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Recherche
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              placeholder="Nom, spécialité..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Separator className="my-3" />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Spécialités</Label>
          <ScrollArea className="h-[200px] pr-3">
            <div className="space-y-2">
              {Array.from(new Set(doctors.map(d => d.specialization))).map((specialty) => (
                <div key={specialty} className="flex items-center gap-2">
                  <Checkbox
                    id={`spec-${specialty}`}
                    checked={specialtyFilter.includes(specialty)}
                    onCheckedChange={() => toggleSpecialty(specialty)}
                  />
                  <Label htmlFor={`spec-${specialty}`} className="text-sm">
                    {specialty}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Button 
          variant="outline" 
          className="w-full mt-2"
          onClick={resetFilters}
        >
          Réinitialiser
        </Button>
      </CardContent>
    </Card>
  ), [doctors, search, specialtyFilter, toggleSpecialty, resetFilters])

  // Squelettes de chargement
  const renderSkeletons = useCallback(() => (
    viewMode === "grid" ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
          <Skeleton key={idx} className="h-48 rounded-lg" />
        ))}
      </div>
    ) : (
      <div className="space-y-4">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
          <Skeleton key={idx} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    )
  ), [viewMode])

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 md:p-6">
      {/* Filtres Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        {renderFilters()}
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 space-y-4">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold sm:text-2xl">Médecins</h1>
            <Dialog open={openAdd} onOpenChange={setOpenAdd}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Ajouter
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="px-1">
                  <DialogTitle>Nouveau Médecin</DialogTitle>
                </DialogHeader>
                <DoctorForm onSuccess={() => {
                  setOpenAdd(false)
                  fetchData()
                }} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden h-8"
              onClick={() => setShowMobileFilters(true)}
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filtres
            </Button>

            <Toggle
              pressed={viewMode === "grid"}
              onPressedChange={() => setViewMode("grid")}
              aria-label="Vue grille"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
              pressed={viewMode === "list"}
              onPressedChange={() => setViewMode("list")}
              aria-label="Vue liste"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <List className="h-3.5 w-3.5" />
            </Toggle>
          </div>
        </div>

        {/* Filtres Mobile */}
        <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="px-1">
              <DialogTitle>Filtres</DialogTitle>
            </DialogHeader>
            {renderFilters()}
          </DialogContent>
        </Dialog>

        {/* Contenu */}
        {isLoading ? (
          renderSkeletons()
        ) : filteredDoctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg border border-dashed">
            <p className="font-medium mb-2">Aucun médecin trouvé</p>
            <p className="text-sm text-muted-foreground mb-4">
              {search || specialtyFilter.length > 0 || minRating > 0
                ? "Essayez d'ajuster vos filtres"
                : "Aucun médecin disponible"}
            </p>
            <Button variant="outline" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedDoctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                onChangeDepartment={() => onChangeDepartmentRequest(doc)}
                onChangeStatus={toggleActive}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedDoctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                onChangeDepartment={() => onChangeDepartmentRequest(doc)}
                onChangeStatus={toggleActive}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="flex justify-center items-center gap-3 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>

      {/* Modal de département */}
      <Dialog open={showDeptModal} onOpenChange={setShowDeptModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="space-y-1">
            <DialogTitle>Changer de département</DialogTitle>
            <DialogDescription>
              Pour {currentDoctor?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select
              value={selectedDept || ""}
              onValueChange={setSelectedDept}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un département" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dep => (
                  <SelectItem key={dep.id} value={dep.id}>
                    {dep.name}
                  </SelectItem>
                ))}
                <SelectItem value="NULL">Aucun département</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDeptModal(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={saveDepartment}
              disabled={loading || selectedDept === currentDoctor?.department?.id}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}