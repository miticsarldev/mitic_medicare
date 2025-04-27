'use client'

import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CalendarDays, ClipboardList, Stethoscope, User, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

interface Appointment {
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
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [actionType, setActionType] = useState<'CONFIRM' | 'CANCEL' | 'RESCHEDULE' | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>()
  const [rescheduleTime, setRescheduleTime] = useState<string>('')
  const [isDateValid, setIsDateValid] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/hospital_admin/appointment/list')
        const data = await res.json()
        const pending = (data.appointments || []).filter(
          (a: Appointment) => a.status === 'PENDING'
        )
        setAppointments(pending)
        setFiltered(pending)
      } catch (err) {
        console.error('Erreur chargement rendez-vous en attente', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    let result = appointments
    if (typeFilter && typeFilter !== 'all') {
      result = result.filter((a) => a.type === typeFilter)
    }
    setFiltered(result)
    setPage(1)
  }, [typeFilter, appointments])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const currentItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleAction = async () => {
    if (!selectedAppointment || !actionType) return
    try {
      if (actionType === 'RESCHEDULE') {
        if (!rescheduleDate || !rescheduleTime) {
          setIsDateValid(false)
          return
        }
        const [hours, minutes] = rescheduleTime.split(':').map(Number)
        const newDate = new Date(rescheduleDate)
        newDate.setHours(hours)
        newDate.setMinutes(minutes)

        await fetch(`/api/hospital_admin/appointment/${selectedAppointment.id}/reschedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newDate }),
        })
      } else {
        await fetch(
          `/api/hospital_admin/appointment/${selectedAppointment.id}/${actionType.toLowerCase()}`,
          { method: 'POST' }
        )
      }

      setAppointments((prev) => prev.filter((a) => a.id !== selectedAppointment.id))
      resetModal()
    } catch (err) {
      console.error('Erreur lors de l\'action', err)
    }
  }

  const resetModal = () => {
    setSelectedAppointment(null)
    setActionType(null)
    setRescheduleDate(undefined)
    setRescheduleTime('')
    setIsDateValid(true)
  }

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-bold">Rendez-vous en attente</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {loading ? (
            <div className="h-10 w-[180px] bg-gray-200 rounded animate-pulse" />
          ) : (
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
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
            <div key={idx} className="border rounded-lg p-4 animate-pulse space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="col-span-full text-center text-muted-foreground">
          Aucun rendez-vous en attente.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentItems.map((appt) => (
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
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => { setSelectedAppointment(appt); setActionType('CONFIRM') }}>Valider</Button>
                  <Button variant="destructive" size="sm" onClick={() => { setSelectedAppointment(appt); setActionType('CANCEL') }}>Annuler</Button>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedAppointment(appt); setActionType('RESCHEDULE') }}>Reprogrammer</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">Page {page} sur {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
          </div>
        </div>
      )}

      <Dialog open={!!selectedAppointment} onOpenChange={resetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'CONFIRM' ? 'Confirmer ce rendez-vous ?'
                : actionType === 'CANCEL' ? 'Annuler ce rendez-vous ?'
                  : 'Reprogrammer ce rendez-vous'}
            </DialogTitle>
          </DialogHeader>

          {actionType === 'RESCHEDULE' ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label>Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !rescheduleDate && 'text-muted-foreground')}>
                      {rescheduleDate ? format(rescheduleDate, 'PPP') : 'Choisir une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={rescheduleDate} onSelect={setRescheduleDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2">
                <label>Heure</label>
                <Input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
              </div>
              {!isDateValid && <p className="text-sm text-red-500">Veuillez sélectionner une date et une heure valides.</p>}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Êtes-vous sûr de vouloir {actionType === 'CONFIRM' ? 'confirmer' : 'annuler'} ce rendez-vous avec {selectedAppointment?.patient.name} ?
            </p>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={resetModal}>Annuler</Button>
            <Button variant={actionType === 'CANCEL' ? 'destructive' : 'default'} onClick={handleAction}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
