'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from "next-themes";
import { Calendar as CalendarIcon, Clock, User, X, Filter, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isToday, isTomorrow, addDays, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-date-range";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { cn } from "@/lib/utils";

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
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    patient: {
      user: {
        name: string;
        email: string;
        phone: string;
      };
    };
    notes?: string;
    reason?: string;
  }[];
}

interface AppointmentEventResource {
  status: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  notes?: string;
  reason?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: AppointmentEventResource;
  color?: string;
}

const statusColors: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#10b981',
  CANCELLED: '#ef4444',
  COMPLETED: '#3b82f6'
};

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  CANCELLED: 'Annulé',
  COMPLETED: 'Terminé'
};

const CustomEvent = ({ event }: { event: CalendarEvent }) => {
  return (
    <div className="p-1">
      <div className="font-medium text-sm truncate">{event.resource.patientName}</div>
      <div className="text-xs">
        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
      </div>
      <div className="text-xs mt-1">
        <Badge
          variant="outline"
          className="border-none px-1 py-0 h-auto text-xs"
          style={{ backgroundColor: statusColors[event.resource.status] + '20', color: statusColors[event.resource.status] }}
        >
          {statusLabels[event.resource.status]}
        </Badge>
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
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<"month" | "week" | "work_week" | "day" | "agenda">("week");
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
        color: statusColors[appt.status] || '#3174ad',
        resource: {
          status: appt.status,
          patientName: appt.patient.user.name,
          patientEmail: appt.patient.user.email,
          patientPhone: appt.patient.user.phone,
          notes: appt.notes,
          reason: appt.reason
        }
      };
    });
  }, []);

  useEffect(() => {
    if (doctorData) {
      const newEvents = generateEvents(doctorData);
      setEvents(newEvents);
      setFilteredEvents(newEvents);
    }
  }, [doctorData, generateEvents]);

  useEffect(() => {
    let results = [...events];

    // Filter by search term
    if (searchTerm) {
      results = results.filter(event =>
        event.resource.patientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      results = results.filter(event => event.resource.status === statusFilter);
    }

    // Filter by date
    if (dateFilter !== 'ALL') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (dateFilter) {
        case 'TODAY':
          results = results.filter(event => isToday(event.start));
          break;
        case 'TOMORROW':
          results = results.filter(event => isTomorrow(event.start));
          break;
        case 'THIS_WEEK':
          const weekStart = startOfWeek(today);
          const weekEnd = addDays(weekStart, 7);
          results = results.filter(event =>
            isWithinInterval(event.start, { start: weekStart, end: weekEnd })
          );
          break;
        case 'NEXT_WEEK':
          const nextWeekStart = addDays(startOfWeek(today), 7);
          const nextWeekEnd = addDays(nextWeekStart, 7);
          results = results.filter(event =>
            isWithinInterval(event.start, { start: nextWeekStart, end: nextWeekEnd })
          );
          break;
        case 'PAST':
          results = results.filter(event => event.start < today);
          break;
        case 'FUTURE':
          results = results.filter(event => event.start >= today);
          break;
        case 'CUSTOM':
          results = results.filter(event =>
            isWithinInterval(event.start, { 
              start: dateRange[0].startDate, 
              end: dateRange[0].endDate 
            })
          );
          break;
      }
    }

    setFilteredEvents(results);
  }, [events, searchTerm, statusFilter, dateFilter, dateRange]);

  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const cardBgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-800";

  const eventStyleGetter = (event: CalendarEvent) => {
    const style = {
      backgroundColor: event.color + '20',
      borderLeft: `4px solid ${event.color}`,
      borderRadius: '4px',
      color: textColor,
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

  const handleViewChange = (newView: string) => {
    setView(newView as "month" | "week" | "work_week" | "day" | "agenda");
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Type pour la sélection de plage de dates du date-range-picker
  interface DateRangeSelection {
    startDate: Date;
    endDate: Date;
    key: string;
  }

  const handleDateRangeChange = (item: { selection: DateRangeSelection }) => {
    setDateRange([item.selection]);
    setDateFilter('CUSTOM');
  };
  const resetDateFilter = () => {
    setDateFilter('ALL');
    setDateRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
      }
    ]);
  };

  if (loading) return (
    <div className={`p-6 ${bgColor} min-h-screen flex items-center justify-center`}>
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-blue-500 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 w-48 bg-gray-300 rounded"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className={`p-6 ${bgColor} min-h-screen flex items-center justify-center`}>
      <div className="text-center">
        <div className="text-red-500 mb-4">
          <X className="h-12 w-12 mx-auto" />
        </div>
        <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    </div>
  );

  if (!doctorData) return (
    <div className={`p-6 ${bgColor} min-h-screen flex items-center justify-center`}>
      <div className="text-center">
        <div className="text-gray-500 mb-4">
          <User className="h-12 w-12 mx-auto" />
        </div>
        <h2 className="text-xl font-bold mb-2">Aucune donnée disponible</h2>
        <p className="text-gray-500">Aucune information trouvée pour ce médecin</p>
      </div>
    </div>
  );

  return (
    <div className={`p-4 md:p-6 space-y-6 min-h-screen ${bgColor}`}>
      {/* Modal des détails du rendez-vous */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBgColor} rounded-lg p-6 w-full max-w-md max-h-[90vh] flex flex-col`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Détails du rendez-vous</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{getInitials(selectedAppointment.resource.patientName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedAppointment.resource.patientName}</h3>
                    <p className="text-sm text-gray-500">{selectedAppointment.resource.patientEmail}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p className="mt-1 text-sm">
                      {format(selectedAppointment.start, 'EEEE d MMMM yyyy', { locale: fr })}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Heure</h3>
                    <p className="mt-1 text-sm">
                      {format(selectedAppointment.start, 'HH:mm')} -{' '}
                      {format(selectedAppointment.end, 'HH:mm')}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                    <p className="mt-1 text-sm">
                      <Badge
                        variant="outline"
                        className="border-none"
                        style={{
                          backgroundColor: statusColors[selectedAppointment.resource.status] + '20',
                          color: statusColors[selectedAppointment.resource.status]
                        }}
                      >
                        {statusLabels[selectedAppointment.resource.status]}
                      </Badge>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                    <p className="mt-1 text-sm">{selectedAppointment.resource.patientPhone}</p>
                  </div>
                </div>

                {selectedAppointment.resource.reason && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Motif de consultation</h3>
                      <p className="mt-1 text-sm">{selectedAppointment.resource.reason}</p>
                    </div>
                  </>
                )}

                {selectedAppointment.resource.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                      <p className="mt-1 text-sm whitespace-pre-line">{selectedAppointment.resource.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>

            <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${textColor}`}>Mon Planning Médical</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {doctorData.name}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {doctorData.hospital || "Hôpital non spécifié"}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              {doctorData.department || "Département non spécifié"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filtres
            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <Card className={`${cardBgColor} shadow-sm`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-gray-500">
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Recherche par patient</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nom du patient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous les statuts</SelectItem>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                    <SelectItem value="COMPLETED">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Période</label>
                <div className="flex gap-2">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Toutes les dates</SelectItem>
                      <SelectItem value="TODAY">Aujourd&apos;hui</SelectItem>
                      <SelectItem value="TOMORROW">Demain</SelectItem>
                      <SelectItem value="THIS_WEEK">Cette semaine</SelectItem>
                      <SelectItem value="NEXT_WEEK">Semaine prochaine</SelectItem>
                      <SelectItem value="FUTURE">Futurs</SelectItem>
                      <SelectItem value="PAST">Passés</SelectItem>
                      <SelectItem value="CUSTOM">Personnalisée</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {dateFilter === 'CUSTOM' && (
                    <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !dateRange[0].startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange[0].startDate ? (
                            dateRange[0].endDate ? (
                              <>
                                {format(dateRange[0].startDate, "dd MMM yyyy", { locale: fr })} -{" "}
                                {format(dateRange[0].endDate, "dd MMM yyyy", { locale: fr })}
                              </>
                            ) : (
                              format(dateRange[0].startDate, "dd MMM yyyy", { locale: fr })
                            )
                          ) : (
                            <span>Choisir une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <DateRange
                          editableDateInputs={true}
                          onChange={handleDateRangeChange}
                          moveRangeOnFirstSelection={false}
                          ranges={dateRange}
                          locale={fr}
                          className={theme === 'dark' ? 'rdrDateRangePickerWrapper dark' : 'rdrDateRangePickerWrapper'}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end pt-0">
            <Button variant="ghost" size="sm" onClick={resetDateFilter}>
              Réinitialiser les filtres
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Calendrier */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              Calendrier des rendez-vous
            </CardTitle>

            <Tabs
              value={view}
              onValueChange={handleViewChange}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value={Views.DAY}>Jour</TabsTrigger>
                <TabsTrigger value={Views.WEEK}>Semaine</TabsTrigger>
                <TabsTrigger value={Views.MONTH}>Mois</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              defaultView={view}
              view={view}
              onView={handleViewChange}
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
              className={theme === 'dark' ? 'dark-calendar' : ''}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-[#f59e0b]"></div>
              <span className="text-sm">En attente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-[#10b981]"></div>
              <span className="text-sm">Confirmé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-[#ef4444]"></div>
              <span className="text-sm">Annulé</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {filteredEvents.length} rendez-vous trouvés
          </p>
        </CardFooter>
      </Card>

      {/* Grille inférieure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes horaires de travail */}
        <Card className={`${cardBgColor} shadow-sm`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
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
                doctorData.availabilities
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map(avail => {
                    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                    return (
                      <div key={avail.id} className={`flex items-center justify-between p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div>
                          <p className="font-medium">{days[avail.dayOfWeek]}</p>
                          <p className="text-sm text-gray-500">
                            {avail.startTime} - {avail.endTime}
                          </p>
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
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Prochains rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <p className={`text-sm ${textColor}`}>
                  Aucun rendez-vous à afficher
                </p>
              ) : (
                filteredEvents
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .slice(0, 5)
                  .map(event => (
                    <div
                      key={event.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                      onClick={() => handleSelectEvent(event)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(event.resource.patientName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{event.resource.patientName}</p>
                          <p className="text-xs text-gray-500">
                            {format(event.start, 'HH:mm')} • {format(event.start, 'EEE d MMM', { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Badge
                          variant="outline"
                          className="border-none text-xs"
                          style={{
                            backgroundColor: statusColors[event.resource.status] + '20',
                            color: statusColors[event.resource.status]
                          }}
                        >
                          {statusLabels[event.resource.status]}
                        </Badge>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-center pt-0">
            <Button variant="ghost" size="sm">
              Voir tous les rendez-vous
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}