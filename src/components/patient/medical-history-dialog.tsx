"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  Hospital,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  UserCheck,
} from "lucide-react";
import { MedicalHistoryItem } from "@/app/dashboard/patient/actions";

interface MedicalHistoryDialogProps {
  item: MedicalHistoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MedicalHistoryDialog({
  item,
  open,
  onOpenChange,
}: MedicalHistoryDialogProps) {
  if (!item) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date non spécifiée";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString: string | null) => {
    if (!dateString) return "Date non spécifiée";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "RESOLVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "CHRONIC":
        return <Clock className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-200 dark:border-orange-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800";
      case "CHRONIC":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-200 dark:border-gray-800";
    }
  };

  const getRoleDisplay = (role: string) => {
    return role
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl pr-8">{item.title}</DialogTitle>
            <Badge
              variant="outline"
              className={`${getStatusColor(item.status)} flex items-center space-x-1`}
            >
              {getStatusIcon(item.status)}
              <span className="capitalize">
                {{
                  ACTIVE: "active",
                  RESOLVED: "résolue",
                  CHRONIC: "chronique",
                }[item.status] ?? item.status.toLowerCase()}
              </span>
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Problème médical
              </h3>
              <p className="text-base">{item.condition}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date du diagnostic</span>
                </h3>
                <p className="text-sm">{formatDateOnly(item.diagnosedDate)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Statut
                </h3>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status)}
                  <span className="text-sm capitalize">
                    {{
                      ACTIVE: "active",
                      RESOLVED: "résolue",
                      CHRONIC: "chronique",
                    }[item.status] ?? item.status.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Médecin traitant */}
          {item.doctor && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Médecin traitant</span>
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <p className="font-medium">Dr {item.doctor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.doctor.specialization}
                  </p>
                  {item.doctor.hospital && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Hospital className="h-4 w-4" />
                      <span>{item.doctor.hospital.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Détails */}
          {item.details && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Détails et remarques</span>
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {item.details}
                  </p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Informations d’enregistrement */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Informations d’enregistrement</span>
            </h3>
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Créé par :</span>
                <span>
                  {item.createdBy.name} ({getRoleDisplay(item.createdBy.role)})
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Créé le :</span>
                <span>{formatDate(item.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Dernière mise à jour :
                </span>
                <span>{formatDate(item.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
