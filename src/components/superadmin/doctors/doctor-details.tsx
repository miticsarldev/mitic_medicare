"use client";

import { format } from "date-fns";
import { Calendar, Check, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Doctor } from "@/types/doctor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSpecializationLabel } from "@/utils/function";

interface DoctorDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
  onStatusChange: (doctorId: string, status: "active" | "inactive") => void;
  onVerificationChange: (doctorId: string, verified: boolean) => void;
}

export default function DoctorDetails({
  isOpen,
  onClose,
  doctor,
  onEdit,
  onDelete,
  onStatusChange,
  onVerificationChange,
}: DoctorDetailsProps) {
  if (!doctor) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Détails du Médecin</SheetTitle>
          <SheetDescription>
            Informations complètes sur le profil du médecin
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[80vh] pr-4">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={doctor.user.profile?.avatarUrl}
                  alt={doctor.user.name}
                />
                <AvatarFallback>{doctor.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{doctor.user.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {doctor.user.email}
                </p>
                <div className="flex items-center mt-1">
                  <Badge
                    variant={doctor.user.isActive ? "default" : "secondary"}
                    className={
                      doctor.user.isActive
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-500 hover:bg-gray-600"
                    }
                  >
                    {doctor.user.isActive ? "Actif" : "Inactif"}
                  </Badge>
                  {doctor.isVerified && (
                    <Badge
                      variant="outline"
                      className="ml-2 border-blue-500 text-blue-500"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Vérifié
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="activity">Activité</TabsTrigger>
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Spécialité
                    </Label>
                    <p className="text-sm font-medium">
                      {getSpecializationLabel(doctor.specialization)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Localisation
                    </Label>
                    <p className="text-sm font-medium">
                      {doctor.user.profile?.city || "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Rendez-vous
                    </Label>
                    <p className="text-sm font-medium">
                      {doctor._count?.appointments || 0}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Note
                    </Label>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-1">
                        {doctor.avgRating ? doctor.avgRating.toFixed(1) : "N/A"}
                      </span>
                      {doctor.avgRating && (
                        <svg
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 15.585l-7.07 3.707 1.35-7.857L.587 7.11l7.897-1.147L10 0l2.516 5.963 7.897 1.147-5.693 5.325 1.35 7.857z"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Inscription
                    </Label>
                    <p className="text-sm font-medium">
                      {format(
                        new Date(doctor.user.createdAt || new Date()),
                        "dd/MM/yyyy"
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Dernière activité
                    </Label>
                    <p className="text-sm font-medium">
                      {format(
                        new Date(doctor.user.updatedAt || new Date()),
                        "dd/MM/yyyy HH:mm"
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Abonnement
                    </Label>
                    <div>
                      {doctor.isIndependent ? (
                        (() => {
                          const plan = doctor.subscription?.plan ?? null;
                          const color =
                            plan === "FREE"
                              ? "border-purple-500 text-purple-500"
                              : plan === "STANDARD"
                                ? "border-blue-500 text-blue-500"
                                : plan === "PREMIUM"
                                  ? "border-amber-500 text-amber-500"
                                  : "border-gray-500 text-gray-500";
                          return (
                            <Badge variant="outline" className={color}>
                              {plan ?? "—"}
                            </Badge>
                          );
                        })()
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>

                  {doctor.hospital && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Établissement
                      </Label>
                      <p className="text-sm font-medium">
                        {doctor.hospital.name}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      N° Ordre du médecin
                    </Label>
                    <p className="text-sm font-medium">
                      {doctor.licenseNumber}
                    </p>
                  </div>
                </div>

                {doctor.user.profile?.bio && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Biographie
                    </Label>
                    <p className="text-sm">{doctor.user.profile.bio}</p>
                  </div>
                )}

                {doctor.education && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Formation
                    </Label>
                    <p className="text-sm">{doctor.education}</p>
                  </div>
                )}

                {doctor.experience && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Expérience
                    </Label>
                    <p className="text-sm">{doctor.experience}</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="activity" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      Rendez-vous récents
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {doctor.appointments && doctor.appointments.length > 0 ? (
                      doctor.appointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-start space-x-3"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <Calendar className="h-4 w-4 text-blue-700" />
                          </div>
                          <div>
                            <p className="text-sm">
                              Rendez-vous avec{" "}
                              <span className="font-medium">
                                {appointment.patient.user.name}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(appointment.scheduledAt),
                                "dd/MM/yyyy à HH:mm"
                              )}
                            </p>
                            <Badge
                              variant="outline"
                              className={
                                appointment.status === "CONFIRMED"
                                  ? "mt-1 border-green-500 text-green-500"
                                  : appointment.status === "CANCELED"
                                    ? "mt-1 border-red-500 text-red-500"
                                    : "mt-1 border-amber-500 text-amber-500"
                              }
                            >
                              {appointment.status === "CONFIRMED"
                                ? "Confirmé"
                                : appointment.status === "CANCELED"
                                  ? "Annulé"
                                  : "En attente"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Aucun rendez-vous récent
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="settings" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold">
                        Statut du compte
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Gérer l&apos;état du compte
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={doctor.user.isActive ? "outline" : "default"}
                        size="sm"
                        onClick={() => onStatusChange(doctor.id, "inactive")}
                        disabled={!doctor.user.isActive}
                      >
                        Désactiver
                      </Button>
                      <Button
                        variant={doctor.user.isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => onStatusChange(doctor.id, "active")}
                        disabled={doctor.user.isActive}
                      >
                        Activer
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold">Vérification</h4>
                      <p className="text-xs text-muted-foreground">
                        Statut de vérification du profil
                      </p>
                    </div>
                    <Button
                      variant={doctor.isVerified ? "outline" : "default"}
                      size="sm"
                      onClick={() =>
                        onVerificationChange(doctor.id, !doctor.isVerified)
                      }
                    >
                      {doctor.isVerified
                        ? "Retirer la vérification"
                        : "Vérifier"}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Actions</h4>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(doctor)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier le profil
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive text-destructive"
                      onClick={() => {
                        onClose();
                        onDelete(doctor);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer le compte
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Fermer</Button>
          </SheetClose>
          <Button
            onClick={() => {
              onClose();
              onEdit(doctor);
            }}
          >
            Modifier
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
