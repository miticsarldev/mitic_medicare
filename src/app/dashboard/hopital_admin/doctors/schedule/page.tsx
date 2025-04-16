'use client'
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO, getHours } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import clsx from "clsx";

interface Appointment {
    id: string;
    scheduledAt: string;
    status: string;
    patientName: string;
    day: string;
}

interface DoctorSchedule {
    id: string;
    name: string;
    specialization: string;
    schedule: Appointment[];
}

const daysOfWeek = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const hours = Array.from({ length: 12 }, (_, i) => i + 8); // de 08h à 20h

export default function WeeklySchedule() {
    const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    useEffect(() => {
        axios.get("/api/hospital_admin/doctors/schedule").then((res) => {
            setSchedules(res.data.doctors);
        });
    }, []);

    const filteredSchedules = schedules
        .filter((doc) => !selectedDoctor || doc.id === selectedDoctor)
        .map((doc) => ({
            ...doc,
            schedule: doc.schedule.filter((apt) => !selectedDay || apt.day === selectedDay),
        }))
        .filter((doc) => doc.schedule.length > 0);

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-4">
                <Select onValueChange={(v) => setSelectedDoctor(v === "ALL" ? null : v)} defaultValue="ALL">
                    <SelectTrigger className="w-64">
                        <SelectValue placeholder="Filtrer par médecin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tous</SelectItem>
                        {schedules.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                                {doc.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Tabs value={selectedDay ?? ""} onValueChange={setSelectedDay}>
                    <TabsList>
                        <TabsTrigger value="">Tous les jours</TabsTrigger>
                        {daysOfWeek.map((day) => (
                            <TabsTrigger key={day} value={day}>
                                {day}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {filteredSchedules.length === 0 ? (
                <p className="text-muted-foreground">Aucun rendez-vous pour cette sélection.</p>
            ) : (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border w-24">Heure</th>
                                {daysOfWeek.map((day) => (
                                    (!selectedDay || selectedDay === day) && (
                                        <th key={day} className="p-2 border text-center capitalize">{day}</th>
                                    )
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {hours.map((hour) => (
                                <tr key={hour}>
                                    <td className="p-2 border text-center font-semibold bg-gray-50">{`${hour}:00`}</td>
                                    {daysOfWeek.map((day) => {
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
                                                {appointmentsForCell.map((apt) => (
                                                    <div key={apt.id} className="bg-blue-100 text-blue-900 rounded px-2 py-1 text-xs shadow">
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
        </div>
    );
}
