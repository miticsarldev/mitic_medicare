"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type Appointment = {
  id: string
  scheduledAt: string
  status: string
  type: string
  reason: string
  doctor: {
    id: string
    name: string
    specialization: string
  }
  patient: {
    id: string
    name: string
    gender: string
  }
}

export default function PendingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filtered, setFiltered] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [specializationFilter, setSpecializationFilter] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments/pending")
        const data = await res.json()
        setAppointments(data.appointments || [])
        setFiltered(data.appointments || [])
      } catch (err) {
        console.error("Erreur de chargement :", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  useEffect(() => {
    let filteredData = [...appointments]

    if (search.trim()) {
      filteredData = filteredData.filter((apt) =>
        apt.patient.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (typeFilter) {
      filteredData = filteredData.filter((apt) => apt.type === typeFilter)
    }

    if (specializationFilter) {
      filteredData = filteredData.filter(
        (apt) => apt.doctor.specialization === specializationFilter
      )
    }

    setFiltered(filteredData)
    setCurrentPage(1)
  }, [search, typeFilter, specializationFilter, appointments])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Rendez-vous en attente</h2>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Rechercher par patient"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-1/3"
        />

        <Select onValueChange={setTypeFilter} value={typeFilter}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Type de rendez-vous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous</SelectItem>
            <SelectItem value="consultation">Consultation</SelectItem>
            <SelectItem value="suivi">Suivi</SelectItem>
            <SelectItem value="urgence">Urgence</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setSpecializationFilter} value={specializationFilter}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Spécialité du médecin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toutes</SelectItem>
            <SelectItem value="généraliste">Généraliste</SelectItem>
            <SelectItem value="cardiologue">Cardiologue</SelectItem>
            <SelectItem value="dermatologue">Dermatologue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Résultats */}
      {paginated.length === 0 ? (
        <div className="text-center text-muted-foreground mt-10">
          Aucun rendez-vous ne correspond aux filtres.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {paginated.map((apt) => (
            <Card key={apt.id} className="rounded-2xl shadow-sm hover:shadow-md transition">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">{apt.type}</Badge>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                    {apt.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Date prévue</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(apt.scheduledAt), "PPPp", { locale: fr })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">
                    {apt.patient.name} ({apt.patient.gender})
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Médecin</p>
                  <p className="font-medium">
                    {apt.doctor.name} -{" "}
                    <span className="italic text-sm">{apt.doctor.specialization}</span>
                  </p>
                </div>

                {apt.reason && (
                  <div>
                    <p className="text-sm text-muted-foreground">Motif</p>
                    <p className="text-sm">{apt.reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </ScrollArea>
  )
}
