"use client";
import { useState } from "react";
import { CheckCircle, XCircle, Calendar, Clock, MapPin, User, Download } from "lucide-react";
import { appointmentsByDate } from "@/constant";
import { useTheme } from "next-themes";

const DoctorAppointments = () => {
  const { theme } = useTheme();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [filterStatus, setFilterStatus] = useState("all");

  const handleStatusChange = (id, newStatus) => {
    const updatedAppointments = appointmentsByDate[selectedDate].map((app) =>
      app.id === id ? { ...app, status: newStatus } : app
    );
    appointmentsByDate[selectedDate] = updatedAppointments;
  };

  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const cardBgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-700";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const secondaryTextColor = theme === "dark" ? "text-gray-300" : "text-gray-500";

  // Filtrer les rendez-vous par statut
  const filteredAppointments = appointmentsByDate[selectedDate]?.filter((app) => {
    if (filterStatus === "all") return true;
    return app.status === filterStatus;
  });

  // Statistiques des rendez-vous
  const totalAppointments = appointmentsByDate[selectedDate]?.length || 0;
  const acceptedAppointments =
    appointmentsByDate[selectedDate]?.filter((app) => app.status === "accepted").length || 0;
  const pendingAppointments =
    appointmentsByDate[selectedDate]?.filter((app) => app.status === "pending").length || 0;
  const rejectedAppointments =
    appointmentsByDate[selectedDate]?.filter((app) => app.status === "rejected").length || 0;

  return (
    <div className={`min-h-screen ${bgColor} p-6`}>
      <div className={`${cardBgColor} p-6 rounded-lg shadow-lg`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className={`text-2xl font-bold ${textColor} flex items-center`}>
              <Calendar className="mr-2" size={24} /> Rendez-vous Médicaux
            </h1>
            <p className={`text-sm ${secondaryTextColor} mt-1`}>
              Consultez et gérez les rendez-vous de vos patients.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`border ${borderColor} rounded-md px-3 py-2 ${bgColor} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`border ${borderColor} rounded-md px-3 py-2 ${bgColor} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="accepted">Acceptés</option>
              <option value="rejected">Refusés</option>
            </select>
            
            <button
              className={`flex items-center border ${borderColor} text-gray-700 dark:text-gray-100 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200`}
            >
              <Download className="mr-2" size={18} /> Exporter
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${cardBgColor} p-4 rounded-lg shadow-md`}>
          <p className={`text-sm ${secondaryTextColor}`}>Total des rendez-vous</p>
          <p className={`text-2xl font-bold ${textColor}`}>{totalAppointments}</p>
        </div>
        <div className={`${cardBgColor} p-4 rounded-lg shadow-md`}>
          <p className={`text-sm ${secondaryTextColor}`}>Acceptés</p>
          <p className={`text-2xl font-bold text-green-600`}>{acceptedAppointments}</p>
        </div>
        <div className={`${cardBgColor} p-4 rounded-lg shadow-md`}>
          <p className={`text-sm ${secondaryTextColor}`}>En attente</p>
          <p className={`text-2xl font-bold text-amber-500`}>{pendingAppointments}</p>
        </div>
        <div className={`${cardBgColor} p-4 rounded-lg shadow-md`}>
          <p className={`text-sm ${secondaryTextColor}`}>Refusés</p>
          <p className={`text-2xl font-bold text-red-600`}>{rejectedAppointments}</p>
        </div>
      </div>

      {/* Liste des rendez-vous */}
      <div className="mt-6 space-y-4">
        {filteredAppointments?.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`p-6 ${cardBgColor} rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center border-l-4 ${
                appointment.status === "accepted"
                  ? "border-green-500"
                  : appointment.status === "rejected"
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${textColor}`}>
                  {appointment.patient}
                </h3>
                <p className={`${secondaryTextColor} flex items-center mt-2`}>
                  <User className="mr-2" size={16} /> {appointment.age} ans, {appointment.gender}
                </p>
                <p className={`${secondaryTextColor} flex items-center mt-1`}>
                  <Clock className="mr-2" size={16} /> {appointment.time}
                </p>
                <p className={`${secondaryTextColor} flex items-center mt-1`}>
                  <MapPin className="mr-2" size={16} /> {appointment.reason}
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex space-x-3">
                {appointment.status === "pending" ? (
                  <>
                    <button
                      className={`flex items-center border border-green-500 text-green-500 px-4 py-2 rounded-md hover:bg-green-500 hover:text-white transition duration-200`}
                      onClick={() => handleStatusChange(appointment.id, "accepted")}
                    >
                      <CheckCircle className="mr-2" size={18} /> Accepter
                    </button>
                    <button
                      className={`flex items-center border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white transition duration-200`}
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
          <p className={`${secondaryTextColor} text-center py-6`}>
            Aucun rendez-vous prévu ce jour-là.
          </p>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;