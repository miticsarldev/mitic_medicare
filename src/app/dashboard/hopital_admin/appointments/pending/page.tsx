"use client"

import React, { useCallback, useEffect, useState } from "react"
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
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CalendarDays,
  ClipboardList,
  Stethoscope,
  User,
  AlertCircle,
  Clock
} from "lucide-react"
import { format, isSameDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "@/hooks/use-toast";
import TimeSlotSelector from "../TimeSlotSelector"



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
  const [doctorFilter, setDoctorFilter] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [actionType, setActionType] = useState<"CONFIRM" | "CANCEL" | "RESCHEDULE" | null>(null)
  const [newDate, setNewDate] = useState<Date | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)


  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/hospital_admin/appointment/list")

      if (!res.ok) throw new Error("Erreur lors du chargement des rendez-vous")

      const data = await res.json()
      const pending = (data.appointments || []).filter((a: Appointment) => a.status === "PENDING")

      setAppointments(pending)
      setFiltered(pending)
    } catch (error) {
      console.error("Erreur :", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    let filtered = appointments

    if (doctorFilter && doctorFilter !== "all") {
      filtered = filtered.filter((a) => a.doctor.id === doctorFilter)
    }

    if (selectedDate) {
      filtered = filtered.filter((a) => isSameDay(new Date(a.scheduledAt), selectedDate))
    }

    setFiltered(filtered)
    setPage(1)
  }, [doctorFilter, selectedDate, appointments])

  const doctorOptions = Array.from(
    new Map(appointments.map((a) => [a.doctor.id, a.doctor])).values()
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const currentItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleAction = async () => {
    if (!selectedAppointment || !actionType) return

    const url = `/api/hospital_admin/appointment/${selectedAppointment.id}/${actionType.toLowerCase()}`
    let options: RequestInit = { method: "PATCH" }

    if (actionType === "RESCHEDULE" && newDate) {
      options = {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newDate: newDate }),
      }
    }

    try {
      const res = await fetch(url, options)

      if (!res.ok) throw new Error("Échec de l'opération")

      toast({
        title:
          actionType === "CONFIRM"
            ? "Rendez-vous confirmé ✅"
            : actionType === "CANCEL"
              ? "Rendez-vous annulé ❌"
              : "Rendez-vous reprogrammé 🔁",
        description:
          actionType === "CONFIRM"
            ? "Le rendez-vous a bien été confirmé."
            : actionType === "CANCEL"
              ? "Le rendez-vous a bien été annulé."
              : `Le rendez-vous a été déplacé au ${newDate ? newDate.toLocaleString() : "nouvelle date"}.`,
      })

      setSelectedAppointment(null)
      setActionType(null)
      setNewDate(null)

      fetchAppointments()

    } catch (err) {
      console.error(err)
      toast({
        title: "Erreur ❗",
        description: "Une erreur est survenue lors du traitement du rendez-vous.",
      })
    }
  }


  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Rendez-vous en attente</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par médecin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les médecins</SelectItem>
                {doctorOptions.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialization})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <input
              type="date"
              id="dateFilter"
              className="w-full border rounded px-3 py-2 text-sm"
              value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
              onChange={(e) => {
                const value = e.target.value
                setSelectedDate(value ? new Date(value) : null)
              }}
              placeholder="Filtrer par date"
            />
          </div>

        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="animate-pulse space-y-2 p-4">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 w-20 bg-muted rounded" />
                <div className="h-8 w-20 bg-muted rounded" />
                <div className="h-8 w-28 bg-muted rounded" />
              </div>
            </Card>
          ))
        ) : currentItems.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">
            Aucun rendez-vous en attente.
          </p>
        ) : (
          currentItems.map((appt) => (
            <Card key={appt.id} className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" /> {appt.patient.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> {appt.doctor.name} ({appt.doctor.specialization})
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> {new Date(appt.scheduledAt).toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> {appt.reason}
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {appt.type}
                </div>
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button size="sm" onClick={() => { setSelectedAppointment(appt); setActionType("CONFIRM") }}>Valider</Button>
                  <Button variant="destructive" size="sm" onClick={() => { setSelectedAppointment(appt); setActionType("CANCEL") }}>Annuler</Button>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedAppointment(appt); setActionType("RESCHEDULE") }}>Reprogrammer</Button>
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
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
          </div>
        </div>
      )}

      <Dialog open={!!selectedAppointment} onOpenChange={() => { setSelectedAppointment(null); setActionType(null); setNewDate(null) }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === "CONFIRM" && "Confirmer ce rendez-vous ?"}
              {actionType === "CANCEL" && "Annuler ce rendez-vous ?"}
              {actionType === "RESCHEDULE" && "Reprogrammer ce rendez-vous"}
            </DialogTitle>
          </DialogHeader>

          {actionType === "RESCHEDULE" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-2">Choisir une nouvelle date :</p>
                <Calendar
                  mode="single"
                  selected={newDate ?? undefined}
                  onSelect={(day) => {
                    if (day) {
                      const hours = newDate ? new Date(newDate).getHours() : 8
                      const minutes = newDate ? new Date(newDate).getMinutes() : 0
                      const updated = new Date(day)
                      updated.setHours(hours)
                      updated.setMinutes(minutes)
                      setNewDate(updated)
                    }
                  }}
                />
              </div>

              {newDate && (
                <TimeSlotSelector
                  doctorId={selectedAppointment?.doctor.id ?? ""}
                  selectedAppointment={selectedAppointment}
                  newDate={newDate}
                  setNewDate={setNewDate}
                />

              )}

            </div>
          ) : (
            <p className="text-muted-foreground">
              Êtes-vous sûr de vouloir {actionType === "CONFIRM" ? "confirmer" : "annuler"} ce rendez-vous avec {selectedAppointment?.patient.name} ?
            </p>
          )}

          {newDate && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Nouvelle date : {format(newDate, "PPP 'à' HH:mm")}
            </p>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSelectedAppointment(null)}>Annuler</Button>
            <Button
              variant={actionType === "CANCEL" ? "destructive" : "default"}
              disabled={actionType === "RESCHEDULE" && !newDate}
              onClick={handleAction}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
