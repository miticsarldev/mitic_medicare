import { Suspense } from "react";
import { getReviewsData } from "../actions";
import ReviewsTable from "../reviews-table";
import { ReviewStatus, ReviewTargetType } from "@prisma/client";

export const dynamic = "force-dynamic";

type Search = {
  page?: string;
  pageSize?: string;
  status?: "ALL" | ReviewStatus;
  targetType?: "ALL" | ReviewTargetType;
  search?: string;
  from?: string;
  to?: string;
  ratingMin?: string;
  ratingMax?: string;
  doctorId?: string;
  hospitalId?: string;
};

export default async function ReviewsAllPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const data = await getReviewsData({
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize) : 10,
    status: (searchParams.status as ReviewStatus) ?? "ALL",
    targetType: (searchParams.targetType as ReviewTargetType) ?? "ALL",
    search: searchParams.search ?? "",
    from: searchParams.from ?? null,
    to: searchParams.to ?? null,
    ratingMin: searchParams.ratingMin
      ? parseInt(searchParams.ratingMin)
      : undefined,
    ratingMax: searchParams.ratingMax
      ? parseInt(searchParams.ratingMax)
      : undefined,
    doctorId: searchParams.doctorId ?? null,
    hospitalId: searchParams.hospitalId ?? null,
  });

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Avis</h2>
        <p className="text-muted-foreground">
          Gestion de tous les avis de la plateforme
        </p>
      </div>

      <Suspense fallback={<div>Chargement…</div>}>
        <ReviewsTable initialData={data} />
      </Suspense>
    </div>
  );
}
