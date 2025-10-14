// lib/hooks/use-gate.ts
"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  LimitKey,
  SummaryResponse,
  useSubscriptionSummary,
} from "./use-subscription-summary";

type Status = NonNullable<SummaryResponse["status"]>;

type GateRule =
  | { type: "status"; allow: Status[] } // e.g. allow: ["ACTIVE", "TRIAL"]
  | { type: "limit"; key: LimitKey; delta?: number } // need capacity for +delta
  | { type: "always" }; // only blocks on hard status (EXPIRED/INACTIVE)

type GateResult = {
  allowed: boolean;
  disabled: boolean;
  reason?: string;
  actionHref?: string;
  actionLabel?: string;
  summary?: SummaryResponse;
  /** Helper for buttons */
  buttonProps: (onClick?: React.MouseEventHandler) => {
    disabled: boolean;
    onClick: React.MouseEventHandler;
    title?: string;
  };
};

function isHardBlocked(s?: Status) {
  return s === "EXPIRED" || s === "INACTIVE";
}

function limitRemaining(
  limits: Record<LimitKey, number | null> | undefined,
  usage: Record<LimitKey, number> | undefined,
  key: LimitKey
) {
  const lim = limits?.[key] ?? null; // null => unlimited
  const used = usage?.[key] ?? 0;
  if (lim === null) return Infinity;
  return Math.max(0, lim - used);
}

export function useGate(rule: GateRule): GateResult {
  const { data } = useSubscriptionSummary();
  const router = useRouter();

  const status = data?.status;
  const hardBlocked = isHardBlocked(status) || !!data?.block;

  let allowed = true;
  let reason: string | undefined;

  if (rule.type === "status") {
    allowed = !!status && rule.allow.includes(status) && !hardBlocked;
    if (!allowed) {
      if (hardBlocked) {
        reason =
          status === "EXPIRED"
            ? "Votre abonnement a expiré."
            : "Votre abonnement est inactif.";
      } else {
        reason = "Cette action nécessite un abonnement actif.";
      }
    }
  } else if (rule.type === "limit") {
    if (hardBlocked) {
      allowed = false;
      reason =
        status === "EXPIRED"
          ? "Votre abonnement a expiré."
          : "Votre abonnement est inactif.";
    } else {
      const remain = limitRemaining(
        data?.usage?.full?.limits,
        data?.usage?.full?.usage,
        rule.key
      );
      const need = Math.max(1, rule.delta ?? 1);
      allowed = remain >= need;
      if (!allowed) {
        reason =
          rule.key === "doctorsPerHospital"
            ? "Nombre maximal de médecins atteint pour votre plan."
            : rule.key === "appointmentsPerMonth"
              ? "Nombre maximal de rendez-vous mensuels atteint."
              : "Nombre maximal de patients mensuels atteint.";
      }
    }
  } else {
    // always
    allowed = !hardBlocked;
    if (!allowed) {
      reason =
        status === "EXPIRED"
          ? "Votre abonnement a expiré."
          : "Votre abonnement est inactif.";
    }
  }

  const actionHref = data?.action?.href ?? "/dashboard/subscription";
  const actionLabel = data?.action?.label ?? "Gérer l’abonnement";

  const blockedTitle = reason
    ? `${reason} Cliquez pour gérer l’abonnement.`
    : undefined;

  const buttonProps = (onClick?: React.MouseEventHandler) => ({
    disabled: !allowed,
    title: !allowed ? blockedTitle : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick: (e: any) => {
      if (!allowed) {
        e?.preventDefault?.();
        toast({
          title: "Action bloquée",
          description: `${reason ?? "Fonctionnalité indisponible."}`,
          variant: "destructive",
        });
        router.push(actionHref);
        return;
      }
      onClick?.(e);
    },
  });

  return {
    allowed,
    disabled: !allowed,
    reason,
    actionHref,
    actionLabel,
    summary: data,
    buttonProps,
  };
}

/** Convenience: gate ready-to-use props for a Button based on a limit */
export function useGateButton(rule: GateRule) {
  const gate = useGate(rule);
  return {
    title: gate.reason,
    getOnClick: (handler?: React.MouseEventHandler) =>
      gate.buttonProps(handler).onClick,
    ...gate,
  };
}
