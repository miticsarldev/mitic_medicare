'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from "next-themes";
import { Calendar as CalendarIcon, Clock, User, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface DoctorData {
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
    status: 'PENDING' | 'CONFIRMED';
    patient: {
      user: {
        name: string;
        email: string;
        phone: string;
      };
    };
    notes?: string;
  }[];
}

interface AppointmentEventResource {
  status: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  notes?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: AppointmentEventResource;
  color?: string;
}

const CustomEvent = ({ event }: { event: CalendarEvent }) => {
  return (
    <div className="p-1">
      <div className="font-medium">{event.resource.patientName}</div>
      <div className="text-xs">
        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
      </div>
    </div>
  );
};

export default function DoctorSchedulePage() {
  const { theme } = useTheme();
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/hospital_doctor/hospital');
        if (!response.ok) {
          throw new Error('Erreur de chargement des données');
        }
        const data = await response.json();
        setDoctorData(data.doctor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateEvents = useCallback((doctor: DoctorData) => {
    return doctor.appointments.map(appt => {
      const start = new Date(appt.scheduledAt);
      const end = appt.endTime ? new Date(appt.endTime) : new Date(start.getTime() + 30 * 60 * 1000);
    
      return {
        id: `appt-${appt.id}`,
        title: appt.patient.user.name,
        start,
        end,
        color: appt.status === 'CONFIRMED' ? '#10b981' : '#f59e0b',
        resource: {
          status: appt.status,
          patientName: appt.patient.user.name,
          patientEmail: appt.patient.user.email,
          patientPhone: appt.patient.user.phone,
          notes: appt.notes
        }
      };
    });
  }, []);

  useEffect(() => {
    if (doctorData) {
      const newEvents = generateEvents(doctorData);
      setEvents(newEvents);
    }
  }, [doctorData, generateEvents]);

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
      padding: '2px',
    };
    return { style };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedAppointment(event);
    setIsModalOpen(true);
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  if (loading) return <div className={`p-6 ${bgColor}`}>Chargement...</div>;
  if (error) return <div className={`p-6 ${bgColor}`}>Erreur: {error}</div>;
  if (!doctorData) return <div className={`p-6 ${bgColor}`}>Aucune donnée disponible</div>;

  return (
    <div className={`p-6 space-y-6 min-h-screen ${bgColor}`}>
      {/* Modal des détails du rendez-vous */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBgColor} rounded-lg p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Détails du rendez-vous</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Patient</h3>
                <p className="mt-1 text-sm">{selectedAppointment.resource.patientName}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm">{selectedAppointment.resource.patientEmail}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                <p className="mt-1 text-sm">{selectedAppointment.resource.patientPhone}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date et heure</h3>
                <p className="mt-1 text-sm">
                  {format(selectedAppointment.start, 'EEEE d MMMM yyyy', { locale: fr })} à{' '}
                  {format(selectedAppointment.start, 'HH:mm')} -{' '}
                  {format(selectedAppointment.end, 'HH:mm')}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                <p className="mt-1 text-sm">
                  {selectedAppointment.resource.status === 'CONFIRMED' ? 'Confirmé' : 'En attente'}
                </p>
              </div>
              
              {selectedAppointment.resource.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="mt-1 text-sm">{selectedAppointment.resource.notes}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setIsModalOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="text-center">
        <h1 className={`text-3xl font-bold ${textColor}`}>Mon Planning</h1>
        <div className="flex justify-center gap-4 mt-2">
          <Badge variant="outline">
            {doctorData.hospital || "Hôpital non spécifié"}
          </Badge>
          <Badge variant="outline">
            {doctorData.department || "Département non spécifié"}
          </Badge>
          <Badge variant="outline">
            {doctorData.specialization}
          </Badge>
        </div>
      </div>

      {/* Calendrier */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <CalendarIcon className="w-6 h-6 text-blue-500" />
            Calendrier des rendez-vous
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
                event: "Rendez-vous",
              }}
              culture="fr"
              components={{
                event: CustomEvent
              }}
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
            {doctorData.availabilities.length === 0 ? (
              <p className={`text-sm ${textColor}`}>
                Aucun horaire de travail défini
              </p>
            ) : (
              doctorData.availabilities.map(avail => {
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
            {doctorData.appointments.length === 0 ? (
              <p className={`text-sm ${textColor}`}>
                Aucun rendez-vous à venir
              </p>
            ) : (
              doctorData.appointments.map(appt => (
                <div key={appt.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{appt.patient.user.name}</p>
                    <p>
                      {appt.startTime?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) || 
                       format(new Date(appt.scheduledAt), 'HH:mm')}
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
    </div>
  );
}