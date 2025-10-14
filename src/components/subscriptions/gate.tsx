// components/Gate.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useGate } from "@/hooks/use-gate";

type Props =
  | {
      rule:
        | { type: "status"; allow: Array<"ACTIVE" | "TRIAL"> }
        | {
            type: "limit";
            key:
              | "appointmentsPerMonth"
              | "patientsPerMonth"
              | "doctorsPerHospital";
            delta?: number;
          }
        | { type: "always" };
      children: React.ReactNode;
      fallback?: React.ReactNode;
    }
  | {
      rule: { type: "always" };
      children: React.ReactNode;
      fallback?: React.ReactNode;
    };

export function Gate({ rule, children, fallback }: Props) {
  const { allowed, reason, actionHref, actionLabel } = useGate(rule);

  if (allowed) return <>{children}</>;

  return (
    <>
      {fallback ?? (
        <div className="rounded-lg border bg-muted/40 p-4 flex items-center justify-between gap-3">
          <div className="text-sm">
            <div className="font-medium mb-0.5">Fonctionnalité verrouillée</div>
            <div className="text-muted-foreground">{reason}</div>
          </div>
          <Button asChild>
            <a href={actionHref}>{actionLabel}</a>
          </Button>
        </div>
      )}
    </>
  );
}
