"use client";

import * as React from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Circle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { SummaryResponse } from "@/types/subscription";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

const statusStyles: Record<
  NonNullable<SummaryResponse["status"]>,
  { dot: string; badge: string; text: string }
> = {
  ACTIVE: {
    dot: "text-emerald-500",
    badge: "bg-emerald-100 text-emerald-800",
    text: "Actif",
  },
  TRIAL: {
    dot: "text-blue-500",
    badge: "bg-blue-100 text-blue-800",
    text: "Essai",
  },
  PENDING: {
    dot: "text-amber-500",
    badge: "bg-amber-100 text-amber-800",
    text: "En attente",
  },
  INACTIVE: {
    dot: "text-gray-500",
    badge: "bg-gray-100 text-gray-800",
    text: "Inactif",
  },
  EXPIRED: {
    dot: "text-red-500",
    badge: "bg-red-100 text-red-800",
    text: "Expiré",
  },
};

function fmtDate(d?: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

// Friendly labels for known limit keys
function labelFor(key: string): string {
  switch (key) {
    case "appointmentsPerMonth":
      return "Rendez-vous / mois";
    case "patientsPerMonth":
      return "Patients / mois";
    case "doctorsPerHospital":
      return "Médecins par hôpital";
    default:
      // fallback: split camelCase/snake_case into Title Case
      return key
        .replace(/[_\-]/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (m) => m.toUpperCase());
  }
}

type Props = { className?: string };

export const SubscriptionIndicator = React.memo(function SubscriptionIndicator({
  className,
}: Props) {
  const { data, isLoading } = useSWR<SummaryResponse>(
    "/api/subscription/summary",
    fetcher,
    {
      dedupingInterval: 15_000,
      revalidateOnFocus: true,
      revalidateIfStale: false,
      revalidateOnReconnect: true,
    }
  );

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* mobile skeleton */}
        <Skeleton className="h-8 w-8 rounded-full sm:hidden" />
        {/* desktop skeleton */}
        <Skeleton className="hidden sm:block h-8 w-[170px] rounded-full" />
      </div>
    );
  }

  if (!data?.show) return null;

  const st = data.status ? statusStyles[data.status] : statusStyles.INACTIVE;

  // Primary usage (unchanged)
  const p = data.usage?.primary;
  const primaryPercent =
    p?.limit && p.limit > 0
      ? Math.min(100, Math.round((p.current / p.limit) * 100))
      : null;

  // Full usage/limits
  const fullLimits = data.usage?.full?.limits ?? {};
  const fullUsage = data.usage?.full?.usage ?? {};
  // Construct entries while preserving the order of keys present in limits
  const fullEntries = Object.entries(fullLimits).map(([key, limit]) => {
    const current = Number(fullUsage?.[key] ?? 0);
    const finite = limit !== null && typeof limit === "number";
    const percent =
      finite && limit > 0
        ? Math.min(100, Math.round((current / limit) * 100))
        : null;
    return {
      key,
      label: labelFor(key),
      current,
      limit: limit as number | null,
      finite,
      percent,
    };
  });

  const daysOverdue =
    typeof data?.daysOverdue === "number" ? data.daysOverdue : null;
  const daysRemaining =
    typeof data?.daysRemaining === "number" ? data.daysRemaining : null;

  const timeLabel =
    data?.status === "EXPIRED" && daysOverdue !== null && daysOverdue > 0
      ? `Expiré il y a ${daysOverdue} j`
      : (data?.status === "ACTIVE" || data?.status === "TRIAL") &&
          daysRemaining !== null
        ? `${daysRemaining} j restants`
        : null;

  const PlanShort =
    (data.plan || "FREE") === "STANDARD"
      ? "STD"
      : (data.plan || "FREE") === "PREMIUM"
        ? "PREM"
        : data.plan || "FREE";

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* TWO triggers: compact for mobile, detailed for md+ */}
        <div className={cn("flex items-center", className)}>
          {/* Mobile (compact) */}
          <button
            className={cn(
              "inline-flex sm:hidden items-center justify-center h-8 w-8 rounded-full border bg-background shadow-sm hover:bg-accent/50 transition relative"
            )}
            aria-label="Statut d'abonnement"
          >
            <Circle
              className={cn("h-2.5 w-2.5 absolute -right-0.5 -top-0.5", st.dot)}
            />
            <span className="text-[10px] font-semibold">{PlanShort}</span>
          </button>

          {/* Desktop (detailed) */}
          <button
            className={cn(
              "hidden sm:inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 shadow-sm hover:bg-accent/50 transition"
            )}
            aria-label="Statut d'abonnement"
          >
            <Badge variant="secondary" className="rounded-full">
              {data.plan ?? "FREE"}
            </Badge>

            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5",
                st.badge
              )}
            >
              <Circle className={cn("h-2.5 w-2.5", st.dot)} />
              {st.text}
            </span>

            <Info className="h-4 w-4 text-muted-foreground ml-0.5" />
          </button>
        </div>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[350px]">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">Abonnement</div>
              <div className="text-muted-foreground">{data.plan ?? "FREE"}</div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5",
                st.badge
              )}
            >
              <Circle className={cn("h-2.5 w-2.5", st.dot)} />
              {st.text}
            </span>
          </div>

          {/* Primary metric (highlight) */}
          {p && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{p.label}</span>
                  <span className="font-medium">
                    {p.current}
                    {p.limit !== null ? ` / ${p.limit}` : " • Illimité"}
                  </span>
                </div>
                {p.limit !== null && <Progress value={primaryPercent ?? 0} />}
              </div>
            </>
          )}

          {/* All limits & usage */}
          {fullEntries.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Autres limites
                </div>
                <div className="space-y-2">
                  {fullEntries.map((item) => (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="font-medium">
                          {item.current}
                          {item.limit !== null
                            ? ` / ${item.limit}`
                            : " • Illimité"}
                        </span>
                      </div>
                      {item.finite && <Progress value={item.percent ?? 0} />}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Début</div>
              <div className="font-medium">
                {fmtDate(data.startDate ?? null)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Fin</div>
              <div className="font-medium">{fmtDate(data.endDate ?? null)}</div>
            </div>
          </div>

          {timeLabel && (
            <div className="text-xs text-muted-foreground mt-1">
              {timeLabel}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});
