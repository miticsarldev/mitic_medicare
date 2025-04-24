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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoctorType } from "@/types/doctor";

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

  if (!doctor) return <div className="p-4 text-center">Chargement...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Photo + nom */}
      <Card className="w-full shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-center gap-4">
          <img
            src={doctor.avatarUrl || "/avatar-placeholder.png"}
            alt={doctor.name}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="text-center sm:text-left">
            <CardTitle className="text-2xl font-semibold">Dr. {doctor.name}</CardTitle>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start items-center mt-2 text-sm text-muted-foreground">
              <Stethoscope className="w-4 h-4" /> {doctor.specialization}
              {doctor.isVerified && <BadgeCheck className="w-4 h-4 text-green-500 ml-2" />}
              {doctor.isIndependent && (
                <Badge variant="secondary" className="ml-2">
                  Médecin indépendant
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

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
