// import { Pill } from "lucide-react";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Prescription } from "@/app/dashboard/patient/types";

// interface PatientMedicationCardProps {
//   prescriptions: Prescription[];
// }

// export function PatientMedicationCard({
//   prescriptions,
// }: PatientMedicationCardProps) {
//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between pb-2">
//         <CardTitle className="text-sm font-medium">
//           Médicaments Actifs
//         </CardTitle>
//         <Pill className="h-4 w-4 text-muted-foreground" />
//       </CardHeader>
//       <CardContent>
//         {prescriptions.length > 0 ? (
//           <div className="space-y-3">
//             {prescriptions.slice(0, 3).map((prescription) => (
//               <div
//                 key={prescription.id}
//                 className="flex items-start justify-between rounded-md border p-3"
//               >
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium">
//                     {prescription.medicationName}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     {prescription.dosage} - {prescription.frequency}
//                   </p>
//                 </div>
//                 <div className="flex h-6 items-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
//                   {prescription.duration}
//                 </div>
//               </div>
//             ))}
//             {prescriptions.length > 3 && (
//               <p className="text-center text-xs text-muted-foreground">
//                 +{prescriptions.length - 3} autres médicaments
//               </p>
//             )}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-6 text-center">
//             <Pill className="mb-2 h-8 w-8 text-muted-foreground" />
//             <p className="text-sm text-muted-foreground">
//               Aucun médicament actif
//             </p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

import { Pill } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prescription, PrescriptionOrder } from "@/app/dashboard/patient/types";

interface PatientMedicationCardProps {
  prescriptions: Prescription[];
  latestPrescriptionOrder: PrescriptionOrder | null;
}

export function PatientMedicationCard({
  prescriptions,
  latestPrescriptionOrder,
}: PatientMedicationCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Médicaments</CardTitle>
        <Pill className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Médicaments actifs */}
        <div>
          <p className="text-sm font-semibold mb-2">Actifs</p>
          {prescriptions.length > 0 ? (
            <div className="space-y-3">
              {prescriptions.slice(0, 3).map((prescription) => (
                <div
                  key={prescription.id}
                  className="flex items-start justify-between rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {prescription.medicationName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {prescription.dosage} - {prescription.frequency}
                    </p>
                  </div>
                  <div className="flex h-6 items-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
                    {prescription.duration}
                  </div>
                </div>
              ))}
              {prescriptions.length > 3 && (
                <p className="text-center text-xs text-muted-foreground">
                  +{prescriptions.length - 3} autres médicaments
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun médicament actif.
            </p>
          )}
        </div>

        {/* Dernière ordonnance */}
        {latestPrescriptionOrder && (
          <div>
            <p className="text-sm font-semibold mb-2">Dernière ordonnance</p>
            <div className="space-y-3">
              {latestPrescriptionOrder.prescriptions.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start justify-between rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{p.medicationName}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.dosage} - {p.frequency}
                    </p>
                  </div>
                  <div className="flex h-6 items-center rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground">
                    {p.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
