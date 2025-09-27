import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { UserCog } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Patient } from "@/types/patient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BLOOD_LABEL, GENDER_LABEL } from "@/utils/patient-format";

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onEdit: (patient: Patient) => void;
}

export default function PatientDetailsModal({
  isOpen,
  onClose,
  patient,
  onEdit,
}: PatientDetailsModalProps) {
  if (!patient) return null;

  // Get status badge
  const getStatusBadge = (status: boolean) => {
    switch (status) {
      case true:
        return <Badge className="bg-green-500 hover:bg-green-600">Actif</Badge>;
      case false:
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            Inactif
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Format date helper
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "d MMMM yyyy", { locale: fr });
  };

  const gender = patient?.user?.profile?.genre
    ? (GENDER_LABEL[patient.user.profile.genre] ?? "—")
    : "—";

  const blood = patient?.bloodType
    ? (BLOOD_LABEL[patient.bloodType] ?? "—")
    : "—";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={patient.user.profile?.avatarUrl}
                  alt={patient.user.name}
                />
                <AvatarFallback>{patient.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{patient.user.name}</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(patient.user.isActive)}
            </div>
          </div>
          <DialogDescription>
            Inscrit le {formatDate(patient.user.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Email
                  </div>
                  <div>{patient.user.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Téléphone
                  </div>
                  <div>{patient.user.phone || "Non renseigné"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Date de naissance
                  </div>
                  <div>{formatDate(patient.user.dateOfBirth)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Genre
                  </div>
                  <div>{gender || "Non renseigné"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Adresse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Adresse
                  </div>
                  <div>{patient.user.profile?.address || "Non renseignée"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Ville
                  </div>
                  <div>{patient.user.profile?.city || "Non renseignée"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Code postal
                  </div>
                  <div>{patient.user.profile?.zipCode || "Non renseigné"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Pays
                  </div>
                  <div>{patient.user.profile?.country || "Non renseigné"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Informations médicales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Groupe sanguin
                  </div>
                  <div>{blood || "Non renseigné"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Allergies
                  </div>
                  <div>
                    {Array.isArray(patient.allergies) &&
                    patient.allergies.length > 0
                      ? patient.allergies.join(", ")
                      : "Aucune allergie connue"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-4" />

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-medium mb-2">Contact d&apos;urgence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Nom
                </div>
                <div>{patient.emergencyContact || "Non renseigné"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Téléphone
                </div>
                <div>{patient.emergencyPhone || "Non renseigné"}</div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex flex-col gap-2 mt-4">
          <Button
            onClick={() => {
              onClose();
              onEdit(patient);
            }}
          >
            <UserCog className="mr-2 h-4 w-4" />
            Modifier le profil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
