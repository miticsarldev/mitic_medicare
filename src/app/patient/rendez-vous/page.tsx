"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import { Calendar, PhoneCall, MapPin, FileText, User, PlusCircle, Clock, Stethoscope, Share2, CreditCard } from "lucide-react";
import { pastAppointments } from "@/constant";
import Image from "next/image"; 

type Appointment = {
  id: number;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  phone?: number;
  location?: string;
  patient: string;
  doctorImage: string;
  paymentMethod?: string;
};

export default function AppointmentHistory() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-screen-xl mx-auto"> 
        <Navbar />
        <div className="max-w-7xl mx-auto flex p-6 gap-6">
          {/* Sidebar */}
          <div className="w-1/4 bg-white dark:bg-gray-900 shadow-md rounded-lg p-4 overflow-y-auto max-h-[80vh]">
            <h2 className="text-lg font-bold mb-4 text-blue-700 dark:text-blue-300">Rendez-vous passés</h2>
            <ul className="space-y-4">
              {pastAppointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className={`p-4 rounded-lg cursor-pointer border-l-4 transition-all duration-300 ${
                    selectedAppointment?.id === appointment.id
                      ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
                      : "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  } shadow-md`}
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-600 dark:text-blue-300" />
                      <span className="bg-blue-200 dark:bg-blue-800 p-1 rounded">{appointment.date}</span>
                    </span>
                    <span className="flex items-center gap-2 bg-blue-200 dark:bg-blue-800 p-1 rounded">
                      <Clock size={16} className="text-red-600 dark:text-red-400" />
                      {appointment.time}
                    </span>
                  </div> 
                  <div className="flex items-center gap-3 mt-3">
                    <Image src={appointment.doctorImage} alt="Doctor" width={400} height={400} className="w-10 h-10 rounded-full border" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg">{appointment.doctor}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Stethoscope size={16} className="text-blue-600 dark:text-blue-300" /> {appointment.specialty}
                      </p>
                    </div>
                  </div>
                  <hr className="my-2 border-gray-300 dark:border-gray-600" />
                  <div className="mt-2 flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                    <User size={16} className="text-blue-600 dark:text-blue-300" />
                    {appointment.patient}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Details */}
          <div className="w-3/4 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden max-h-[80vh] flex flex-col">
            {selectedAppointment ? (
              <div className="flex flex-col flex-1 overflow-y-auto">
                {/* Date Section */}
                <div className="bg-blue-500 text-white py-3 p-6 rounded-t-lg font-bold text-lg">
                  <span className="flex items-center gap-2">
                    <Calendar size={16} className="text-white-600 dark:text-white-300" />
                    {selectedAppointment.date} à {selectedAppointment.time}
                  </span>
                </div>
                
                {/* Doctor Info */} 
                <div className="flex items-center gap-4 border-b p-4 py-3">
                    <Image src={selectedAppointment.doctorImage} alt="Doctor" width={200} height={200} className="w-16 h-16 rounded-full border" />
                    <div>
                      <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">{selectedAppointment.doctor}</h3>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">{selectedAppointment.specialty}</p>
                    </div>
                </div>
                
                <p className="p-4 py-3 text-gray-600 dark:text-gray-400 flex items-center gap-2"><Stethoscope size={16} className="text-blue-600 dark:text-blue-300" />Consultation de suivi de Médecin Generaliste</p>

                {/* Documents Section */}
                <div className="bg-blue-100 dark:bg-blue-900 p-4">
                  <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-blue-800 dark:text-blue-300">Documents envoyers (1)</h3>
                  </span> 
                </div>

                {/* New Appointment Button */}
                <div className="p-4 bg-white">
                  <button className="flex items-center gap-2 bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 dark:hover:bg-blue-800">
                    <PlusCircle size={20} /> Nouveau rendez-vous
                  </button>
                </div>
                
                {/* Patient Info */}
                <div className="p-4 border-b dark:border-gray-700">
                  <h3 className="font-bold text-blue-800 dark:text-blue-300">Informations du patient</h3>
                  <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User size={16} className="text-blue-600 dark:text-blue-400" /> {selectedAppointment.patient}
                  </p>
                  <button className="flex items-center gap-2 text-blue-500 hover:text-blue-700">
                    <Share2 size={16} /> Partager avec quelqu&apos;un
                  </button>
                </div>

                {/* Establishment Details */}
                <div className="p-4">
                  <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Détails de l&apos;établissement</h3>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2"><PhoneCall size={16} className="text-blue-600 dark:text-blue-400" /> {selectedAppointment.phone}</p>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-2"><MapPin size={16} className="text-blue-600 dark:text-blue-400" /> {selectedAppointment.location}</p>
                </div>

                {/* Payment Method */}
                <div className="p-4 mt-4">
                  <h3 className="font-bold text-blue-800 dark:text-blue-300">Mode de paiement</h3>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <CreditCard size={16} className="text-blue-600 dark:text-blue-400" /> {selectedAppointment.paymentMethod || "Non spécifié"}
                  </p> 
                </div>

              </div>
            ) : (
              <div className="text-center flex flex-col items-center justify-center h-full">
                <Calendar size={48} className="text-blue-500 dark:text-blue-300" />
                <h2 className="text-lg font-bold mt-4 text-gray-900 dark:text-gray-100">Sélectionnez un rendez-vous</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Cliquez sur un rendez-vous à gauche pour voir les détails.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
