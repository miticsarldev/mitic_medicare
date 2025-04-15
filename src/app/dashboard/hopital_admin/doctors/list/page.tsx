"use client"

import { useCallback, useEffect, useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import {
  User,
  GraduationCap,
  BadgeCheck,
  Phone,
  Star,
  Users,
  Euro,
  Stethoscope,
  Info,
  Eye,
  Trash,
  Pencil,
  MoreHorizontal,
} from "lucide-react"

type Doctor = {
  id: string
  name: string
  specialization: string
  isVerified: boolean
  availableForChat: boolean
  averageRating: number
  patientsCount: number
  phone: string
  department?: string
  education?: string
  experience?: string
  consultationFee?: string
}

export default function DoctorTable() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const limit = 10

  const fetchDoctors = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search.trim(),
      })

      const res = await fetch(`/api/hospital_admin/doctors?${queryParams}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Erreur inconnue")

      setDoctors(data.doctors || [])
    } catch (err) {
      console.error(err)
      setError(`Erreur de chargement: ${err}`)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Liste des médecins</h1>

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Rechercher un médecin par nom ou spécialisation..."
          value={search}
          onChange={handleSearchChange}
          className="w-full max-w-sm"
        />
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : doctors.length === 0 ? (
        <div className="text-gray-500">Aucun médecin trouvé.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><User className="w-4 h-4 inline mr-1" />Nom</TableHead>
              <TableHead><Stethoscope className="w-4 h-4 inline mr-1" />Spécialisation</TableHead>
              <TableHead><GraduationCap className="w-4 h-4 inline mr-1" />Éducation</TableHead>
              <TableHead><BadgeCheck className="w-4 h-4 inline mr-1" />Vérifié</TableHead>
              <TableHead><Phone className="w-4 h-4 inline mr-1" />Téléphone</TableHead>
              <TableHead><Star className="w-4 h-4 inline mr-1" />Note</TableHead>
              <TableHead><Users className="w-4 h-4 inline mr-1" />Patients</TableHead>
              <TableHead><Euro className="w-4 h-4 inline mr-1" />Frais</TableHead>
              <TableHead><Info className="w-4 h-4 inline mr-1" />Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.name}</TableCell>
                <TableCell>{doc.specialization}</TableCell>
                <TableCell>{doc.education || "-"}</TableCell>
                <TableCell>
                  <Badge variant={doc.isVerified ? "default" : "outline"}>
                    {doc.isVerified ? "Vérifié" : "Non vérifié"}
                  </Badge>
                </TableCell>
                <TableCell>{doc.phone || "-"}</TableCell>
                <TableCell>{doc.averageRating?.toFixed(1) ?? "-"}</TableCell>
                <TableCell>{doc.patientsCount ?? "-"}</TableCell>
                <TableCell>{doc.consultationFee ? `${doc.consultationFee} €` : "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedDoctor(doc)
                          setShowDialog(true)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                        Détails
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          // Action de modification
                          console.log("Modifier", doc)
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2 text-muted-foreground" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (confirm(`Supprimer ${doc.name} ?`)) {
                            console.log("Supprimer", doc)
                            // Appel à l’API de suppression ici
                          }
                        }}
                        className="text-red-600"
                      >
                        <Trash className="w-4 h-4 mr-2 text-red-600" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>


              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {(page > 1 || doctors.length === limit) && (
        <div className="flex justify-between items-center mt-4">
          <Button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Précédent
          </Button>
          <span>Page {page}</span>
          <Button
            disabled={doctors.length < limit}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Suivant
          </Button>
        </div>
      )}


      {/* MODAL DETAILS */}
      {selectedDoctor && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Détails du Dr. {selectedDoctor.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <p><strong>Spécialisation :</strong> {selectedDoctor.specialization}</p>
              <p><strong>Département :</strong> {selectedDoctor.department || "-"}</p>
              <p><strong>Éducation :</strong> {selectedDoctor.education || "-"}</p>
              <p><strong>Expérience :</strong> {selectedDoctor.experience || "-"}</p>
              <p><strong>Numéro :</strong> {selectedDoctor.phone || "-"}</p>
              <p><strong>Frais de consultation :</strong> {selectedDoctor.consultationFee ?? "-"} €</p>
              <p><strong>Patients traités :</strong> {selectedDoctor.patientsCount}</p>
              <p><strong>Note moyenne :</strong> {selectedDoctor.averageRating?.toFixed(1)}</p>
              <p><strong>Vérifié :</strong> {selectedDoctor.isVerified ? "Oui" : "Non"}</p>
              <p><strong>Disponible pour chat :</strong> {selectedDoctor.availableForChat ? "Oui" : "Non"}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
