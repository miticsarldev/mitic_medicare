export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { History } from "lucide-react";
import { getPatientMedicalHistory } from "../../actions";
import { MedicalHistoryView } from "@/components/patient/medical-history-view";

export default async function MedicalHistoryPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto p-4 space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Mes antécédents médicaux
              </h2>
              <p className="text-muted-foreground">
                Consultez l’ensemble de votre historique médical incluant les
                maladies chroniques, les antécédents et les traitements en
                cours.
              </p>
            </div>
          </div>

          <Suspense fallback={<MedicalHistorySkeleton />}>
            <MedicalHistoryList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function MedicalHistoryList() {
  const result = await getPatientMedicalHistory();

  if (!result.success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Erreur lors du chargement
          </h3>
          <p className="text-muted-foreground text-center">
            {result.error ||
              "Une erreur est survenue lors du chargement de votre historique médical."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!result.history || result.history.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Aucun historique médical trouvé
          </h3>
          <p className="text-muted-foreground text-center">
            Votre historique médical apparaîtra ici au fur et à mesure qu’il
            sera documenté par votre professionnel de santé.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <MedicalHistoryView history={result.history} />;
}

function MedicalHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                <div className="h-6 w-20 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
