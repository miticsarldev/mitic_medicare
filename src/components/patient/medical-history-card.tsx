"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  Hospital,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { MedicalHistoryItem } from "@/app/dashboard/patient/actions";

interface MedicalHistoryCardProps {
  item: MedicalHistoryItem;
  onClick: () => void;
}

export function MedicalHistoryCard({ item, onClick }: MedicalHistoryCardProps) {
  const formatDate = (dateString: string | null) => {
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
        return <AlertCircle className="h-4 w-4" />;
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4" />;
      case "CHRONIC":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
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

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
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
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Problème médical
          </p>
          <p className="text-sm">{item.condition}</p>
        </div>

        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Diagnostic : {formatDate(item.diagnosedDate)}</span>
        </div>

        {item.doctor && (
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Dr {item.doctor.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {item.doctor.specialization}
            </div>
            {item.doctor.hospital && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Hospital className="h-3 w-3" />
                <span>{item.doctor.hospital.name}</span>
              </div>
            )}
          </div>
        )}

        {item.details && (
          <div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.details}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
