import React from "react"; 
import { patientAppointments, patientStats } from "@/data/appointment-data";
import { PatientChart } from "@/components/patient-chart";

const PatientDashboard = () => {
  const recentAppointments = patientAppointments.slice(0, 6);

  return (
    <div>
      {/* Statistiques */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {patientStats.map((stat, index) => (
          <div
          key={index}
          className="aspect-video rounded-2xl bg-muted/50 p-6 flex flex-col gap-4 justify-between shadow-md"
        >
          {/* Titre & Icône */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-primary">{stat.title}</h3>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
            <div className="text-3xl text-primary">{stat.icon}</div>
          </div>
        
          {/* Valeur mise en évidence */}
          <div className="flex items-center justify-center">
            <p className="text-4xl font-bold text-center text-primary">{stat.value}</p>
          </div>
        </div>
        
        ))}
      </div>

      {/* Conteneur principal avec espacement */}
      <div className="grid gap-6">
        
        {/* Titre du graphique */}
        <div className="text-xl font-semibold">Évolution des Consultations</div>
        
        {/* Graphique dans un encadré stylisé */}
        <div className="rounded-2xl bg-muted/50 p-6 shadow-md">
          <PatientChart />
        </div>
        
      </div>

      {/* Rendez-vous récents */}
      <div className="rounded-xl bg-muted/50 p-6">
        <h2 className="text-xl font-semibold mb-4">Rendez-vous Récents</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-background rounded-lg">
            <thead>
              <tr className="text-left border-b">
                <th className="p-5">Médecin</th>
                <th className="p-4">Spécialité</th>
                <th className="p-4">Date</th>
                <th className="p-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-b">
                  <td className="p-3">{appointment.doctor}</td>
                  <td className="p-3">{appointment.specialty}</td>
                  <td className="p-3">{appointment.date}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        appointment.status === "Terminé"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "En attente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
