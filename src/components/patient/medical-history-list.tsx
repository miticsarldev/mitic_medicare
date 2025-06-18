"use client";

import { Card, CardContent } from "@/components/ui/card";
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

interface MedicalHistoryListProps {
  history: MedicalHistoryItem[];
  onItemClick: (item: MedicalHistoryItem) => void;
}

export function MedicalHistoryList({
  history,
  onItemClick,
}: MedicalHistoryListProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date non spécifiée";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "CHRONIC":
        return <Clock className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return (
      {
        ACTIVE: "active",
        RESOLVED: "résolue",
        CHRONIC: "chronique",
      }[status] ?? status.toLowerCase()
    );
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
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-muted/50 cursor-pointer transition-colors duration-200"
              onClick={() => onItemClick(item)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <h3 className="font-semibold text-base">{item.title}</h3>
                    <Badge
                      variant="outline"
                      className={getStatusColor(item.status)}
                    >
                      {getStatusLabel(item.status)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {item.condition}
                  </p>

                  <div className="flex items-center space-x-6 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(item.diagnosedDate)}</span>
                    </div>

                    {item.doctor && (
                      <>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>Dr {item.doctor.name}</span>
                        </div>

                        {item.doctor.hospital && (
                          <div className="flex items-center space-x-1">
                            <Hospital className="h-3 w-3" />
                            <span>{item.doctor.hospital.name}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {item.details && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
