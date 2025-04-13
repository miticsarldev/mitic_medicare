import { Heart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MedicalHistory } from "@/app/dashboard/patient/types";

interface PatientHealthSummaryProps {
  medicalHistory: MedicalHistory[];
  className?: string;
}

export function PatientHealthSummary({
  medicalHistory,
  className,
}: PatientHealthSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Résumé de Santé</CardTitle>
        <Heart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {medicalHistory.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {medicalHistory.map((history) => (
                <div
                  key={history.id}
                  className="rounded-lg border p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium">{history.title}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        history.status === "ACTIVE"
                          ? "bg-red-100 text-red-700"
                          : history.status === "RESOLVED"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {history.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {history.condition}
                  </p>
                  {history.diagnosedDate && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Diagnostiqué le:{" "}
                      {new Date(history.diagnosedDate).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  )}
                  {history.details && (
                    <p className="mt-2 text-sm">{history.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Heart className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aucun historique médical
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
