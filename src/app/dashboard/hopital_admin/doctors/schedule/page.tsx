'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO, getHours, startOfISOWeek, endOfISOWeek, getISOWeek, getISOWeekYear } from "date-fns";
import { fr } from "date-fns/locale/fr";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarClock, User, Stethoscope, Info } from "lucide-react";


interface Appointment {
    id: string;
    scheduledAt: string;
    status: string;
    patientName: string;
    patientId: string;
    day: string;
}

interface DoctorSchedule {
    id: string;
    name: string;
    specialization: string;
    weeklyAppointments: {
        [week: string]: Appointment[];
    };
}

const daysOfWeek = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const hours = Array.from({ length: 12 }, (_, i) => i + 8); // de 08h à 20h

function formatWeekLabel(weekStr: string) {
    const [year, week] = weekStr.split("-S").map(Number);
    const start = startOfISOWeek(new Date(year, 0, (week - 1) * 7 + 1));
    const end = endOfISOWeek(start);
    return `Semaine du ${format(start, "dd MMMM", { locale: fr })} au ${format(end, "dd MMMM", { locale: fr })}`;
}

function AppointmentModal({
    appointment,
    open,
    onClose
}: {
    appointment: Appointment & { doctor: string };
    open: boolean;
    onClose: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Détails du rendez-vous</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-blue-500" />
                        <span>{format(parseISO(appointment.scheduledAt), "dd MMMM yyyy - HH:mm", { locale: fr })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-green-500" />
                        <span>Patient : {appointment.patientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-purple-500" />
                        <span>Médecin : {appointment.doctor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-gray-500" />
                        <span>Statut : {appointment.status}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function WeeklySchedule() {
    const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
    const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedAppointment, setSelectedAppointment] = useState<Appointment & { doctor: string } | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        axios.get("/api/hospital_admin/doctors/schedule").then((res) => {
            const data: DoctorSchedule[] = res.data.doctors;
            setSchedules(data);

            const weeks = new Set<string>();
            data.forEach(doc => {
                Object.keys(doc.weeklyAppointments).forEach(week => weeks.add(week));
            });

            const sortedWeeks = Array.from(weeks).sort().reverse();
            setAvailableWeeks(sortedWeeks);
            if (sortedWeeks.length > 0) setSelectedWeek(sortedWeeks[0]);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const filteredSchedules = schedules
        .map(doc => ({
            ...doc,
            schedule: selectedWeek ? (doc.weeklyAppointments[selectedWeek] || []) : [],
        }))
        .filter(doc => !selectedDoctor || doc.id === selectedDoctor)
        .map(doc => ({
            ...doc,
            schedule: doc.schedule.filter(apt => !selectedDay || apt.day === selectedDay)
        }))
        .filter(doc => doc.schedule.length > 0);

    function getWeekStringFromDate(date: Date): string {
        const year = getISOWeekYear(date);
        const week = getISOWeek(date);
        return `${year}-S${week.toString().padStart(2, "0")}`;
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-4">
                <Select onValueChange={(v) => setSelectedDoctor(v === "ALL" ? null : v)} defaultValue="ALL">
                    <SelectTrigger className="w-64">
                        <SelectValue placeholder="Filtrer par médecin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tous les médecins</SelectItem>
                        {schedules.map(doc => (
                            <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* <Select onValueChange={(v) => setSelectedWeek(v)} value={selectedWeek ?? undefined}>
                    <SelectTrigger className="w-64">
                        <SelectValue placeholder="Semaine" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableWeeks.map(week => (
                            <SelectItem key={week} value={week}>{formatWeekLabel(week)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select> */}

                <input
                    type="date"
                    className="border rounded px-3 py-2 text-sm"
                    onChange={(e) => {
                        const date = new Date(e.target.value);
                        if (!isNaN(date.getTime())) {
                            const weekStr = getWeekStringFromDate(date);
                            setSelectedWeek(weekStr);
                        }
                    }}
                />


                <Tabs value={selectedDay ?? ""} onValueChange={setSelectedDay}>
                    <TabsList>
                        <TabsTrigger value="">Tous les jours</TabsTrigger>
                        {daysOfWeek.map(day => (
                            <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {selectedWeek && (
                <p className="text-muted-foreground text-sm">{formatWeekLabel(selectedWeek)}</p>
            )}

            {loading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full rounded" />
                    ))}
                </div>
            ) : filteredSchedules.length === 0 ? (
                <p className="text-muted-foreground">Aucun rendez-vous pour cette sélection.</p>
            ) : (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border w-24">Heure</th>
                                {daysOfWeek.map(day => (
                                    (!selectedDay || selectedDay === day) && (
                                        <th key={day} className="p-2 border text-center capitalize">{day}</th>
                                    )
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {hours.map(hour => (
                                <tr key={hour}>
                                    <td className="p-2 border text-center font-semibold bg-gray-50">{`${hour}:00`}</td>
                                    {daysOfWeek.map(day => {
                                        if (selectedDay && day !== selectedDay) return null;

                                        const appointmentsForCell = filteredSchedules.flatMap(doc =>
                                            doc.schedule.filter(apt => {
                                                const aptDate = parseISO(apt.scheduledAt);
                                                return format(aptDate, "EEEE", { locale: fr }).toLowerCase() === day &&
                                                    getHours(aptDate) === hour;
                                            }).map(apt => ({
                                                ...apt,
                                                doctor: doc.name
                                            }))
                                        );

                                        return (
                                            <td key={day + hour} className="border p-2 align-top space-y-1">
                                                {appointmentsForCell.map(apt => (
                                                    <div
                                                        key={apt.id}
                                                        onClick={() => {
                                                            setSelectedAppointment(apt);
                                                            setModalOpen(true);
                                                        }}
                                                        className="bg-blue-100 text-blue-900 rounded px-2 py-1 text-xs shadow cursor-pointer hover:bg-blue-200 transition"
                                                    >
                                                        <div className="font-medium">{apt.patientName}</div>
                                                        <div>{apt.doctor}</div>
                                                        <div className="text-muted-foreground">{format(parseISO(apt.scheduledAt), "HH:mm")}</div>
                                                    </div>
                                                ))}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedAppointment && (
                <AppointmentModal
                    appointment={selectedAppointment}
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
}
