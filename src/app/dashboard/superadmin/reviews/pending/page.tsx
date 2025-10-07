import { Suspense } from "react";
import { getReviewsData } from "../actions";
import ReviewsTable from "../reviews-table";

export const dynamic = "force-dynamic";

type Search = { page?: string; pageSize?: string };

export default async function PendingReviewsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const data = await getReviewsData({
    status: "PENDING",
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize) : 10,
  });

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Avis en attente</h2>
        <p className="text-muted-foreground">
          File d’approbation : approuver ou rejeter rapidement
        </p>
      </div>

      <Suspense fallback={<div>Chargement…</div>}>
        <ReviewsTable initialData={data} forceStatus="PENDING" />
      </Suspense>
    </div>
  );
}
