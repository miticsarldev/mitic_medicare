import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block">
            <Skeleton className="h-[600px] w-full rounded-xl" />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-6 w-32" />
            </div>

            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
                ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
