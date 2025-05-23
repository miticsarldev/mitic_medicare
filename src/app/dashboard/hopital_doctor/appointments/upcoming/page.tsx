"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Calendar, Clock, MapPin, User, Info, Stethoscope } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MedicalRecordModal } from "@/components/record";

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
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
  type: string;
  reason: string;
  notes: string;
  medicalRecord?: {
    diagnosis: string;
    treatment: string;
  } | null;
};

const DoctorAppointments = () => {
  const { theme } = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMedicalRecordModalOpen, setIsMedicalRecordModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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
    const confirmedAppointments = appointments.filter(a => a.status === "CONFIRMED").length;
    const canceledAppointments = appointments.filter(a => a.status === "CANCELED").length;
    
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
      confirmed: confirmedAppointments,
      canceled: canceledAppointments,
      completionRate,
      cancellationRate,
    };
  };

  const stats = calculateStats();

  const filteredAppointments = appointments.filter((app) => {
    const statusMatch = filterStatus === "all" || app.status.toLowerCase() === filterStatus.toLowerCase();
    return statusMatch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleAppointmentStatus = async (appointmentId: string, newStatus: "CONFIRMED" | "COMPLETED" | "CANCELED") => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500 hover:bg-green-600">Terminé</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Confirmé</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">En attente</Badge>;
      case "CANCELED":
        return <Badge variant="destructive">Annulé</Badge>;
      case "NO_SHOW":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Non présenté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className={`p-6 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Calendar className="mr-2" size={24} /> Rendez-vous Médicaux
          </h1>
          <div className="mt-4 md:mt-0 flex gap-4">
            <select 
              value={filterStatus} 
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }} 
              className="border rounded-md px-3 py-2"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="canceled">Annulés</option>
              <option value="completed">Terminés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section des statistiques */}
      <div className={`mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 ${theme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-lg`}>
        {/* Total des rendez-vous */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-700"></div>
            <h3 className="text-gray-500 text-sm">Total des rendez-vous</h3>
          </div>
           <p className="text-2xl font-bold">{stats.total}</p>
           <p className="text-sm bg-blue-50 text-blue-700 border-blue-200">Rendez-vous Total</p>
        </div>
        
        {/* Rendez-vous confirmés */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <h3 className="text-gray-500 text-sm">Confirmés</h3>
          </div>
          <p className="text-2xl font-bold">{stats.confirmed}</p>
          <p className="text-sm bg-blue-50 text-blue-500 border-blue-200">{stats.confirmed} à Confirmer</p>
        </div>
        
        {/* Rendez-vous terminés */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h3 className="text-gray-500 text-sm">Terminés</h3>
          </div>
          <p className="text-2xl font-bold">{stats.completed}</p>
          <p className="text-sm text-green-500">{stats.completionRate}% de taux de complétion</p>
        </div>
        
        {/* Rendez-vous annulés */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <h3 className="text-gray-500 text-sm">Annulés</h3>
          </div>
          <p className="text-2xl font-bold">{stats.canceled}</p>
          <p className="text-sm text-red-500">{stats.cancellationRate}% de taux d&aposannulation</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center mt-6">Chargement des rendez-vous...</p>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {currentAppointments.length > 0 ? (
              currentAppointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className={`p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center border-l-4 ${
                    appointment.status === "COMPLETED" ? "border-green-500" :
                    appointment.status === "CONFIRMED" ? "border-blue-500" :
                    appointment.status === "CANCELED" ? "border-red-500" :
                    "border-gray-300"
                  } ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
                >
                  <div className="mb-4 md:mb-0 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{appointment.patientName}</h3>
                      <div className="md:hidden">
                        {getStatusBadge(appointment.status)}
                      </div>
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
                    <div className="mt-2">
                      <p className="text-gray-500">Statut : {getStatusBadge(appointment.status)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-end">
                    {/* <div className="hidden md:block">
                      {getStatusBadge(appointment.status)}
                    </div> */}
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openAppointmentDetails(appointment)}
                        className="flex items-center border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-500 hover:text-white"
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
                            onClick={() => handleAppointmentStatus(appointment.id, "CANCELED")}
                            className="flex items-center justify-center border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white"
                          >
                            <XCircle className="mr-2" size={18} /> Refuser
                          </button>
                        </>
                      ) : appointment.status === "CONFIRMED" ? (
                        <button 
                          onClick={() => handleAppointmentStatus(appointment.id, "COMPLETED")}
                          className="flex items-center justify-center border border-purple-500 text-purple-500 px-4 py-2 rounded-md hover:bg-purple-500 hover:text-white"
                        >
                          <CheckCircle className="mr-2" size={18} /> Marquer comme terminé
                        </button>
                      ) : appointment.status === "COMPLETED" && (
                        <button 
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setIsMedicalRecordModalOpen(true);
                          }}
                          className="flex items-center justify-center border border-black-500 text-black-500 px-4 py-2 rounded-md hover:bg-gray-500 hover:text-white"
                        >
                          <Stethoscope className="mr-2" size={18} /> Faire un diagnostic
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center mt-6">Aucun rendez-vous trouvé.</p>
            )}
          </div>

          {/* Pagination */}
          {filteredAppointments.length > itemsPerPage && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border disabled:opacity-50"
                >
                  Précédent
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-md border ${currentPage === number ? 'bg-blue-500 text-white' : ''}`}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border disabled:opacity-50"
                >
                  Suivant
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Modal de détails */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
            <DialogDescription>
              {selectedAppointment?.patientName} - {selectedAppointment && 
                new Date(selectedAppointment.scheduledAt).toLocaleDateString('fr-FR')
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">Informations patient</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{selectedAppointment.patientName}</p>
                      <p className="text-sm text-gray-500">{selectedAppointment.age} ans • {selectedAppointment.bloodType}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedAppointment.patientEmail}</p>
                    <p className="text-sm"><span className="font-medium">Téléphone:</span> {selectedAppointment.patientPhone}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Détails du rendez-vous</h4>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-500" />
                    <span>
                      {new Date(selectedAppointment.scheduledAt).toLocaleString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-gray-500" />
                    <span>{selectedAppointment.hospitalName}</span>
                  </div>
                  <div className="mt-2">
                    <p className="font-medium">Motif:</p>
                    <p>{selectedAppointment.reason}</p>
                  </div>
                  <div className="mt-2">
                    <p className="font-medium">Statut:</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedAppointment.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Notes</h4>
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedAppointment.notes || "Aucune note"}
                  </p>
                </div>
              </div>

              {selectedAppointment.medicalRecord && (
                <div>
                  <h4 className="font-semibold">Compte-rendu médical</h4>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md space-y-2">
                    <div>
                      <p className="font-medium">Diagnostic:</p>
                      <p>{selectedAppointment.medicalRecord.diagnosis}</p>
                    </div>
                    {selectedAppointment.medicalRecord.treatment && (
                      <div>
                        <p className="font-medium">Traitement:</p>
                        <p>{selectedAppointment.medicalRecord.treatment}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                {selectedAppointment.status === "PENDING" && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => handleAppointmentStatus(selectedAppointment.id, "CANCELED")}
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

                {selectedAppointment.status === "CONFIRMED" && (
                  <Button 
                    onClick={() => handleAppointmentStatus(selectedAppointment.id, "COMPLETED")}
                  >
                    <CheckCircle className="mr-2" size={18} /> Marquer comme terminé
                  </Button>
                )}

                {selectedAppointment.status === "COMPLETED" && !selectedAppointment.medicalRecord && (
                  <Button 
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsMedicalRecordModalOpen(true);
                    }}
                  >
                    <Stethoscope className="mr-2" size={18} /> Faire un diagnostic
                  </Button>
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

      {/* Modal pour le dossier médical */}
      {selectedAppointment && (
        <MedicalRecordModal
          appointment={selectedAppointment}
          onSuccess={() => {
            // Rafraîchir les données si nécessaire
            const fetchAppointments = async () => {
              try {
                const response = await fetch("/api/hospital_doctor/patient");
                if (response.ok) {
                  const data = await response.json();
                  setAppointments(data);
                }
              } catch (error) {
                console.error("Erreur lors du rafraîchissement:", error);
              }
            };
            fetchAppointments();
          }}
          open={isMedicalRecordModalOpen}
          onOpenChange={setIsMedicalRecordModalOpen}
        />
      )}
    </div>
  );
};

export default DoctorAppointments;