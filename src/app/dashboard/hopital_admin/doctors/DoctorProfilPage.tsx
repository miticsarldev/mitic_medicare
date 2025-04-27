'use client';
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  User2,
  Clock,
  Stethoscope,
  BadgeCheck,
  Users2,
  Info,
  Mail,
  Phone,
  MapPin,
  Star,
  Notebook,
  Timer,
  CheckCircle2,
  Building2,
  Award,
  Briefcase,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoctorType } from "@/types/doctor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DoctorProfilePage({ doctor }: { doctor: DoctorType }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const renderSchedule = () => {
    if (!doctor?.schedule) return null;

    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
    const todaySlots = doctor.schedule.find((s) => s.day === dayName)?.slots;

    if (!Array.isArray(todaySlots)) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
        {todaySlots.map((slot, index) => (
          <Button key={index} variant="outline" className="text-sm">
            {slot}
          </Button>
        ))}
      </div>
    );
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (!doctor) return <div className="p-4 text-center">Chargement...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* header zone*/}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-2 sm:p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-28 w-28 md:h-40 md:w-40 border-4 border-white dark:border-gray-800 shadow-lg">
              <AvatarImage
                src={
                  doctor.avatarUrl ||
                  "/placeholder.svg?height=160&width=160"
                }
                alt={doctor.name}
              />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {getInitials(doctor.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.floor(doctor.averageRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : i < Math.ceil(doctor.averageRating)
                      ? "text-yellow-400 fill-yellow-400 opacity-50"
                      : "text-gray-300 dark:text-gray-600"
                    }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">
                {doctor.averageRating.toFixed(1)} ({doctor.reviewsCount || 0}{" "}
                avis)
              </span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
                  {doctor.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                  <Badge variant="secondary" className="text-primary">
                    {doctor.specialization}
                  </Badge>
                  {doctor.isVerified && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Vérifié
                    </Badge>
                  )}
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {doctor.department?.name || ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {doctor.experience} 
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pratique médicale
                  </p>
                </div>
              </div>

              {doctor.isIndependent && (
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat("fr-ML", {
                        style: "currency",
                        currency: "XOF",
                        minimumFractionDigits: 0,
                      }).format(doctor.consultationFee?.toNumber() || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tarif consultation
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Tabs */}
        <div className="md:col-span-2 space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="about" className="flex items-center gap-2 justify-center">
                    <User2 className="w-4 h-4" /> À propos
                  </TabsTrigger>
                  <TabsTrigger value="appointments" className="flex items-center gap-2 justify-center">
                    <Users2 className="w-4 h-4" /> Rendez-vous
                  </TabsTrigger>
                  <TabsTrigger value="info" className="flex items-center gap-2 justify-center">
                    <Info className="w-4 h-4" /> Infos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="about">
                  <CardContent className="space-y-6 pt-5 text-sm text-muted-foreground">
                    <div>
                      <h4 className="font-semibold text-base mb-1">Présentation</h4>
                      <p>{doctor.bio || "Aucune biographie disponible."}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-base mb-1">Département</h4>
                      <Badge variant="secondary">{doctor.department?.name}</Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold text-base mb-1">Formation</h4>
                      <ul className="list-disc ml-5">
                        {doctor.education?.split("\n").map((edu, idx) => (
                          <li key={idx}>{edu}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {doctor.experience} ans d'expérience
                      </div>
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4 text-green-500" />
                        {doctor.consultationFee ? `${doctor.consultationFee} FCFA` : "Tarif non défini"}
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="appointments">
                  <CardContent>
                    {doctor.appointments?.length ? (
                      <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 pt-5">
                        {doctor.appointments.map((appt) => (
                          <Card key={appt.id} className="bg-muted/50 border p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{appt.patient.user.name}</div>
                                <div className="text-xs text-muted-foreground">{appt.patient.user.email}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {new Date(appt.scheduledAt).toLocaleDateString()} - {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Motif : {appt.reason || "Aucun motif fourni."}
                                </div>
                              </div>
                              <Badge variant="secondary">{appt.status}</Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center">
                        Aucun rendez-vous trouvé.
                      </div>
                    )}
                  </CardContent>
                </TabsContent>

                <TabsContent value="info">
                  <CardContent className="text-sm text-muted-foreground space-y-3 pt-5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {doctor.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {doctor.phone}
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>
                        {doctor.address || 'Non renseignée'},<br />
                        {doctor.city}, {doctor.state}, {doctor.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4" /> Licence : {doctor.licenseNumber}
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" /> Note moyenne : {doctor.averageRating.toFixed(1)} ({doctor.reviewsCount} avis)
                    </div>
                    <div className="flex items-center gap-2">
                      <Notebook className="w-4 h-4" /> Disponible pour le chat : {doctor.availableForChat ? 'Oui' : 'Non'}
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>


        {/* Calendrier */}
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="w-5 h-5" /> Prendre rendez-vous
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => {
                  if (day) setSelectedDate(day);
                }}
                className="rounded-md border"
              />

              <h4 className="mt-4 text-sm font-semibold">Horaires disponibles</h4>
              {renderSchedule()}
              <Button className="mt-4 w-full" disabled>
                Confirmer le rendez-vous
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
