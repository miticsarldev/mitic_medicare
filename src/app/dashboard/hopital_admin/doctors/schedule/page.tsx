'use client';
import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

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

const DAYS_OF_WEEK = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const WORKING_HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08h à 20h

const formatWeekLabel = (weekStr: string) => {
    const [year, week] = weekStr.split("-S").map(Number);
    const start = startOfISOWeek(new Date(year, 0, (week - 1) * 7 + 1));
    const end = endOfISOWeek(start);
    return `Semaine du ${format(start, "dd MMMM", { locale: fr })} au ${format(end, "dd MMMM", { locale: fr })}`;
};

const getWeekStringFromDate = (date: Date): string => {
    const year = getISOWeekYear(date);
    const week = getISOWeek(date);
    return `${year}-S${week.toString().padStart(2, "0")}`;
};



export default function WeeklySchedule() {
    const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
    const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<(Appointment & { doctor: string }) | null>(null);

    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("/api/hospital_admin/doctors/schedule");
            const data: DoctorSchedule[] = response.data.doctors;

            setSchedules(data);

            const weeks = new Set<string>();
            data.forEach(doc => {
                Object.keys(doc.weeklyAppointments).forEach(week => weeks.add(week));
            });

            const sortedWeeks = Array.from(weeks).sort().reverse();
            setAvailableWeeks(sortedWeeks);
            if (sortedWeeks.length > 0 && !selectedWeek) {
                setSelectedWeek(sortedWeeks[0]);
            }
        } catch (err) {
            console.error("Failed to fetch schedules", err);
            setError("Impossible de charger les plannings. Veuillez réessayer.");
            toast({
                title: "Erreur",
                description: "Échec du chargement des plannings",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [selectedWeek]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const filteredSchedules = useMemo(() => {
        if (!selectedWeek) return [];

        return schedules
            .map(doc => ({
                ...doc,
                schedule: doc.weeklyAppointments[selectedWeek] || []
            }))
            .filter(doc => selectedDoctor === null || doc.id === selectedDoctor)
            .map(doc => ({
                ...doc,
                schedule: doc.schedule.filter(apt => !selectedDay || apt.day === selectedDay)
            }))
            .filter(doc => doc.schedule.length > 0);
    }, [schedules, selectedWeek, selectedDoctor, selectedDay]);

    const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const date = new Date(e.target.value);
        if (!isNaN(date.getTime())) {
            const weekStr = getWeekStringFromDate(date);
            if (availableWeeks.includes(weekStr)) {
                setSelectedWeek(weekStr);
            } else {
                toast({
                    title: "Information",
                    description: "Aucun rendez-vous pour cette semaine",
                    variant: "default"
                });
            }
        }
    }, [availableWeeks]);

    const handleAppointmentClick = useCallback((appointment: Appointment & { doctor: string }) => {
        setSelectedAppointment(appointment);
    }, []);

    const visibleDays = useMemo(() => {
        return selectedDay ? [selectedDay] : DAYS_OF_WEEK;
    }, [selectedDay]);

    if (error) {
        return (
            <div className="p-6 flex flex-col items-center justify-center space-y-4">
                <p className="text-red-500">{error}</p>
                <Button variant="outline" onClick={fetchSchedules}>
                    Réessayer
                </Button>
            </div>
        );
    }

    //methode pour mettre le status en francais
    const translateStatus = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "Confirmé";
            case "CANCELED":
                return "Annulé";
            case "PENDING":
                return "En attente";
            case "COMPLETED":
                return "Terminé";
            default:
                return status;
        }
    };

    const AppointmentModal = React.memo(function AppointmentModal({
        appointment,
        open,
        onClose
    }: {
        appointment: Appointment & { doctor: string };
        open: boolean;
        onClose: () => void;
    }) {
        const statusVariant = {
            confirmed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
            pending: "bg-yellow-100 text-yellow-800",
            completed: "bg-blue-100 text-blue-800"
        }[appointment.status] || "bg-gray-100 text-gray-800";

        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-lg">Détails du rendez-vous</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <CalendarClock className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium">
                                    {format(parseISO(appointment.scheduledAt), "EEEE dd MMMM yyyy", { locale: fr })}
                                </p>
                                <p className="text-muted-foreground">
                                    {format(parseISO(appointment.scheduledAt), "HH:mm", { locale: fr })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Patient</p>
                                <p className="text-muted-foreground">{appointment.patientName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Stethoscope className="w-5 h-5 text-purple-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Médecin</p>
                                <p className="text-muted-foreground">{appointment.doctor}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Info className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="flex items-center gap-2">
                                <p className="font-medium">Statut</p>
                                <Badge variant="outline" className={statusVariant}>
                                    {translateStatus(appointment.status)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    });


    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                    <div className="space-y-1">
                        <Label htmlFor="doctor-select">Médecin</Label>
                        <Select
                            onValueChange={(value) => setSelectedDoctor(value === "ALL" ? null : value)}
                            value={selectedDoctor || "ALL"}
                        >
                            <SelectTrigger id="doctor-select" className="w-full">
                                <SelectValue placeholder="Sélectionner un médecin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tous les médecins</SelectItem>
                                {schedules.map(doc => (
                                    <SelectItem key={doc.id} value={doc.id}>
                                        {doc.name} ({doc.specialization})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="week-select">Semaine</Label>
                        <Input
                            id="week-select"
                            type="date"
                            onChange={handleDateChange}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Jour</Label>
                        <Tabs
                            value={selectedDay || ""}
                            onValueChange={val => setSelectedDay(val || null)}
                            className="w-full"
                        >
                            <TabsList className="grid grid-cols-4 sm:grid-cols-8 w-full">
                                <TabsTrigger value="" className="col-span-1">Tous</TabsTrigger>
                                {DAYS_OF_WEEK.map(day => (
                                    <TabsTrigger
                                        key={day}
                                        value={day}
                                        className="text-xs sm:text-sm"
                                    >
                                        {day.substring(0, 3)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </div>

            {selectedWeek && (
                <p className="text-sm font-medium text-muted-foreground">
                    {formatWeekLabel(selectedWeek)}
                </p>
            )}

            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full rounded" />
                    <div className="grid grid-cols-8 gap-2">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-6 rounded" />
                        ))}
                    </div>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded" />
                        ))}
                    </div>
                </div>
            ) : filteredSchedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
                    <p className="text-muted-foreground mb-2">Aucun rendez-vous trouvé</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSelectedDoctor(null);
                            setSelectedDay(null);
                        }}
                    >
                        Réinitialiser les filtres
                    </Button>
                </div>
            ) : (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-muted">
                                <th className="p-2 border-r w-24 text-center">Heure</th>
                                {visibleDays.map(day => (
                                    <th
                                        key={day}
                                        className="p-2 border-r text-center capitalize"
                                    >
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {WORKING_HOURS.map(hour => (
                                <tr key={hour}>
                                    <td className="p-2 border-r text-center font-medium bg-muted/50">
                                        {`${hour}:00`}
                                    </td>
                                    {visibleDays.map(day => {
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
                                            <td
                                                key={day + hour}
                                                className="border-r p-1 align-top min-w-[150px]"
                                            >
                                                <div className="space-y-1">
                                                    {appointmentsForCell.map(apt => (
                                                        <div
                                                            key={apt.id}
                                                            onClick={() => handleAppointmentClick(apt)}
                                                            className={`
                                                          rounded p-2 text-xs cursor-pointer transition border
                                                          ${apt.status === 'confirmed'
                                                                    ? 'bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-900 dark:hover:bg-green-800 dark:border-green-700'
                                                                    : apt.status === 'cancelled'
                                                                        ? 'bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-900 dark:hover:bg-red-800 dark:border-red-700'
                                                                        : apt.status === 'completed'
                                                                            ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 dark:border-blue-700'
                                                                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600'}
                                                        `}
                                                        >
                                                            <div className="font-medium truncate text-foreground">{apt.patientName}</div>
                                                            <div className="text-muted-foreground truncate">{apt.doctor}</div>
                                                            <div className="flex justify-between items-center mt-1">
                                                                <span className="text-xs text-muted-foreground">
                                                                    {format(parseISO(apt.scheduledAt), "HH:mm")}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`
                                                              text-xs px-1.5 py-0.5 border
                                                              ${apt.status === 'confirmed'
                                                                            ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-800 dark:text-green-100 dark:border-green-600'
                                                                            : apt.status === 'cancelled'
                                                                                ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600'
                                                                                : apt.status === 'completed'
                                                                                    ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-600'
                                                                                    : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500'}
                                                            `}
                                                                >
                                                                    {translateStatus(apt.status)}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                    ))}
                                                </div>
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
                    open={!!selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                />
            )}
        </div>
    );
}