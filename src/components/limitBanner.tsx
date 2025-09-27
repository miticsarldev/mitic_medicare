"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LimitSummary = {
  plan: string;
  status: string;
  anyExceeded: boolean;
  exceeded: Record<string, boolean>;
  limits: Record<string, number | null>;
  usage: Record<string, number>;
  scope: "DOCTOR" | "HOSPITAL";
};

export default function LimitBanner() {
  const [summary, setSummary] = useState<LimitSummary | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/limits/summary", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (mounted) setSummary(d?.error ? null : d);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (!summary || !summary.anyExceeded) return null;

  // Build a short message
  const exceededKeys = Object.entries(summary.exceeded)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const label = (k: string) =>
    ({
      appointmentsPerMonth: "rendez-vous mensuels",
      patientsPerMonth: "patients mensuels",
      doctorsPerHospital: "médecins",
      departmentsPerHospital: "départements",
    })[k] ?? k;

  return (
    <div
      className={cn(
        "border border-amber-300 bg-amber-50 text-amber-900 rounded-md p-3",
        "flex items-start gap-3"
      )}
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        <div className="font-semibold">Limite de plan atteinte</div>
        <div className="text-sm">
          Vous avez atteint les limites suivantes&nbsp;:{" "}
          {exceededKeys.map((k) => (
            <span key={k} className="font-medium">
              {label(k)} ({summary.usage[k]}/{summary.limits[k] ?? "∞"}){" "}
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
