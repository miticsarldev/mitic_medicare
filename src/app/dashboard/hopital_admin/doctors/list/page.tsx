// app/components/DoctorTable.tsx

"use client"

import { useEffect, useState } from "react"
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
import { Phone } from 'lucide-react';

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

  // Pagination
  const [page, setPage] = useState(1)
  const limit = 10

  // Filtres
  const [search, setSearch] = useState("")

  const fetchDoctors = async () => {
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
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [page, search])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1) // reset page
  }

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">Liste des médecins</h1>
    
        {/* Barre de recherche */}
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Filtrer par nom ou spécialisation..."
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
              <TableHead>Nom</TableHead>
              <TableHead>Spécialisation</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Éducation</TableHead>
              <TableHead>Expérience</TableHead>
              <TableHead>Vérifié</TableHead>
              <TableHead>Numero</TableHead>
              <TableHead>Note Moyenne</TableHead>
              <TableHead>Patients</TableHead>
              <TableHead>Frais</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.name}</TableCell>
                <TableCell>{doc.specialization}</TableCell>
                <TableCell>{doc.department || "-"}</TableCell>
                <TableCell>{doc.education || "-"}</TableCell>
                <TableCell>{doc.experience || "-"}</TableCell>
                <TableCell>{doc.isVerified ? "✅" : "❌"}</TableCell>
                <TableCell>{doc.phone || "-"}</TableCell>
                <TableCell>{doc.averageRating?.toFixed(1) ?? "-"}</TableCell>
                <TableCell>{doc.patientsCount ?? "-"}</TableCell>
                <TableCell>{doc.consultationFee ? `${doc.consultationFee} €` : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* gestion conditionnel de la pagination */}
      {doctors.length > 10 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Précédent
          </Button>
          <span>Page {page}</span>
          <Button onClick={() => setPage((prev) => prev + 1)}>Suivant</Button>
        </div>
      )}
    </div>
  )
}
