'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Bed, Activity, FileText, Calendar as CalendarIcon, Download } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function HospitalReportPage() {
  const { theme } = useTheme(); 

  const hospital = {
    totalPatients: 1200,
    totalBeds: 500,
    bedOccupancyRate: 85, 
    totalDoctors: 50,
    totalNurses: 120,
  };


  const generatedReports = [
    { id: 1, title: "Rapport Revenus hebdomadaire", type: "Revenus", format: "Excel", date: "18/03/2025", time: "11:06" },
    { id: 2, title: "Rapport Revenus ponctuel", type: "Revenus", format: "Excel", date: "18/03/2025", time: "11:06" },
    { id: 3, title: "Rapport Utilisateurs quotidien", type: "Utilisateurs", format: "Excel", date: "16/03/2025", time: "11:06" },
  ];


  const scheduledReports = [
    { id: 1, title: "Rapport Abonnements annuel", frequency: "Annuel", status: "Planifié", date: "22/03/2025", time: "11:06" },
    { id: 2, title: "Rapport Rendez-vous mensuel", frequency: "Mensuel", status: "En cours", date: "25/03/2025", time: "11:06" },
    { id: 3, title: "Rapport Satisfaction mensuel", frequency: "Mensuel", status: "En cours", date: "26/03/2025", time: "11:06" },
  ];


  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const cardBgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-700";
  const secondaryTextColor = theme === "dark" ? "text-gray-300" : "text-gray-500";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  return (
    <div className={`p-6 space-y-6 min-h-screen ${bgColor}`}>
      <div className="text-center">
        <h1 className={`text-3xl font-bold ${textColor}`}>Rapport de l&apos;Hôpital</h1>
        <p className={`text-sm ${secondaryTextColor} mt-2`}>
          Consultez les données clés et les performances de l&apos;hôpital.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${cardBgColor} shadow-sm`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={`text-lg font-semibold ${textColor}`}>Patients</CardTitle>
            <Users className="w-6 h-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${textColor}`}>{hospital.totalPatients}</p>
            <p className={`text-sm ${secondaryTextColor}`}>Total des patients</p>
          </CardContent>
        </Card>
        <Card className={`${cardBgColor} shadow-sm`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={`text-lg font-semibold ${textColor}`}>Lits</CardTitle>
            <Bed className="w-6 h-6 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${textColor}`}>{hospital.totalBeds}</p>
            <p className={`text-sm ${secondaryTextColor}`}>Lits disponibles</p>
          </CardContent>
        </Card>
        <Card className={`${cardBgColor} shadow-sm`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={`text-lg font-semibold ${textColor}`}>Taux d&apos;occupation</CardTitle>
            <Activity className="w-6 h-6 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${textColor}`}>{hospital.bedOccupancyRate}%</p>
            <p className={`text-sm ${secondaryTextColor}`}>Lits occupés</p>
          </CardContent>
        </Card>
        <Card className={`${cardBgColor} shadow-sm`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={`text-lg font-semibold ${textColor}`}>Personnel</CardTitle>
            <Users className="w-6 h-6 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${textColor}`}>{hospital.totalDoctors} médecins</p>
            <p className={`text-sm ${secondaryTextColor}`}>{hospital.totalNurses} infirmiers</p>
          </CardContent>
        </Card>
      </div>

      {/*Rapports générés */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <FileText className="w-6 h-6 text-blue-500" />
            Rapports générés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {generatedReports.map((report) => (
              <li key={report.id} className={`p-3 border ${borderColor} rounded-md flex items-center justify-between`}>
                <div>
                  <p className={`text-sm font-medium ${textColor}`}>{report.title}</p>
                  <p className={`text-xs ${secondaryTextColor}`}>{report.type} • {report.format}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-xs ${secondaryTextColor}`}>
                    {report.date} {report.time}
                  </div>
                  <Button
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => alert(`Télécharger : ${report.title}`)}
                  >
                    <Download className="w-4 h-4" /> Télécharger
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/*Rapports planifiés */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <CalendarIcon className="w-6 h-6 text-green-500" />
            Rapports planifiés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {scheduledReports.map((report) => (
              <li key={report.id} className={`p-3 border ${borderColor} rounded-md flex items-center justify-between`}>
                <div>
                  <p className={`text-sm font-medium ${textColor}`}>{report.title}</p>
                  <p className={`text-xs ${secondaryTextColor}`}>{report.frequency} • {report.status}</p>
                </div>
                <div className={`text-xs ${secondaryTextColor}`}>
                  {report.date} {report.time}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Liste des rapports */}
      <Card className={`${cardBgColor} shadow-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${textColor}`}>
            <FileText className="w-6 h-6 text-purple-500" />
            Liste des rapports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[...generatedReports, ...scheduledReports].map((report) => (
              <li key={report.id} className={`p-3 border ${borderColor} rounded-md flex items-center justify-between`}>
                <div>
                  <p className={`text-sm font-medium ${textColor}`}>{report.title}</p>
                  <p className={`text-xs ${secondaryTextColor}`}>
                    {"type" in report ? `${report.type} • ${report.format}` : `${report.frequency} • ${report.status}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-xs ${secondaryTextColor}`}>
                    {report.date} {report.time}
                  </div>
                  <Button
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => alert(`Télécharger : ${report.title}`)}
                  >
                    <Download className="w-4 h-4" /> Télécharger
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}