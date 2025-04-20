'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from "next-themes";
import { Calendar as CalendarIcon, Clock, User, Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  fr: fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface DoctorSchedule {
  id: string;
  name: string;
  hospital?: string;
  department?: string;
  specialization: string;
  availabilities: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }[];
  appointments: {
    id: string;
    scheduledAt: Date;
    startTime: Date | null;
    endTime: Date | null;
    status: string;
    patient: {
      user: {
        name: string;
      };
    };
  }[];
}

interface AvailabilityEventResource {
  type: 'availability';
}

interface AppointmentEventResource {
  type: 'appointment';
  status: string;
  patientName: string;
}

type EventResource = AvailabilityEventResource | AppointmentEventResource;

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: EventResource;
  color?: string;
}

export default function DoctorSchedulePage() {
  const { theme } = useTheme();
  const [schedule, setSchedule] = useState<DoctorSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/hospital_doctor/hospital');
        const data = await response.json();
        setSchedule(data.doctor);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateEvents = useCallback((schedule: DoctorSchedule, date: Date) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    const availabilityEvents: CalendarEvent[] = schedule.availabilities.flatMap(avail => {
      return Array.from({ length: 4 }).map((_, weekIndex) => {
        const baseDate = new Date(date);
        baseDate.setDate(baseDate.getDate() + (7 * (weekIndex - 2)));
        
        const eventDate = new Date(baseDate);
        eventDate.setDate(baseDate.getDate() + (avail.dayOfWeek - baseDate.getDay() + 7) % 7);
        
        const start = new Date(eventDate);
        const [startHours, startMinutes] = avail.startTime.split(':').map(Number);
        start.setHours(startHours, startMinutes, 0, 0);

        const end = new Date(eventDate);
        const [endHours, endMinutes] = avail.endTime.split(':').map(Number);
        end.setHours(endHours, endMinutes, 0, 0);

        return {
          id: `avail-${avail.id}-${weekIndex}`,
          title: `Disponibilité: ${days[avail.dayOfWeek]}`,
          start,
          end,
          color: '#3b82f6',
          resource: { 
            type: 'availability'
          }
        };
      });
    });

    const appointmentEvents: CalendarEvent[] = schedule.appointments.map(appt => {
      const start = new Date(appt.scheduledAt);
      const end = appt.endTime ? new Date(appt.endTime) : new Date(start.getTime() + 30 * 60 * 1000);
    
      return {
        id: `appt-${appt.id}`,
        title: `RDV: ${appt.patient.user.name}`,
        start,
        end,
        color: appt.status === 'CONFIRMED' ? '#10b981' : '#f59e0b',
        resource: { 
          type: 'appointment',
          status: appt.status,
          patientName: appt.patient.user.name
        }
      };
    });

    return [...availabilityEvents, ...appointmentEvents];
  }, []);

  useEffect(() => {
    if (schedule) {
      const newEvents = generateEvents(schedule, currentDate);
      setEvents(newEvents);
    }
  }, [schedule, currentDate, generateEvents]);

  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const cardBgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-700";

  const eventStyleGetter = (event: CalendarEvent) => {
    const style = {
      backgroundColor: event.color || '#3174ad',
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return { style };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.resource?.type === 'appointment') {
      alert(`Rendez-vous avec ${event.title}\nStatut: ${event.resource.status}`);
    }
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  if (loading) return <div className={`p-6 ${bgColor}`}>Chargement...</div>;
  if (error) return <div className={`p-6 ${bgColor}`}>Erreur: {error}</div>;
  if (!schedule) return <div className={`p-6 ${bgColor}`}>Aucune donnée disponible</div>;

  return (
    <div className={`p-6 space-y-6 min-h-screen ${bgColor}`}>
      {/* En-tête */}
      <div className="text-center">
        <h1 className={`text-3xl font-bold ${textColor}`}>Mon Planning</h1>
        <div className="flex justify-center gap-4 mt-2">
          <Badge variant="outline">
            {schedule.hospital || "Hôpital non spécifié"}
          </Badge>
          <Badge variant="outline">
            {schedule.department || "Département non spécifié"}
          </Badge>
          <Badge variant="outline">
            {schedule.specialization}
          </Badge>
        </div>
      </div>

      {/* Calendrier */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <CalendarIcon className="w-6 h-6 text-blue-500" />
            Calendrier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultView={Views.WEEK}
              views={[Views.DAY, Views.WEEK, Views.MONTH]}
              step={30}
              timeslots={2}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              onNavigate={handleNavigate}
              date={currentDate}
              messages={{
                today: "Aujourd'hui",
                previous: "Précédent",
                next: "Suivant",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
                agenda: "Agenda",
                date: "Date",
                time: "Heure",
                event: "Événement",
              }}
              culture="fr"
            />
          </div>
        </CardContent>
      </Card>


      {/* Mes horaires de travail */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <Clock className="w-6 h-6 text-blue-500" />
            Mes horaires de travail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedule.availabilities.length === 0 ? (
              <p className={`text-sm ${textColor}`}>
                Aucun horaire de travail défini par l&apos;administration
              </p>
            ) : (
              schedule.availabilities.map(avail => {
                const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                return (
                  <div key={avail.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{days[avail.dayOfWeek]}</p>
                      <p>{avail.startTime} - {avail.endTime}</p>
                    </div>
                    <div>
                      {avail.isActive ? (
                        <Badge className="bg-green-500">Actif</Badge>
                      ) : (
                        <Badge variant="destructive">Inactif</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prochains rendez-vous */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <User className="w-6 h-6 text-blue-500" />
            Prochains rendez-vous
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedule.appointments.length === 0 ? (
              <p className={`text-sm ${textColor}`}>
                Aucun rendez-vous à venir
              </p>
            ) : (
              schedule.appointments.map(appt => (
                <div key={appt.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{appt.patient.user.name}</p>
                    <p>
                      {appt.scheduledAt.toLocaleDateString()} - 
                      {appt.startTime?.toLocaleTimeString() || 'Heure non définie'}
                    </p>
                  </div>
                  <div>
                    <Badge 
                      variant={appt.status === 'CONFIRMED' ? 'default' : 'outline'}
                      className={appt.status === 'PENDING' ? 'text-amber-500 border-amber-500' : ''}
                    >
                      {appt.status === 'CONFIRMED' ? 'Confirmé' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <Bell className="w-6 h-6 text-blue-500" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-sm ${textColor}`}>
            Les modifications de votre planning sont gérées par l&apos;administration de l&apos;hôpital.
            Contactez-les pour toute demande de changement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}