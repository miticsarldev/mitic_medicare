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
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Type patient

type Patient = {
  id: string
  dateOfBirth: string
  allergies?: string
  medicalNotes?: string
  user: {
    name: string
    gender?: string
  }
  appointments: { scheduledAt: string }[]
  medicalRecords: { id: string }[]
}

const ITEMS_PER_PAGE = 10

const PatientsTable = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortByDate, setSortByDate] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get("/api/hospital_admin/patients/list")
        const result = Array.isArray(response.data) ? response.data : []
        setPatients(result)
      } catch (error) {
        console.error("Erreur lors du chargement des patients", error)
        setError("Erreur lors du chargement des patients.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const filteredPatients = useMemo(() => {
    let data = [...patients]
    if (searchTerm.trim() !== "") {
      data = data.filter((p) =>
        p.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (sortByDate) {
      data.sort((a, b) => {
        const lastA = a.appointments[0]?.scheduledAt || ""
        const lastB = b.appointments[0]?.scheduledAt || ""
        return new Date(lastB).getTime() - new Date(lastA).getTime()
      })
    }
    return data
  }, [patients, searchTerm, sortByDate])

  const paginatedPatients = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filteredPatients.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredPatients, page])

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold mb-4">Liste des patients</h1>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Input
          placeholder="Rechercher par nom"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <Button variant="outline" onClick={() => setSortByDate((prev) => !prev)}>
          Trier par dernier RDV {sortByDate ? "\u2191" : "\u2193"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>Date de naissance</TableHead>
            <TableHead>Nombre de RDV</TableHead>
            <TableHead>Dossiers médicaux</TableHead>
            <TableHead>Dernier RDV</TableHead>
            <TableHead>Statut santé</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Chargement...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-red-500 py-4">
                {error}
              </TableCell>
            </TableRow>
          ) : paginatedPatients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Aucun patient trouvé.
              </TableCell>
            </TableRow>
          ) : (
            paginatedPatients.map((patient) => {
              const lastAppointment = patient.appointments.sort(
                (a, b) =>
                  new Date(b.scheduledAt).getTime() -
                  new Date(a.scheduledAt).getTime()
              )[0]

              return (
                <TableRow key={patient.id}>
                  <TableCell>{patient.user.name}</TableCell>
                  <TableCell>{patient.user.gender || "—"}</TableCell>
                  <TableCell>
                    {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{patient.appointments.length}</TableCell>
                  <TableCell>{patient.medicalRecords.length}</TableCell>
                  <TableCell>
                    {lastAppointment
                      ? new Date(lastAppointment.scheduledAt).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {patient.allergies
                      ? `Allergies: ${patient.allergies}`
                      : patient.medicalNotes
                      ? `Notes: ${patient.medicalNotes}`
                      : "Rien à signaler"}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {filteredPatients.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" /> Précédent
          </Button>
          <span>
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Suivant <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default PatientsTable
