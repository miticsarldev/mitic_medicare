"use client"

import { useEffect, useState } from "react"
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
import { toast } from "@/hooks/use-toast";

// Type définissant un médecin

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
  // États pour affichage, filtres, pagination et chargement
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

  // Récupération des médecins
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true)
      try {
        //recuperr les medecins et departements
        const resDoctors = await fetch("/api/hospital_admin/doctors")
        const dataDoctors = await resDoctors.json()
        setDoctors(dataDoctors.doctors)
        const resDepartments = await fetch("/api/hospital_admin/department")
        const dataDepartments = await resDepartments.json()
        setDepartments(dataDepartments.departments)
      } catch (err) {
        console.error("Erreur lors de la récupération des médecins", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  function onChangeDepartmentRequest(doctor: Doctor) {
    setCurrentDoctor(doctor)
    setSelectedDept(doctor.department?.id ?? "")
    setShowDeptModal(true)
  }

  //  Enregistrer le nouveau département
  async function saveDepartment() {
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
      //recharger la page apres la mise à jour
      const resDoctors = await fetch("/api/hospital_admin/doctors")
      const dataDoctors = await resDoctors.json()
      setDoctors(dataDoctors.doctors)
      toast({
        title: "Département mis à jour",
        description: `Le département de ${currentDoctor.name} a été mis à jour avec succès.`,
      })
      setSelectedDept(null)
      setCurrentDoctor(null)
      setShowDeptModal(false)
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du département.",
      })
    } finally {
      setLoading(false)
    }
  }


  // Gestion des filtres
  const toggleSpecialty = (specialty: string) => {
    setSpecialtyFilter((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    )
  }

  const resetFilters = () => {
    setSearch("")
    setSpecialtyFilter([])
    setMinRating(0)
    setCurrentPage(1)
  }

  //methode pour activer/desactiver un médecin
  const toggleActive = async (doctorId: string, isActive: boolean) => {
    setLoading(true)
    try {
      await fetch("/api/hospital_admin/doctors/toggle-active", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, isActive }),
      })
      //recharger la page apres la mise à jour
      const resDoctors = await fetch("/api/hospital_admin/doctors")
      const dataDoctors = await resDoctors.json()
      setDoctors(dataDoctors.doctors)
      toast({
        title: "État du médecin mis à jour",
        description: `Le médecin a été ${isActive ? "activé" : "désactivé"} avec succès.`,
      })
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'état du médecin", err)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour de l'état du médecin.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrage et pagination
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase())
    const matchesSpecialty =
      specialtyFilter.length === 0 || specialtyFilter.includes(doc.specialization)
    const matchesRating = doc.averageRating >= minRating
    return matchesSearch && matchesSpecialty && matchesRating
  })

  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE)
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Composant de filtres réutilisable
  const renderFilters = () => (
    <Card className="hidden md:block">
      <CardHeader>
        <CardTitle>Filtres</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recherche */}
        <div className="space-y-2">
          <label htmlFor="search" className="text-sm font-medium">
            Recherche
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              placeholder="Nom, spécialité, adresse..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Spécialités */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Spécialités</label>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-1.5">
              {Array.from(new Set(doctors.map((d) => d.specialization))).map(
                (specialty) => (
                  <div key={specialty} className="flex items-center gap-2">
                    <Checkbox
                      id={`spec-${specialty}`}
                      checked={specialtyFilter.includes(specialty)}
                      onCheckedChange={() => toggleSpecialty(specialty)}
                    />
                    <Label htmlFor={`spec-${specialty}`}>{specialty}</Label>
                  </div>
                )
              )}
            </div>
          </ScrollArea>
        </div>

        <Button variant="outline" className="w-full" onClick={resetFilters}>
          Réinitialiser les filtres
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-10">
      {/* Filtres Desktop */}
      <aside className="hidden lg:block w-64">{renderFilters()}</aside>

      {/* Filtres Mobile */}
      <div className="lg:hidden flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="mb-4"
          onClick={() => setShowMobileFilters(true)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtres</DialogTitle>
          </DialogHeader>
          {renderFilters()}
        </DialogContent>
      </Dialog>

      {/* Contenu principal */}
      <div className="flex-1 space-y-4">
        {/* En-tête avec titre, ajout et toggles */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Mes médecins</h1>
            <Dialog open={openAdd} onOpenChange={setOpenAdd}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter Médecin
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouveau Médecin</DialogTitle>
                </DialogHeader>
                <DoctorForm />
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2">
            <Toggle
              pressed={viewMode === "grid"}
              onPressedChange={() => setViewMode("grid")}
              aria-label="Vue grille"
            >
              <LayoutGrid className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={viewMode === "list"}
              onPressedChange={() => setViewMode("list")}
              aria-label="Vue liste"
            >
              <List className="h-4 w-4" />
            </Toggle>
          </div>
        </div>

        {/* Affichage skeleton pendant le chargement */}
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                <div key={idx} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                <div key={idx} className="border rounded-lg p-4 animate-pulse w-full h-24"></div>
              ))}
            </div>
          )
        ) : filteredDoctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 p-10">
            <p className="text-lg font-medium mb-2">Aucun médecin ne correspond à vos filtres.</p>
            <p className="text-sm mb-4">Essayez d&#39;ajuster votre recherche ou réinitialisez les filtres.</p>
            <Button variant="outline" onClick={resetFilters}>Réinitialiser les filtres</Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedDoctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} onChangeDepartment={() => onChangeDepartmentRequest(doc)} onChangeStatus={toggleActive}/>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2">
            {paginatedDoctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} onChangeDepartment={() => onChangeDepartmentRequest(doc)} onChangeStatus={toggleActive}/>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredDoctors.length > ITEMS_PER_PAGE && !isLoading && (
          <div className="flex justify-center items-center gap-4 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
      {/* Modal pour changer le département */}
      <Dialog open={showDeptModal} onOpenChange={setShowDeptModal}>
        <DialogContent className="max-w-sm p-6 rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle>Changer le département</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Pour {currentDoctor?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <Select onValueChange={(v) => setSelectedDept(v)} value={selectedDept || ""}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un département" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dep) => (
                  <SelectItem key={dep.id} value={dep.id}>
                    {dep.name}
                  </SelectItem>
                ))}
                <SelectItem value="NULL">Aucun</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeptModal(false)} disabled={loading}>
                Annuler
              </Button>
              <Button onClick={saveDepartment} disabled={loading || selectedDept === currentDoctor?.department?.id}>
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>

          <DialogClose className="absolute top-3 right-3 text-muted-foreground hover:text-primary">
            <X className="w-5 h-5" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  )
}
