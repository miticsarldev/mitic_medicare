'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Loader2, CalendarCheck } from 'lucide-react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type TimeRange = 'daily' | 'weekly' | 'monthly'
type Period = 'current' | 'past'

interface AvailabilityData {
  day: string
  available: number
  booked: number
  total: number
}

interface AppointmentData {
  period: string
  appointments: number
}

type ApiError = string | null

export default function DoctorDashboard() {
  // State for availability chart
  const [availabilityRange, setAvailabilityRange] = useState<TimeRange>('weekly')
  const [availabilityPeriod, setAvailabilityPeriod] = useState<Period>('current')
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[] | null>(null)
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<ApiError>(null)

  // State for appointments chart
  const [appointmentsRange, setAppointmentsRange] = useState<TimeRange>('weekly')
  const [appointmentsPeriod, setAppointmentsPeriod] = useState<Period>('current')
  const [appointmentsData, setAppointmentsData] = useState<AppointmentData[] | null>(null)
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false)
  const [appointmentsError, setAppointmentsError] = useState<ApiError>(null)

  // Fetch availability data
  useEffect(() => {
    const fetchAvailabilityData = async () => {
      try {
        setIsLoadingAvailability(true)
        setAvailabilityError(null)
        
        const params = new URLSearchParams({
          type: 'availability',
          range: availabilityRange,
          period: availabilityPeriod,
        })
        const res = await fetch(`/api/hospital_doctor/dashboard?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch availability data')
        const data = await res.json()
        setAvailabilityData(data)
      } catch (err) {
        setAvailabilityError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoadingAvailability(false)
      }
    }

    fetchAvailabilityData()
  }, [availabilityRange, availabilityPeriod])

  // Fetch appointments data
  useEffect(() => {
    const fetchAppointmentsData = async () => {
      try {
        setIsLoadingAppointments(true)
        setAppointmentsError(null)
        
        const params = new URLSearchParams({
          type: 'appointments',
          range: appointmentsRange,
          period: appointmentsPeriod,
        })
        const res = await fetch(`/api/hospital_doctor/dashboard?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch appointments data')
        const data = await res.json()
        setAppointmentsData(data)
      } catch (err) {
        setAppointmentsError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoadingAppointments(false)
      }
    }

    fetchAppointmentsData()
  }, [appointmentsRange, appointmentsPeriod])

  // Calculate totals
  const totalAvailableSlots = availabilityData?.reduce((sum, item) => sum + item.available, 0) || 0
  const totalBookedSlots = availabilityData?.reduce((sum, item) => sum + item.booked, 0) || 0
  const totalAppointments = appointmentsData?.reduce((sum, item) => sum + item.appointments, 0) || 0

  return (
    <div className="space-y-6">

      {/* Availability Section */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gestion des disponibilités
          </h2>
          
          <div className="flex gap-3">
            <Select
              value={availabilityRange}
              onValueChange={(value: TimeRange) => setAvailabilityRange(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Journalier</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuel</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={availabilityPeriod}
              onValueChange={(value: Period) => setAvailabilityPeriod(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Intervalle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">En cours</SelectItem>
                <SelectItem value="past">Historique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Disponibilités vs Réservations
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {availabilityPeriod === 'current' ? 'Période en cours' : '6 derniers mois'}
            </span>
          </CardHeader>
          <CardContent>
            {isLoadingAvailability ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : availabilityError ? (
              <div className="h-[300px] flex flex-col items-center justify-center gap-2 text-red-500">
                <p>{availabilityError}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setAvailabilityError(null)
                    setAvailabilityRange('weekly')
                    setAvailabilityPeriod('current')
                  }}
                >
                  Réessayer
                </Button>
              </div>
            ) : availabilityData && availabilityData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={availabilityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-background p-4 border rounded-lg shadow-sm">
                              <p className="font-medium">{data.day}</p>
                              <p className="text-sm">
                                Disponible: <span className="text-green-500">{data.available}</span>
                              </p>
                              <p className="text-sm">
                                Réservé: <span className="text-blue-500">{data.booked}</span>
                              </p>
                              <p className="text-sm">
                                Total: <span className="text-muted-foreground">{data.total}</span>
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="available"
                      name="Disponible"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="booked"
                      name="Réservé"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <p>Aucune donnée de disponibilité disponible</p>
                <Button variant="outline" size="sm">
                  Configurer les disponibilités
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Appointments Section */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Suivi des consultations
          </h2>
          
          <div className="flex gap-3">
            <Select
              value={appointmentsRange}
              onValueChange={(value: TimeRange) => setAppointmentsRange(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Journalier</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuel</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={appointmentsPeriod}
              onValueChange={(value: Period) => setAppointmentsPeriod(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Intervalle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">En cours</SelectItem>
                <SelectItem value="past">Historique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nombre de consultations
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {appointmentsPeriod === 'current' ? 'Période en cours' : '6 derniers mois'}
            </span>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : appointmentsError ? (
              <div className="h-[300px] flex flex-col items-center justify-center gap-2 text-red-500">
                <p>{appointmentsError}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setAppointmentsError(null)
                    setAppointmentsRange('weekly')
                    setAppointmentsPeriod('current')
                  }}
                >
                  Réessayer
                </Button>
              </div>
            ) : appointmentsData && appointmentsData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={appointmentsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-background p-4 border rounded-lg shadow-sm">
                              <p className="font-medium">{data.period}</p>
                              <p className="text-sm">
                                Consultations: <span className="text-primary">{data.appointments}</span>
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar
                      dataKey="appointments"
                      name="Consultations"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <p>Aucune donnée de consultation disponible</p>
                <Button variant="outline" size="sm">
                  Voir mon agenda
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Quick Stats */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Statistiques rapides</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Créneaux disponibles
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAvailability ? (
                <Skeleton className="h-8 w-[100px]" />
              ) : (
                <div className="text-2xl font-bold">{totalAvailableSlots}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rendez-vous réservés
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAvailability ? (
                <Skeleton className="h-8 w-[100px]" />
              ) : (
                <div className="text-2xl font-bold">{totalBookedSlots}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Consultations ({appointmentsRange})
              </CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <Skeleton className="h-8 w-[100px]" />
              ) : (
                <div className="text-2xl font-bold">{totalAppointments}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}