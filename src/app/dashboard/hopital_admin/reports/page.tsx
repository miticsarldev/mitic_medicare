'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Bed, Activity, FileText, Calendar as CalendarIcon, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from 'axios';

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <Card className="shadow-sm bg-white dark:bg-gray-800">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-100">{title}</CardTitle>
      <Icon className={`w-6 h-6 ${color}`} />
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold text-gray-700 dark:text-gray-100">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-300">{description}</p>
    </CardContent>
  </Card>
);

const ReportItem = ({ title, details, date, showDownload, onDownload }) => (
  <li className="p-3 border border-gray-200 dark:border-gray-700 rounded-md flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-100">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-300">{details}</p>
    </div>
    <div className="flex items-center gap-2">
      <div className="text-xs text-gray-500 dark:text-gray-300">{date}</div>
      {showDownload && (
        <Button size="sm" className="flex items-center gap-1" onClick={onDownload}>
          <Download className="w-4 h-4" /> Télécharger
        </Button>
      )}
    </div>
  </li>
);

const ReportList = ({ title, icon: Icon, reports, showDownload = false }) => (
  <Card className="shadow-sm bg-white dark:bg-gray-800">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-100">
        <Icon className="w-6 h-6 text-blue-500" /> {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3">
        {reports.map((report) => (
          <ReportItem
            key={report.id}
            title={report.title}
            details={"type" in report ? `${report.type} • ${report.format}` : `${report.frequency} • ${report.status}`}
            date={`${report.date} ${report.time}`}
            showDownload={showDownload}
            onDownload={() => alert(`Télécharger : ${report.title}`)}
          />
        ))}
      </ul>
    </CardContent>
  </Card>
);

export default function HospitalReportPage() {
  const { data: session, status } = useSession();
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session || !session.user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3000/dashboard/hopital_admin/api/${session.user.id}`);
        setTotalPatients(response.data.totalPatients);
      } catch (err) {
        setError("Erreur lors de la récupération des patients" + err);
      } finally {
        setLoading(false);
      }
    };


    fetchData();
  }, [session]);

  if (status === "loading" || loading) {
    return <p>Chargement des patients...</p>;
  }

  if (error && error !== "") {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  const hospital = {
    // totalPatients: 1200,
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

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-100">Rapport de l&apos;Hôpital</h1>
        <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
          Consultez les données clés et les performances de l&apos;hôpital.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Patients" value={totalPatients} icon={Users} color="text-blue-500" description="Total des patients" />
        <StatCard title="Lits" value={hospital.totalBeds} icon={Bed} color="text-green-500" description="Lits disponibles" />
        <StatCard title="Taux d'occupation" value={`${hospital.bedOccupancyRate}%`} icon={Activity} color="text-purple-500" description="Lits occupés" />
        <StatCard title="Personnel" value={`${hospital.totalDoctors} médecins`} icon={Users} color="text-orange-500" description={`${hospital.totalNurses} infirmiers`} />
      </div>

      <ReportList title="Rapports générés" icon={FileText} reports={generatedReports} showDownload={true} />
      <ReportList title="Rapports planifiés" icon={CalendarIcon} reports={scheduledReports} />
    </div>
  );
}
