"use client";

import { format } from "date-fns";
import { Building, Check, Pencil, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Hospital } from "@/types/hospital";
import type { HospitalStatus, SubscriptionPlan } from "@prisma/client";

interface HospitalDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: Hospital | null;
  onEdit: (hospital: Hospital) => void;
  onDelete: (hospital: Hospital) => void;
  onStatusChange: (hospitalId: string, status: HospitalStatus) => void;
  onVerificationChange: (hospitalId: string, verified: boolean) => void;
  subscriptionPlans: SubscriptionPlan[];
}

export default function HospitalDetails({
  isOpen,
  onClose,
  hospital,
  onEdit,
  onDelete,
  onStatusChange,
  onVerificationChange,
  subscriptionPlans,
}: HospitalDetailsProps) {
  if (!hospital) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Détails de l&apos;Établissement</SheetTitle>
          <SheetDescription>
            Informations complètes sur le profil de l&apos;établissement
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={hospital.logoUrl || ""} alt={hospital.name} />
              <AvatarFallback>
                <Building className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{hospital.name}</h3>
              <p className="text-sm text-muted-foreground">{hospital.email}</p>
              <div className="flex items-center mt-1">
                <Badge
                  variant={
                    hospital.status === "ACTIVE"
                      ? "default"
                      : hospital.status === "INACTIVE"
                        ? "secondary"
                        : "outline"
                  }
                  className={
                    hospital.status === "ACTIVE"
                      ? "bg-green-500 hover:bg-green-600"
                      : hospital.status === "INACTIVE"
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "border-amber-500 text-amber-500 hover:bg-amber-50"
                  }
                >
                  {hospital.status === "ACTIVE"
                    ? "Actif"
                    : hospital.status === "INACTIVE"
                      ? "Inactif"
                      : "En attente"}
                </Badge>
                {hospital.isVerified && (
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
              <TabsTrigger value="doctors">Médecins</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Localisation
                  </Label>
                  <p className="text-sm font-medium">{hospital.city}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Téléphone
                  </Label>
                  <p className="text-sm font-medium">{hospital.phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Médecins
                  </Label>
                  <p className="text-sm font-medium">
                    {hospital.doctors?.length || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Inscription
                  </Label>
                  <p className="text-sm font-medium">
                    {format(new Date(hospital.createdAt), "dd/MM/yyyy")}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Dernière mise à jour
                  </Label>
                  <p className="text-sm font-medium">
                    {format(new Date(hospital.updatedAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <div className="flex flex-col">
                  <Label className="text-xs text-muted-foreground">
                    Abonnement
                  </Label>
                  <div>
                    <Badge
                      variant="outline"
                      className={
                        hospital.subscription?.plan === "PREMIUM"
                          ? "border-purple-500 text-purple-500 inline"
                          : hospital.subscription?.plan === "STANDARD"
                            ? "border-blue-500 text-blue-500 inline"
                            : hospital.subscription?.plan === "FREE"
                              ? "border-green-500 text-green-500 inline"
                              : "border-gray-500 text-gray-500 inline"
                      }
                      style={{ justifyContent: "left" }}
                    >
                      {hospital.subscription?.plan || "FREE"}
                    </Badge>
                  </div>
                </div>
                {hospital.website && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Site web
                    </Label>
                    <p className="text-sm font-medium">
                      <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {hospital.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">
                  Adresse complète
                </Label>
                <p className="text-sm">
                  {hospital.address}, {hospital.city}, {hospital.state},{" "}
                  {hospital.country}
                </p>
              </div>

              {hospital.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Description
                  </Label>
                  <p className="text-sm">{hospital.description}</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="doctors" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Médecins affiliés</h4>
                </div>
                <div className="space-y-2">
                  {hospital.doctors && hospital.doctors.length > 0 ? (
                    hospital.doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="flex items-center justify-between p-2 rounded-md border"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {doctor.specialization.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {doctor.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {doctor.specialization}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      Aucun médecin affilié
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Statut du compte</h4>
                    <p className="text-xs text-muted-foreground">
                      Gérer l&apos;état du compte
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={
                        hospital.status === "ACTIVE" ? "outline" : "default"
                      }
                      size="sm"
                      onClick={() => onStatusChange(hospital.id, "INACTIVE")}
                      disabled={hospital.status !== "ACTIVE"}
                    >
                      Désactiver
                    </Button>
                    <Button
                      variant={
                        hospital.status === "ACTIVE" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => onStatusChange(hospital.id, "ACTIVE")}
                      disabled={hospital.status === "ACTIVE"}
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
                    variant={hospital.isVerified ? "outline" : "default"}
                    size="sm"
                    onClick={() =>
                      onVerificationChange(hospital.id, !hospital.isVerified)
                    }
                  >
                    {hospital.isVerified
                      ? "Retirer la vérification"
                      : "Vérifier"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Abonnement</h4>
                    <p className="text-xs text-muted-foreground">
                      Gérer le plan d&apos;abonnement
                    </p>
                  </div>
                  <Select
                    defaultValue={hospital.subscription?.plan || "FREE"}
                    disabled
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionPlans.map((plan) => (
                        <SelectItem key={plan} value={plan}>
                          {plan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Actions</h4>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(hospital)}
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
                      onDelete(hospital);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer l&apos;établissement
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Fermer</Button>
          </SheetClose>
          <Button
            onClick={() => {
              onClose();
              onEdit(hospital);
            }}
          >
            Modifier
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
