'use client'

import React, { useEffect, useState } from "react"
import {
    Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import frLocale from "@fullcalendar/core/locales/fr"
import { format, isWithinInterval, parseISO } from "date-fns"
import { CalendarDays, ClipboardList, User } from "lucide-react"
import { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface Doctor {
    id: string
    name: string
    specialization: string
    department: string
}

interface Patient {
    id: string
    name: string
    gender: string
    email: string
    phone: string
    bloodType: string
    allergies: string
    medicalNotes: string
}

interface Appointment {
    id: string
    scheduledAt: string
    status: string
    reason: string
    type: string
    doctor: Doctor
    patient: Patient
}

export default function AppointmentCalendarView() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [filtered, setFiltered] = useState<Appointment[]>([])
    const [selectedDoctor, setSelectedDoctor] = useState<string>("all")
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
    const [dateRange, setDateRange] = useState<DateRange | undefined>()

    useEffect(() => {
        const fetchAppointments = async () => {
            const res = await fetch("/api/hospital_admin/appointment/list")
            const data = await res.json()
            setAppointments(data.appointments || [])
            setFiltered(data.appointments || [])
        }
        fetchAppointments()
    }, [])

    useEffect(() => {
        let result = [...appointments]

        if (selectedDoctor !== "all") {
            result = result.filter((a) => a.doctor.id === selectedDoctor)
        }

        if (dateRange?.from && dateRange?.to) {
            result = result.filter((a) =>
                isWithinInterval(parseISO(a.scheduledAt), {
                    start: dateRange.from!,
                    end: dateRange.to!,
                })
            )
        }

        setFiltered(result)
    }, [selectedDoctor, dateRange, appointments])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-green-200 text-green-900 dark:bg-green-800/30 dark:text-green-300"
            case "PENDING":
                return "bg-yellow-200 text-yellow-900 dark:bg-yellow-800/30 dark:text-yellow-300"
            case "CANCELLED":
                return "bg-red-200 text-red-900 dark:bg-red-800/30 dark:text-red-300"
            case "COMPLETED":
                return "bg-blue-200 text-blue-900 dark:bg-blue-800/30 dark:text-blue-300"
            default:
                return "bg-gray-200 text-gray-900 dark:bg-gray-700/40 dark:text-gray-300"
        }
    }

    return (
        <div className="p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Agenda des rendez-vous</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Filtrer par médecin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les médecins</SelectItem>
                                {Array.from(new Set(appointments.map((a) => a.doctor.id))).map((id) => {
                                    const doctor = appointments.find((a) => a.doctor.id === id)?.doctor
                                    return (
                                        <SelectItem key={id} value={id}>
                                            {doctor?.name}
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[250px] justify-start text-left font-normal">
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {dateRange?.from && dateRange?.to
                                        ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
                                        : "Filtrer par date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="rounded-lg border shadow-sm p-2 bg-background dark:bg-muted">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="timeGridWeek"
                            locale={frLocale}
                            events={filtered.map((appt) => ({
                                id: appt.id,
                                title: `${appt.patient.name} (${appt.type})`,
                                start: appt.scheduledAt,
                                extendedProps: { appointment: appt },
                            }))}
                            eventClick={(info) => {
                                const appt = info.event.extendedProps.appointment as Appointment
                                setSelectedAppointment(appt)
                            }}
                            height="auto"
                            slotMinTime="07:00:00"
                            slotMaxTime="20:00:00"
                            headerToolbar={{
                                start: 'prev,next today',
                                center: 'title',
                                end: 'dayGridMonth,timeGridWeek,timeGridDay',
                            }}
                            eventClassNames="text-sm font-medium text-gray-800 dark:text-gray-100"
                            dayHeaderClassNames="bg-muted text-muted-foreground text-sm"
                            dayCellClassNames="bg-muted/50 dark:bg-muted/30"
                        />
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Détails du rendez-vous</DialogTitle>
                    </DialogHeader>
                    {selectedAppointment && (
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" /> {selectedAppointment.patient.name}
                            </div>
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4" /> {selectedAppointment.reason}
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" /> {format(new Date(selectedAppointment.scheduledAt), 'PPpp')}
                            </div>
                            <div className="flex items-center gap-2">
                                Statut : <Badge className={getStatusColor(selectedAppointment.status)}>{selectedAppointment.status}</Badge>
                            </div>
                            <div className="text-muted-foreground mt-2">
                                <strong>Médecin :</strong> {selectedAppointment.doctor.name} ({selectedAppointment.doctor.specialization})
                            </div>
                            <div className="text-muted-foreground">
                                <strong>Email :</strong> {selectedAppointment.patient.email}
                            </div>
                            <div className="text-muted-foreground">
                                <strong>Téléphone :</strong> {selectedAppointment.patient.phone}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
