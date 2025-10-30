export const dynamic = "force-dynamic";

import { getPendingApprovals } from "./actions";
import { VerificationDashboard } from "./verifications-dashboard";

export default async function VerificationPage() {
  const pendingApprovals = await getPendingApprovals();

  return (
    <div className="container mx-auto">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Vérification des comptes</h1>
        <p className="text-muted-foreground">
          Approuvez ou rejetez les demandes d&apos;inscription des
          administrateurs d&apos;hôpitaux et médecins indépendants
        </p>
      </div>

      <VerificationDashboard initialApprovals={pendingApprovals} />
    </div>
  );
}
