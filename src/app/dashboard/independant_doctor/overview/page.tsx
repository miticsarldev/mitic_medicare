'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ClipboardList, CheckCircle, XCircle, Clock, Calendar, Star, Activity, Stethoscope, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { DashboardData } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import DoctorDashboard from "./grapheZone";

// Types pour les données du cache
type CachedData = DashboardData & {
  timestamp: number;
};

// Cache simple pour éviter les rechargements inutiles
const dataCache: Record<string, CachedData> = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Type pour les props du composant StatCard
type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
  trendPositive: boolean;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
};

// Type pour les rendez-vous en attente
type PendingAppointment = {
  id: string;
  patient: string;
  date: string;
  time: string;
};

// Type pour les avis des patients
type Review = {
  id: string;
  patient: string;
  rating: number;
  comment: string;
  createdAt: string;
};

// Type pour les disponibilités
type Availability = {
  id: string;
  dayName: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Couleurs personnalisées pour les graphiques

  const fetchData = useCallback(async (filterKey: string, endpoint: string, filter?: string): Promise<DashboardData> => {
    const cacheKey = `${endpoint}-${filter || 'default'}`;

    // Vérifier le cache
    if (dataCache[cacheKey] && Date.now() - dataCache[cacheKey].timestamp < CACHE_EXPIRY) {
      return dataCache[cacheKey];
    }

    const url = filter ? `${endpoint}?filter=${filter}` : endpoint;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch data');

    const result = await res.json();
    dataCache[cacheKey] = { ...result, timestamp: Date.now() };
    return result;
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!session) return;

    setLoading(true);
    try {
      const baseUrl = `/api/independant_doctor/overview`;

      const [overviewData] = await Promise.all([
        fetchData('overview', baseUrl),
      ]);

      setData(overviewData);
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    } finally {
      setLoading(false);
    }
  }, [session, fetchData]);

  // Chargement initial
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleAppointmentStatusUpdate = async (appointmentId: string, status: "CONFIRMED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/independant_doctor/overview/${appointmentId}`, {
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
          pendingAppointments: prev!.pendingAppointments - 1,
          confirmedAppointments: status === "CONFIRMED"
            ? prev!.confirmedAppointments + 1
            : prev!.confirmedAppointments,
          pendingAppointmentsList: prev!.pendingAppointmentsList!.filter(
            (appointment: PendingAppointment) => appointment.id !== appointmentId
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

  if (loading && !data) return <LoadingSkeleton />;
  if (!data) return <p className="p-6 text-center">Aucune donnée disponible pour le moment.</p>;

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord administratif</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aperçu des statistiques et activités de l&apos;hôpital
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Rendez-vous du jour"
          value={data.patientsToday}
          icon={<Users className="h-5 w-5" />}
          trend="+20% vs période précédente"
          trendPositive
          color="blue"
        />

        <StatCard
          title="Rendez-vous confirmés"
          value={data.confirmedAppointments}
          icon={<CheckCircle className="h-5 w-5" />}
          trend="-5% vs période précédente"
          trendPositive={false}
          color="green"
        />

        <StatCard
          title="Consultations en attente"
          value={data.pendingAppointments}
          icon={<ClipboardList className="h-5 w-5" />}
          trend="+10% vs période précédente"
          trendPositive
          color="orange"
        />
      </div>

      <DoctorDashboard  />

      {/* Rendez-vous par jour */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Rendez-vous par jour</CardTitle>
          <CardDescription>Répartition quotidienne des consultations</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.dailyAppointments}>
              <XAxis
                dataKey="day"
                stroke="#888"
                tickFormatter={(day: string) => format(new Date(day), "EEE", { locale: fr })}
              />
              <YAxis stroke="#888" />
              <Tooltip
                formatter={(value: number) => [`${value} rendez-vous`, "Nombre"]}
                labelFormatter={(day: string) => format(new Date(day), "EEEE d MMMM", { locale: fr })}
                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px' }}
              />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                animationDuration={2000}
              >
                {data.dailyAppointments.map((entry: { day: string; count: number }, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card> */}

      {/* Rendez-vous en attente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <span>Rendez-vous en attente</span>
          </CardTitle>
          <CardDescription>Demandes nécessitant votre confirmation</CardDescription>
        </CardHeader>
        <CardContent>
          {data.pendingAppointmentsList?.length > 0 ? (
            <div className="space-y-3">
              {data.pendingAppointmentsList.map((appointment: PendingAppointment) => (
                <div key={appointment.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <Stethoscope className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {appointment.patient}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(appointment.date), "EEEE d MMMM yyyy", { locale: fr })} à {appointment.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAppointmentStatusUpdate(appointment.id, "CONFIRMED")}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" /> Confirmer
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleAppointmentStatusUpdate(appointment.id, "REJECTED")}
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-4 w-4" /> Refuser
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <UserCheck className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Aucun rendez-vous en attente
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Toutes les demandes ont été traitées
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section inférieure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avis des patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Avis des patients</span>
            </CardTitle>
            <CardDescription>Retours sur les consultations</CardDescription>
          </CardHeader>
          <CardContent>
            {data.reviews?.length > 0 ? (
              <div className="space-y-4">
                {data.reviews.map((review: Review) => (
                  <div key={review.id} className="border p-4 rounded-lg dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {review.patient}
                        </p>
                        <div className="flex items-center mt-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(review.createdAt), "dd/MM/yyyy", { locale: fr })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <Star className="mx-auto h-10 w-10 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Aucun avis pour le moment
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Les patients n&apos;ont pas encore laissé de commentaires
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disponibilités */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span>Disponibilités à venir</span>
            </CardTitle>
            <CardDescription>Vos prochaines plages horaires disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            {data.upcomingAvailabilities?.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingAvailabilities.map((availability: Availability) => (
                  <div key={availability.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${availability.isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <Activity className={`h-4 w-4 ${availability.isActive ? 'text-green-500' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {availability.dayName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {availability.startTime} - {availability.endTime}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${availability.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                      {availability.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <Calendar className="mx-auto h-10 w-10 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Aucune disponibilité programmée
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ajoutez des créneaux pour recevoir des patients
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Composant de carte de statistique réutilisable
function StatCard({ title, value, icon, trend, trendPositive, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <p className={`text-xs ${trendPositive ? 'text-green-500' : 'text-red-500'}`}>
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}

// Squelette de chargement
function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px] mb-1" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[250px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[250px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-full" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg mb-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}