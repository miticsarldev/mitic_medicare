"use client"

import React, { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Button
} from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  CalendarDays, ClipboardList, Stethoscope, User, AlertCircle
} from "lucide-react"

type Appointment = {
  id: string
  scheduledAt: string
  status: string
  reason: string
  type: string
  doctor: {
    id: string
    name: string
    specialization: string
  }
  patient: {
    id: string
    name: string
  }
}

const ITEMS_PER_PAGE = 6

export default function PendingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filtered, setFiltered] = useState<Appointment[]>([])
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [actionType, setActionType] = useState<"CONFIRM" | "CANCEL" | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/hospital_admin/appointment/list")
      const data = await res.json()
      const pending = (data.appointments || []).filter((a: Appointment) => a.status === "PENDING")
      setAppointments(pending)
      setFiltered(pending)
    }
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = appointments
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((a) => a.type === typeFilter)
    }
    setFiltered(filtered)
    setPage(1)
  }, [typeFilter, appointments])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const currentItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleConfirm = async () => {
    if (!selectedAppointment || !actionType) return
    await fetch(`/api/hospital_admin/appointment/${selectedAppointment.id}/${actionType.toLowerCase()}`, { method: "POST" })
    setAppointments((prev) => prev.filter((a) => a.id !== selectedAppointment.id))
    setSelectedAppointment(null)
    setActionType(null)
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Rendez-vous en attente</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="CONSULTATION">Consultation</SelectItem>
              <SelectItem value="SUIVI">Suivi</SelectItem>
              <SelectItem value="EXAMEN">Examen</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">Aucun rendez-vous en attente.</p>
        ) : (
          currentItems.map((appt) => (
            <Card key={appt.id} className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" /> {appt.patient.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-2"><Stethoscope className="w-4 h-4" /> {appt.doctor.name} ({appt.doctor.specialization})</div>
                <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> {new Date(appt.scheduledAt).toLocaleString()}</div>
                <div className="flex items-center gap-2"><ClipboardList className="w-4 h-4" /> {appt.reason}</div>
                <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {appt.type}</div>
                <div className="flex gap-2 pt-2">
                  <Button variant="default" size="sm" onClick={() => { setSelectedAppointment(appt); setActionType("CONFIRM") }}>Valider</Button>
                  <Button variant="destructive" size="sm" onClick={() => { setSelectedAppointment(appt); setActionType("CANCEL") }}>Annuler</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "CONFIRM" ? "Confirmer ce rendez-vous ?" : "Annuler ce rendez-vous ?"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Êtes-vous sûr de vouloir {actionType === "CONFIRM" ? "confirmer" : "annuler"} ce rendez-vous avec {selectedAppointment?.patient.name} ?</p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSelectedAppointment(null)}>Annuler</Button>
            <Button variant={actionType === "CONFIRM" ? "default" : "destructive"} onClick={handleConfirm}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
