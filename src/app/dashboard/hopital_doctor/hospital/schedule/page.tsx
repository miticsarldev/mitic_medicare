'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Stethoscope, ClipboardList, User, CheckCircle, XCircle, Activity } from "lucide-react";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useTheme } from "next-themes";

export default function DoctorSchedulePage() {
  const { theme } = useTheme(); // Détecter le thème actuel

  // Données du médecin (simulées)
  const doctor = {
    name: "Dr. Jean Dupont",
    specialty: "Cardiologie",
  };

  // Événements du calendrier (simulés)
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Consultation - Sophie Martin",
      start: "2024-03-12T09:00:00",
      end: "2024-03-12T09:30:00",
      color: "#3b82f6",
    },
    {
      id: "2",
      title: "Réunion d'équipe",
      start: "2024-03-12T10:00:00",
      end: "2024-03-12T11:00:00",
      color: "#10b981",
    },
    {
      id: "3",
      title: "Consultation - David Garcia",
      start: "2024-03-12T11:30:00",
      end: "2024-03-12T12:00:00",
      color: "#3b82f6",
    },
    {
      id: "4",
      title: "Opération - Appendicectomie",
      start: "2024-03-12T14:00:00",
      end: "2024-03-12T15:30:00",
      color: "#ef4444",
    },
  ]);

  // Tâches à accomplir (simulées)
  const tasks = [
    { id: 1, description: "Préparer le dossier de Sophie Martin", completed: false },
    { id: 2, description: "Relire les résultats de David Garcia", completed: true },
    { id: 3, description: "Planifier la réunion avec l'équipe chirurgicale", completed: false },
  ];

  // Gestion des clics sur les événements du calendrier
  const handleEventClick = (info) => {
    alert(`Événement : ${info.event.title}`);
  };

  // Couleurs conditionnelles en fonction du thème
  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const cardBgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-700";
  const secondaryTextColor = theme === "dark" ? "text-gray-300" : "text-gray-500";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  return (
    <div className={`p-6 space-y-6 min-h-screen ${bgColor}`}>
      {/* En-tête */}
      <div className="text-center">
        <h1 className={`text-3xl font-bold ${textColor}`}>Planning de {doctor.name}</h1>
        <p className={`text-sm ${secondaryTextColor} mt-2`}>Spécialité : {doctor.specialty}</p>
      </div>

      {/* Section : Calendrier */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <Calendar className="w-6 h-6 text-blue-500" />
            Calendrier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            events={events}
            eventClick={handleEventClick}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            height="auto"
            themeSystem={theme} // Appliquer le thème sombre ou clair
          />
        </CardContent>
      </Card>

      {/* Section : Tâches à accomplir */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <ClipboardList className="w-6 h-6 text-purple-500" />
            Tâches à accomplir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`flex items-center justify-between p-3 border ${borderColor} rounded-md`}
              >
                <div className="flex items-center gap-2">
                  {task.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`${task.completed ? "line-through text-gray-500" : textColor}`}>
                    {task.description}
                  </span>
                </div>
                <button
                  className={`bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition duration-200`}
                  onClick={() => alert(`Tâche : ${task.description}`)}
                >
                  Détails
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section : Statistiques */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <Activity className="w-6 h-6 text-orange-500" />
            Statistiques
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`flex items-center gap-4 p-4 border ${borderColor} rounded-md`}>
            <User className="w-8 h-8 text-blue-500" />
            <div>
              <p className={`text-lg font-semibold ${textColor}`}>12 patients</p>
              <p className={`text-sm ${secondaryTextColor}`}>Aujourd'hui</p>
            </div>
          </div>
          <div className={`flex items-center gap-4 p-4 border ${borderColor} rounded-md`}>
            <Clock className="w-8 h-8 text-green-500" />
            <div>
              <p className={`text-lg font-semibold ${textColor}`}>30 min</p>
              <p className={`text-sm ${secondaryTextColor}`}>Temps moyen par consultation</p>
            </div>
          </div>
          <div className={`flex items-center gap-4 p-4 border ${borderColor} rounded-md`}>
            <Stethoscope className="w-8 h-8 text-purple-500" />
            <div>
              <p className={`text-lg font-semibold ${textColor}`}>3 opérations</p>
              <p className={`text-sm ${secondaryTextColor}`}>Cette semaine</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}