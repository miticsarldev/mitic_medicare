"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Star,
  Phone,
  CheckCircle,
  Briefcase,
  BookOpen,
  User,
  Calendar,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDoctorSlotsWithTakenStatus } from "@/app/actions/doctor-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSpecializationLabel } from "@/utils/function";

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  averageRating: number;
  patientsCount: number;
  phone: string;
  email: string;
  availableForChat?: boolean;
  address?: string;
  isVerified?: boolean;
  isActive?: boolean;
  department?: { id: string; name: string };
  education?: string;
  experience?: string;
  consultationFee?: string;
  schedule?: { day: string; slots: string[] }[];
  avatarUrl?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onChangeDepartment?: () => void;
  onChangeStatus?: (doctorId: string, isActive: boolean) => void;
  toggling?: boolean;
}

export function DoctorCard({
  doctor,
  onChangeDepartment,
  onChangeStatus,
  toggling,
}: DoctorCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [weeklySlots, setWeeklySlots] = useState<
    { day: string; slot: string; taken: boolean }[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const spec = doctor.specialization?.trim() || "";
  const dept = doctor.department?.name?.trim() || "";
  const showDept = !!dept && dept.toLowerCase() !== spec.toLowerCase();
  const plainName =
    doctor.name?.replace(/^\s*(dr\.?|doctor)\s+/i, "") || doctor.name;

  useEffect(() => {
    if (!showDetails) return;
    setLoadingSlots(true);
    getDoctorSlotsWithTakenStatus(doctor.id)
      .then((data) => {
        const transformed = Object.entries(data).flatMap(
          ([day, { all, taken }]) =>
            (all as string[]).map((slot) => ({
              day,
              slot,
              taken: (taken as string[]).includes(slot),
            }))
        );
        setWeeklySlots(transformed);
      })
      .finally(() => setLoadingSlots(false));
  }, [showDetails, doctor.id]);

  const frenchDayNames: Record<string, string> = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  };

  // Shared bits
  const ActionsMenu = ({ desktop }: { desktop?: boolean }) => (
    <div className={desktop ? "hidden sm:block" : "sm:hidden"}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowDetails(true)}>
            <User className="mr-2 h-4 w-4" /> Détails
          </DropdownMenuItem>
          {onChangeDepartment && (
            <DropdownMenuItem onClick={onChangeDepartment}>
              <Briefcase className="mr-2 h-4 w-4" /> Changer département
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // GRID VARIANT
  const DoctorGridCard = () => (
    <Card
      className={`rounded-xl border border-border/50 hover:shadow-md transition-shadow ${doctor.isActive === false ? "opacity-70" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-col items-center justify-between gap-2">
          <Avatar className="size-24 shrink-0">
            {doctor.avatarUrl ? (
              <AvatarImage
                src={doctor.avatarUrl}
                alt={doctor.name}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {doctor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="min-w-0">
            <CardTitle className="text-base font-medium flex flex-col justify-center items-center gap-2">
              <span className="truncate text-center">{plainName}</span>
              {doctor.isVerified && (
                <Badge variant="outline" className="gap-1 shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Vérifié</span>
                </Badge>
              )}
            </CardTitle>

            <div className="mt-1 flex flex-col justify-center items-center gap-1.5">
              <Badge variant="secondary" className="font-normal text-xs">
                Spécialité: {getSpecializationLabel(spec) || "—"}
              </Badge>
              {showDept && (
                <Badge variant="outline" className="text-xs max-w-full">
                  <span className="truncate">Département: {dept}</span>
                </Badge>
              )}
            </div>
          </div>
          <ActionsMenu />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center gap-2 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">{doctor.phone}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">{doctor.email || "Non renseigné"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 shrink-0" />
          <span>{doctor.averageRating.toFixed(1)}</span>
          <span className="text-muted-foreground text-xs">
            ({doctor.patientsCount} patients)
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-2 pt-0 justify-between">
        <ActionsMenu desktop />
        <Button
          variant={doctor.isActive ? "outline" : "default"}
          size="sm"
          className="h-8 text-xs"
          disabled={toggling}
          onClick={(e) => {
            e.stopPropagation();
            onChangeStatus?.(doctor.id, !doctor.isActive);
          }}
        >
          {toggling
            ? "Mise à jour..."
            : doctor.isActive
              ? "Désactiver"
              : "Activer"}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <>
      <DoctorGridCard />

      {/* Details Modal (unchanged behavior) */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-2xl rounded-lg">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                {doctor.avatarUrl ? (
                  <AvatarImage
                    src={doctor.avatarUrl}
                    alt={doctor.name}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-xl">
                    {doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  {plainName}
                  {doctor.isVerified && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" /> Vérifié
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge>
                    Spécialité: {getSpecializationLabel(spec) || "—"}
                  </Badge>
                  {showDept && (
                    <Badge variant="outline">Département: {dept}</Badge>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">
                <User className="mr-2 h-4 w-4" />
                Informations
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Disponibilités
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Coordonnées
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <span>{doctor.phone}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-primary mt-0.5" />
                        <span>{doctor.email}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Statistiques
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <span className="font-medium">
                            {doctor.averageRating.toFixed(1)}
                          </span>
                          <span className="text-muted-foreground text-sm ml-2">
                            ({doctor.patientsCount} patients)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {doctor.education && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Formation
                      </h4>
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                        <p className="whitespace-pre-line">
                          {doctor.education}
                        </p>
                      </div>
                    </div>
                  )}
                  {doctor.experience && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Expérience
                      </h4>
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                        <p className="whitespace-pre-line">
                          {doctor.experience}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              {loadingSlots ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <Skeleton key={j} className="h-8 w-16 rounded-full" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : weeklySlots.length ? (
                <div className="space-y-4">
                  {Array.from(new Set(weeklySlots.map((s) => s.day))).map(
                    (day) => (
                      <div key={day} className="space-y-2">
                        <h4 className="font-medium">
                          {frenchDayNames[day] || day}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {weeklySlots
                            .filter((s) => s.day === day)
                            .map((slot) => (
                              <Badge
                                key={slot.slot}
                                variant={slot.taken ? "secondary" : "default"}
                                className="px-3 py-1 rounded-full"
                              >
                                {slot.slot}
                                {slot.taken && (
                                  <span className="ml-1 text-xs opacity-70">
                                    (occupé)
                                  </span>
                                )}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-8 w-8 mb-2" />
                  Aucun créneau disponible
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Fermer
            </Button>
            <Button asChild>
              <Link href={`/dashboard/hopital_admin/doctors/${doctor.id}`}>
                Voir le profil
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
