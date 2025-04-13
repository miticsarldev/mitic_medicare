import { Activity } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VitalSign } from "@/app/dashboard/patient/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PatientVitalSignsCardProps {
  vitalSigns: VitalSign[];
}

export function PatientVitalSignsCard({
  vitalSigns,
}: PatientVitalSignsCardProps) {
  const latestVitalSign = vitalSigns[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Signes Vitaux</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {latestVitalSign ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Tension Artérielle
              </p>
              <p className="text-lg font-medium">
                {latestVitalSign.bloodPressureSystolic}/
                {latestVitalSign.bloodPressureDiastolic} mmHg
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Fréquence Cardiaque
              </p>
              <p className="text-lg font-medium">
                {latestVitalSign.heartRate} bpm
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Température</p>
              <p className="text-lg font-medium">
                {latestVitalSign.temperature
                  ? `${latestVitalSign.temperature.toString()}°C`
                  : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Saturation O2</p>
              <p className="text-lg font-medium">
                {latestVitalSign.oxygenSaturation}%
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Activity className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aucune donnée vitale récente
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <Link href="/dashboard/patient/settings/profile">
          <Button variant="default" size="sm">
            Mettre à jour mes signes vitaux.
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
