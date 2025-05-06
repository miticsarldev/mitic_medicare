'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,  ResponsiveContainer } from "recharts";
import { Calendar as CalendarIcon, Users, ClipboardList, CheckCircle, XCircle, Clock, Calendar, Pill, Activity, Star } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { patientData } from "@/constant";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DashboardData } from "./types";

export default function Dashboard() {
  const filterOptions = ['jour', 'semaine', 'mois', 'année'];
  const [appointmentFilter, setAppointmentFilter] = useState("semaine");
  const [typeFilter, setTypeFilter] = useState("mois");
  const [cancellationFilter] = useState("mois");
  const [patientStats, setPatientStats] = useState<PatientStat[]>([]);
  const [appointmentTypeStats, setAppointmentTypeStats] = useState([]);
  const { data: session } = useSession(); 
  const [data, setData] = useState <DashboardData | null>(null);
  console.log(data);
  const [loading, setLoading] = useState(true);

  type PatientStat = {
    name: string;
    patients: number;
  };

  useEffect(() => {
    if (!session) return;
  
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const baseUrl = `/api/hospital_doctor/overview`;
  
        const [overviewRes, patientRes, typeRes, cancelRes] = await Promise.all([
          fetch(baseUrl),
          fetch(`${baseUrl}?filter=${appointmentFilter}`),
          fetch(`${baseUrl}?filter=${typeFilter}`),
          fetch(`${baseUrl}?filter=${cancellationFilter}`),
        ]);
  
        const [overviewData, patientData, typeData] = await Promise.all([
          overviewRes.json(),
          patientRes.json(),
          typeRes.json(),
          cancelRes.json(),
        ]);
  
        if (overviewRes.ok) setData(overviewData);
        if (patientRes.ok) setPatientStats([{ name: appointmentFilter, patients: patientData.patientsSeen }]);
        if (typeRes.ok) setAppointmentTypeStats(typeData.appointmentTypeStats || []);
        
  
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAllData();
  }, [session, appointmentFilter, typeFilter, cancellationFilter]);

  const handleAppointmentStatusUpdate = async (appointmentId: string, status: "CONFIRMED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/hospital_doctor/overview/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const updatedData = await res.json();

      if (res.ok) {
        setData(prev => ({
          ...prev!,
          pendingAppointmentsList: prev!.pendingAppointmentsList!.filter(
            (appointment) => appointment.id !== appointmentId
          ),
        }));
        alert(updatedData.message || `Rendez-vous ${status.toLowerCase()} avec succès.`);
      } else {
        alert(updatedData.error || "Erreur lors de la mise à jour du statut du rendez-vous.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut du rendez-vous:", error);
      alert("Une erreur est survenue lors de la mise à jour du statut.");
    }
  };

  

  if (!session) return <p>Veuillez vous connecter</p>;
  if (loading) return <p>Chargement...</p>;
  if (!data) return <p>Aucune donnée disponible.</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-500 rounded-full">
              <Users className="text-white" />
            </div>
            <span className="text-gray-900 dark:text-gray-100">Patients du jour</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {data.patientsToday}
          <span className="text-sm text-green-500 ml-2">+20% vs période précédente</span>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-green-500 rounded-full">
              <CalendarIcon className="text-white" />
            </div>
            <span className="text-gray-900 dark:text-gray-100">Rendez-vous confirmés</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {data.confirmedAppointments}
          <span className="text-sm text-red-500 ml-2">-5% vs période précédente</span>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-red-500 rounded-full">
              <ClipboardList className="text-white" />
            </div>
            <span className="text-gray-900 dark:text-gray-100">Consultations en attente</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {data.pendingAppointments}
          <span className="text-sm text-green-500 ml-2">+10% vs période précédente</span>
        </CardContent>
      </Card>

       {/* Évolution des patients cette semaine */}
       <Card className="md:col-span-2 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Évolution des patients cette semaine</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.weeklyPatients}>
              <XAxis
                dataKey="date"
                stroke="#888"
                tickFormatter={(date) => format(new Date(date), "EEE", { locale: fr })}
              />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

       {/*Rendez-vous par jour  */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Rendez-vous par jour</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.dailyAppointments}>
              <XAxis 
                dataKey="day" 
                stroke="#888" 
                tickFormatter={(day) => format(new Date(day), "EEE", { locale: fr })}
              />
              <YAxis stroke="#888" />
              <Tooltip 
                formatter={(value) => [`${value} rendez-vous`, "Nombre"]}
                labelFormatter={(day) => format(new Date(day), "EEEE d MMMM", { locale: fr })}
              />
              <Bar 
                dataKey="count" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


      <Card className="md:col-span-3 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-yellow-500 rounded-full">
              <Clock className="text-white" />
            </div>
            <span className="text-gray-900 dark:text-gray-100">Rendez-vous en attente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.pendingAppointmentsList?.length > 0 ? (
            <ul className="space-y-2">
              {data.pendingAppointmentsList.map((appointment) => (
                <li key={appointment.id} className="flex justify-between items-center p-3 border rounded-md dark:border-gray-700">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {appointment.patient}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {appointment.date} à {appointment.time}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAppointmentStatusUpdate(appointment.id, "CONFIRMED")}
                      className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                      <CheckCircle size={16} /> Accepter
                    </button>
                    <button
                      onClick={() => handleAppointmentStatusUpdate(appointment.id, "REJECTED")}
                      className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                      <XCircle size={16} /> Refuser
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                Aucun rendez-vous en attente
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Vous n&apos;avez actuellement aucun rendez-vous à confirmer.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
 

      <div className="md:col-span-3 grid grid-cols-2 gap-6">
      {/* Section Prescriptions récentes */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-blue-500" />
            <span className="text-gray-900 dark:text-gray-100">Prescriptions récentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentPrescriptions?.length > 0 ? (
            <div className="space-y-4">
              {data.recentPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border rounded-md p-4 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {prescription.medicationName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Pour: {prescription.patient}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {prescription.dosage} - {prescription.frequency}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(prescription.createdAt), "d MMM", { locale: fr })}
                    </span>
                  </div>
                  {prescription.instructions && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {prescription.instructions}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Aucune prescription récente</p>
          )}
        </CardContent>
      </Card>

      {/* Section Disponibilités à venir */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-purple-500" />
            <span className="text-gray-900 dark:text-gray-100">Mes disponibilités</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.upcomingAvailabilities?.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingAvailabilities.map((availability) => (
                <div key={availability.id} className="flex items-center justify-between p-3 border rounded-md dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {availability.dayName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {availability.startTime} - {availability.endTime}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    availability.isActive 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}>
                    {availability.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Aucune disponibilité programmée
            </p>
          )}
        </CardContent>
      </Card>


<div className="md:col-span-3 grid grid-cols-2 gap-6 mt-6">
        {/* Patients vus */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md md:col-span-1">
          <div className="flex justify-between mb-2">
            <h2 className="font-bold text-gray-700 dark:text-gray-100">Patients vus</h2>
            <select
              value={appointmentFilter}
              onChange={(e) => setAppointmentFilter(e.target.value)}
              className="p-1 border rounded-md dark:bg-gray-700 dark:text-gray-100"
            >
              {filterOptions.map(f => (
                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={patientStats}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="patients" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Types de rendez-vous */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md md:col-span-1">
          <div className="flex justify-between mb-2">
            <h2 className="font-bold text-gray-700 dark:text-gray-100">Types de rendez-vous</h2>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-1 border rounded-md dark:bg-gray-700 dark:text-gray-100"
            >
              {filterOptions.map(f => (
                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={appointmentTypeStats} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70} label>
                {appointmentTypeStats.map((entry, index) => (
                  <Cell key={`cell-type-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      </div>
    </div>
  );
}