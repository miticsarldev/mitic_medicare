"use client";
import { useState } from "react";
import { CheckCircle, XCircle, Calendar, Clock, MapPin } from "lucide-react";
import { appointmentsByDate } from "@/constant";
import { useTheme } from "next-themes";

const DoctorAppointments = () => {
  const { theme } = useTheme();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const handleStatusChange = (id, newStatus) => {
    const updatedAppointments = appointmentsByDate[selectedDate].map((app) =>
      app.id === id ? { ...app, status: newStatus } : app
    );
    appointmentsByDate[selectedDate] = updatedAppointments;
  };

  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-100";
  const cardBgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-700";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-300";

  return (
    <div className={`min-h-screen ${bgColor} p-6`}>
      <div className={`${cardBgColor} p-4 rounded-lg shadow-md flex justify-between items-center`}>
        <h1 className={`text-2xl font-bold ${textColor} flex items-center`}>
          <Calendar className="mr-2" size={24} /> Rendez-vous Médicaux
        </h1>
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`border ${borderColor} rounded-md px-3 py-1 ${bgColor} ${textColor}`}
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {appointmentsByDate[selectedDate]?.length > 0 ? (
          appointmentsByDate[selectedDate].map((appointment) => (
            <div
              key={appointment.id}
              className={`p-4 ${cardBgColor} rounded-lg shadow-md flex justify-between items-center border-l-4 ${borderColor}`}
            >
              <div>
                <h3 className={`text-lg font-semibold ${textColor}`}>{appointment.patient}</h3>
                <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-500"} flex items-center`}>
                  <Clock className="mr-1" size={16} /> {appointment.time} | <MapPin className="ml-2 mr-1" size={16} /> {appointment.reason}
                </p>
              </div>

              <div className="flex space-x-3">
                {appointment.status === "pending" ? (
                  <>
                    <button
                      className={`flex items-center border border-green-500 text-green-500 px-4 py-2 rounded-md hover:bg-green-500 hover:text-white transition`}
                      onClick={() => handleStatusChange(appointment.id, "accepted")}
                    >
                      <CheckCircle className="mr-2" size={18} /> Accepter
                    </button>
                    <button
                      className={`flex items-center border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white transition`}
                      onClick={() => handleStatusChange(appointment.id, "rejected")}
                    >
                      <XCircle className="mr-2" size={18} /> Refuser
                    </button>
                  </>
                ) : appointment.status === "accepted" ? (
                  <span className="flex items-center text-green-600 font-semibold">
                    <CheckCircle className="mr-2" size={18} /> Accepté
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 font-semibold">
                    <XCircle className="mr-2" size={18} /> Refusé
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-500"} text-center`}>
            Aucun rendez-vous prévu ce jour-là.
          </p>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;