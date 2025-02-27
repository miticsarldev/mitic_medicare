"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import { pastAppointments, upcomingAppointments } from "@/constant";

export default function AppointmentHistory() {
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: number;
    date: string;
    doctor: string;
    specialty: string;
    reason?: string;
  } | null>(null);
  const [showPast, setShowPast] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-100/50 dark:from-background dark:to-blue-950/50">
      <div className="max-w-screen-xl mx-auto">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-1/4 p-4 border-r dark:border-gray-700">
              <button
                className="text-blue-600 hover:underline dark:text-blue-400"
                onClick={() => setShowPast(!showPast)}
              >
                Voir mes rendez-vous passés
              </button>
              <ul className="mt-4 space-y-2">
                {(showPast ? pastAppointments : upcomingAppointments).map((appointment) => (
                  <li
                    key={appointment.id}
                    className="p-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <p className="text-gray-800 dark:text-white font-semibold">{appointment.date}</p>
                    <p className="text-gray-600 dark:text-gray-300">{appointment.doctor} - {appointment.specialty}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Main Content */}
            <div className="w-3/4 flex flex-col items-center justify-center">
              {selectedAppointment ? (
                <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-600">
                  <button 
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setSelectedAppointment(null)}
                  >
                    <X size={20} />
                  </button>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Détails du rendez-vous</h2>
                  <p className="text-gray-800 dark:text-white font-semibold">{selectedAppointment.date}</p>
                  <p className="text-gray-600 dark:text-gray-300">{selectedAppointment.doctor} - {selectedAppointment.specialty}</p>
                  {selectedAppointment.reason && (
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Motif: {selectedAppointment.reason}</p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Calendar size={48} className="text-blue-500 mx-auto" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-4">
                    Vous n&apos;avez pas de rendez-vous à venir
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Prenez votre santé en main. Réservez facilement votre prochain rendez-vous sur MediCare.
                  </p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Prendre rendez-vous</Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
