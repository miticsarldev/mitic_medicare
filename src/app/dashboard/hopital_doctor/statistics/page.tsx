'use client';
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const statisticsData = {
  appointments: [
    { name: "Lun", patients: 10 },
    { name: "Mar", patients: 15 },
    { name: "Mer", patients: 8 },
    { name: "Jeu", patients: 12 },
    { name: "Ven", patients: 20 },
    { name: "Sam", patients: 5 },
    { name: "Dim", patients: 7 },
  ],
  cancellations: [
    { reason: "Urgence", count: 4 },
    { reason: "Changement d'horaire", count: 6 },
    { reason: "Autres", count: 3 },
  ],
  earnings: [
    { name: "Jan", revenue: 2000 },
    { name: "Fév", revenue: 2500 },
    { name: "Mar", revenue: 1800 },
    { name: "Avr", revenue: 3000 },
    { name: "Mai", revenue: 2800 },
  ],
  patientType: [
    { type: "Homme", count: 40 },
    { type: "Femme", count: 35 },
    { type: "Enfant", count: 25 },
  ],
};

const StatisticsPage = () => {
  const [appointmentFilter, setAppointmentFilter] = useState("semaine");
  const [earningsFilter, setEarningsFilter] = useState("mois");
  const [cancellationFilter, setCancellationFilter] = useState("mois");
  const [patientTypeFilter, setPatientTypeFilter] = useState("mois");

  const filterOptions = ['jour', 'semaine', 'mois', 'année'];

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">Statistiques</h1>
      <h4 className="text-3sm font-light text-gray-800 dark:text-gray-200 mb-6">
        Visualisez et analysez les données de performance du médecin
      </h4>

      <div className="grid grid-cols-1 gap-8">
        {/* Nombre de patients */}
        <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">Patients vus</h2>
            <select
              value={appointmentFilter}
              onChange={(e) => setAppointmentFilter(e.target.value)}
              className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100"
            >
              {filterOptions.map((f) => (
                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statisticsData.appointments}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="patients" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenus générés */}
        <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">Revenus générés</h2>
            <select
              value={earningsFilter}
              onChange={(e) => setEarningsFilter(e.target.value)}
              className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100"
            >
              {filterOptions.map((f) => (
                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={statisticsData.earnings}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Taux d'annulation et Type de patient sur la même ligne */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Taux d'annulation */}
          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">Taux d&aposannulation</h2>
              <select
                value={cancellationFilter}
                onChange={(e) => setCancellationFilter(e.target.value)}
                className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100"
              >
                {filterOptions.map((f) => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statisticsData.cancellations} dataKey="count" nameKey="reason" cx="50%" cy="50%" outerRadius={80}>
                  {statisticsData.cancellations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#ef4444', '#facc15', '#6366f1'][index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Type de patient */}
          <div className="bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">Répartition par genre</h2>
              <select
                value={patientTypeFilter}
                onChange={(e) => setPatientTypeFilter(e.target.value)}
                className="p-2 border rounded-md dark:bg-gray-700 dark:text-gray-100"
              >
                {filterOptions.map((f) => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statisticsData.patientType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80}>
                  {statisticsData.patientType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b'][index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;