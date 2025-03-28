'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, ResponsiveContainer } from "recharts";
import { Calendar as CalendarIcon, Users, ClipboardList, CheckCircle, XCircle, Clock, Calendar, Pill, Activity, Star } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { patientData, patientReviews, pendingAppointments, revenueData } from "@/constant";

const data = [
  { name: "Lun", patients: 20 },
  { name: "Mar", patients: 35 },
  { name: "Mer", patients: 25 },
  { name: "Jeu", patients: 40 },
  { name: "Ven", patients: 50 },
  { name: "Sam", patients: 30 },
  { name: "Dim", patients: 10 },
];

export default function Dashboard() {
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
          45
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
          12
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
          5
          <span className="text-sm text-green-500 ml-2">+10% vs période précédente</span>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Évolution des patients cette semaine</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Revenus mensuels</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10b981" />
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
          <ul className="space-y-2">
            {pendingAppointments.map((appointment) => (
              <li key={appointment.id} className="flex justify-between items-center p-3 border rounded-md dark:border-gray-700">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{appointment.patient}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{appointment.date} à {appointment.time}</span>
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1">
                    <CheckCircle size={16} /> Accepter
                  </button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-1">
                    <XCircle size={16} /> Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="md:col-span-3 grid grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {patientData.recentActivity.map((activity, index) => (
                <div key={index} className="flex">
                  <div className="relative mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted dark:bg-gray-700">
                    {activity.type === "appointment" && (
                      <Calendar className="h-6 w-6 text-gray-900 dark:text-gray-100" />
                    )}
                    {activity.type === "medication" && (
                      <Pill className="h-6 w-6 text-gray-900 dark:text-gray-100" />
                    )}
                    {activity.type === "test" && <Activity className="h-6 w-6 text-gray-900 dark:text-gray-100" />}
                    {index < patientData.recentActivity.length - 1 && (
                      <div className="absolute bottom-0 left-1/2 h-full w-px -translate-x-1/2 translate-y-full bg-muted dark:bg-gray-700" />
                    )}
                  </div>
                  <div className="flex flex-col pb-8">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.description}
                    </span>
                    <span className="text-xs text-muted-foreground dark:text-gray-400">
                      {format(activity.date, "d MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Avis patients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {patientReviews.map((review) => (
                <li key={review.id} className="border p-4 rounded-md dark:border-gray-700">
                  <div className="flex items-center mb-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{review.patient}</span>
                    <div className="flex items-center ml-2">
                      {Array.from({ length: review.rating }, (_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{review.comment}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}