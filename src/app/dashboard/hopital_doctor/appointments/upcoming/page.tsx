"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Calendar, Clock, MapPin, User, Info, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Appointment = {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  age: number;
  bloodType: string;
  hospitalName: string;
  hospitalLocation: string;
  scheduledAt: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
  type: string;
  reason: string;
  notes: string;
};

const DoctorAppointments = () => {
  const { theme } = useTheme();
  const today = new Date().toISOString().split("T")[0];
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/hospital_doctor/patient");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des rendez-vous");
        }
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des rendez-vous :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const calculateStats = () => {
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === "COMPLETED").length;
    const pendingAppointments = appointments.filter(a => a.status === "PENDING").length;
    const canceledAppointments = appointments.filter(a => a.status === "CANCELED" || a.status === "REJECTED").length;
    
    const completionRate = totalAppointments > 0 
      ? Math.round((completedAppointments / totalAppointments) * 100) 
      : 0;
    
    const cancellationRate = totalAppointments > 0 
      ? Math.round((canceledAppointments / totalAppointments) * 100) 
      : 0;

    return {
      total: totalAppointments,
      completed: completedAppointments,
      pending: pendingAppointments,
      canceled: canceledAppointments,
      completionRate,
      cancellationRate,
      averageDuration: 60 // Valeur fixe pour l'exemple
    };
  };

  const stats = calculateStats();

  const filteredAppointments = appointments.filter((app) => {
    const appointmentDate = new Date(app.scheduledAt).toISOString().split("T")[0];
    const dateMatch = appointmentDate === selectedDate;
    const statusMatch = filterStatus === "all" || app.status.toLowerCase() === filterStatus.toLowerCase();
    return dateMatch && statusMatch;
  });

  const handleAppointmentStatus = async (appointmentId: string, newStatus: "CONFIRMED" | "REJECTED") => {
    try {
      const response = await fetch(`/api/hospital_doctor/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (response.ok) {
        setAppointments(appointments.map(app => 
          app.id === appointmentId ? { ...app, status: newStatus } : app
        ));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  const openAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  return (
    <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className={`p-6 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Calendar className="mr-2" size={24} /> Rendez-vous Médicaux
          </h1>
          <div className="mt-4 md:mt-0 flex gap-4">
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="border rounded-md px-3 py-2" 
            />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              className="border rounded-md px-3 py-2"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="rejected">Refusés</option>
              <option value="completed">Complétés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nouvelle section des statistiques */}
      <div className={`mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 ${theme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-lg`}>
  {/* Total des rendez-vous */}
  <div className="border rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
      <h3 className="text-gray-500 text-sm">Total des rendez-vous</h3>
    </div>
    <p className="text-2xl font-bold">{stats.total}</p>
    <p className="text-sm bg-blue-50 text-blue-500 border-blue-200">Rendez-vous Total</p>
  </div>
  
  {/* Rendez-vous complétés */}
  <div className="border rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-3 h-3 rounded-full bg-green-500"></div>
      <h3 className="text-gray-500 text-sm">Rendez-vous complétés</h3>
    </div>
    <p className="text-2xl font-bold">{stats.completed}</p>
    <p className="text-sm bg-green-50 text-green-500 border-green-200">{stats.completionRate}% de taux de complétion</p>
  </div>
  
  {/* Rendez-vous en attente */}
  <div className="border rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
      <h3 className="text-gray-500 text-sm">Rendez-vous en attente</h3>
    </div>
    <p className="text-2xl font-bold">{stats.pending}</p>
    <p className="text-sm bg-yellow-50 text-yellow-500 border-yellow-200">{stats.pending} à venir</p>
  </div>
  
  {/* Rendez-vous annulés */}
  <div className="border rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-3 h-3 rounded-full bg-red-500"></div>
      <h3 className="text-gray-500 text-sm">Rendez-vous annulés</h3>
    </div>
    <p className="text-2xl font-bold">{stats.canceled}</p>
    <p className="text-sm bg-red-50 text-red-500 border-red-200">{stats.cancellationRate}% de taux d&apos;annulation</p>
  </div>
        
      </div>

      {loading ? (
        <p className="text-center mt-6">Chargement des rendez-vous...</p>
      ) : (
        <div className="mt-6 space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className={`p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center border-l-4 ${
                  appointment.status === "CONFIRMED" ? "border-green-500" :
                  appointment.status === "REJECTED" ? "border-red-500" :
                  "border-gray-300"
                } ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
              >
                <div className="mb-4 md:mb-0 flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{appointment.patientName}</h3>
                    <button 
                      onClick={() => openAppointmentDetails(appointment)}
                      className="md:hidden text-blue-500"
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>
                  <p className="text-gray-500 flex items-center mt-2">
                    <User className="mr-2" size={16} /> {appointment.age} ans • {appointment.bloodType}
                  </p>
                  <p className="text-gray-500 flex items-center mt-1">
                    <Clock className="mr-2" size={16} /> 
                    {new Date(appointment.scheduledAt).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-gray-500 flex items-center mt-1">
                    <MapPin className="mr-2" size={16} /> {appointment.hospitalName}
                  </p>
                  <p className="text-gray-500 mt-1">Motif : {appointment.reason}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <button 
                    onClick={() => openAppointmentDetails(appointment)}
                    className="hidden md:flex items-center border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-500 hover:text-white"
                  >
                    <Info className="mr-2" size={18} /> Détails
                  </button>
                  
                  {appointment.status === "PENDING" ? (
                    <>
                      <button 
                        onClick={() => handleAppointmentStatus(appointment.id, "CONFIRMED")}
                        className="flex items-center justify-center border border-green-500 text-green-500 px-4 py-2 rounded-md hover:bg-green-500 hover:text-white"
                      >
                        <CheckCircle className="mr-2" size={18} /> Accepter
                      </button>
                      <button 
                        onClick={() => handleAppointmentStatus(appointment.id, "REJECTED")}
                        className="flex items-center justify-center border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white"
                      >
                        <XCircle className="mr-2" size={18} /> Refuser
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-2 rounded-md text-center ${
                      appointment.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                      appointment.status === "REJECTED" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {appointment.status === "CONFIRMED" ? "Accepté" : 
                       appointment.status === "REJECTED" ? "Refusé" : 
                       appointment.status === "COMPLETED" ? "Complété" : 
                       "Annulé"}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center mt-6">Aucun rendez-vous trouvé pour cette date.</p>
          )}
        </div>
      )}

      {/* Modal de détails */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Patient</h4>
                  <p>{selectedAppointment.patientName}</p>
                  <p className="text-gray-600">{selectedAppointment.age} ans</p>
                  <p className="text-gray-600">{selectedAppointment.bloodType}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Contact</h4>
                  <p>{selectedAppointment.patientEmail}</p>
                  <p className="text-gray-600">{selectedAppointment.patientPhone}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Rendez-vous</h4>
                  <p>
                    {new Date(selectedAppointment.scheduledAt).toLocaleString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-gray-600">{selectedAppointment.type}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Lieu</h4>
                  <p>{selectedAppointment.hospitalName}</p>
                  <p className="text-gray-600">{selectedAppointment.hospitalLocation}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Motif</h4>
                <p>{selectedAppointment.reason}</p>
              </div>

              <div>
                <h4 className="font-semibold">Notes</h4>
                <p className="text-gray-600 whitespace-pre-line">
                  {selectedAppointment.notes || "Aucune note"}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                {selectedAppointment.status === "PENDING" && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => handleAppointmentStatus(selectedAppointment.id, "REJECTED")}
                    >
                      <XCircle className="mr-2" size={18} /> Refuser
                    </Button>
                    <Button 
                      onClick={() => handleAppointmentStatus(selectedAppointment.id, "CONFIRMED")}
                    >
                      <CheckCircle className="mr-2" size={18} /> Accepter
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorAppointments;