// components/LimitBanner.tsx (or wherever)
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LimitKey =
  | "appointmentsPerMonth"
  | "patientsPerMonth"
  | "doctorsPerHospital";
type LimitSummary = {
  scope: "DOCTOR" | "HOSPITAL";
  scopeId: string;
  plan: string;
  status: "ACTIVE" | "TRIAL" | "INACTIVE" | "EXPIRED";
  limits: Record<LimitKey, number | null>;
  usage: Record<LimitKey, number>;
  exceeded: Record<LimitKey, boolean>;
  anyExceeded: boolean;
};

const LABELS: Record<LimitKey, string> = {
  appointmentsPerMonth: "rendez-vous mensuels",
  patientsPerMonth: "patients mensuels",
  doctorsPerHospital: "médecins (hôpital)",
};

export default function LimitBanner() {
  const [summary, setSummary] = useState<LimitSummary | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch("/api/limits/summary", { cache: "no-store" });
        if (!r.ok) return; // 401/400 -> hide banner silently
        const d = (await r.json()) as LimitSummary;
        if (mounted) setSummary(d?.anyExceeded ? d : null);
      } catch {
        // ignore; hide banner
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!summary) return null;

  const exceededKeys = (
    Object.entries(summary.exceeded) as [LimitKey, boolean][]
  )
    .filter(([, v]) => v)
    .map(([k]) => k);

  if (exceededKeys.length === 0) return null;

  return (
    <div
      className={cn(
        "border border-amber-300 bg-amber-50 text-amber-900 rounded-md p-3",
        "flex items-start gap-3"
      )}
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        <div className="font-semibold">
          Limite de plan atteinte — {summary.plan} (
          {summary.status.toLowerCase()})
        </div>
        <div className="text-sm">
          Vous avez atteint&nbsp;
          {exceededKeys.map((k, i) => (
            <span key={k} className="font-medium">
              {i > 0 ? ", " : " "}
              {LABELS[k]} ({summary.usage[k]}/{summary.limits[k] ?? "∞"})
            </span>
          ))}
          . Passez à un plan supérieur pour continuer.
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => location.assign("/dashboard/superadmin/plans")}
        >
          Voir les plans
        </Button>
        <Button size="sm" onClick={() => location.assign("/billing/upgrade")}>
          Mettre à niveau
        </Button>
      </div>
    </div>
  );
}
