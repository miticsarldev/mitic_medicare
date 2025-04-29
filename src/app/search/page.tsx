import { Suspense } from "react";
import { searchHealthcare, type SearchFilters } from "@/app/actions/ui-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchHeader } from "./search-header";
import { FilterSidebar } from "./filter-sidebar";
import { SearchResults } from "./search-filters";
import Navbar from "@/components/navbar";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Parse search params
  const type = (searchParams.type as SearchFilters["type"]) || "doctor";
  const query = searchParams.query as string | undefined;
  const specialization = searchParams.specialization as string | undefined;
  const city = searchParams.city as string | undefined;
  const minRating = searchParams.minRating
    ? Number(searchParams.minRating)
    : undefined;
  const gender = searchParams.gender as string | undefined;
  const experience = searchParams.experience as string | undefined;
  const sortBy = searchParams.sortBy as string | undefined;

  const filters: SearchFilters = {
    type,
    query: undefined,
    specialization,
    city,
    minRating,
    gender,
    experience,
    sortBy,
  };

  // Fetch search results
  const results = await searchHealthcare(filters);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="min-h-screen">
        <div className="max-w-screen-xl mx-auto">
          <Navbar />
          <SearchHeader initialQuery={query || ""} activeType={type} />

          <div className="w-full px-4 py-1 sm:py-2 md:py-4 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-4">
              <Suspense
                fallback={<Skeleton className="h-[600px] w-full rounded-xl" />}
              >
                <FilterSidebar initialFilters={filters} />
              </Suspense>

              <div className="lg:col-span-3 space-y-4">
                <Suspense
                  fallback={
                    <div className="space-y-4">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-[200px] w-full rounded-xl"
                          />
                        ))}
                    </div>
                  }
                >
                  <SearchResults
                    results={results}
                    type={type}
                    filters={filters}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
