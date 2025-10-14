"use client";

import useSWR from "swr";

export type LimitKey =
  | "appointmentsPerMonth"
  | "patientsPerMonth"
  | "doctorsPerHospital";

export type SummaryResponse = {
  show: boolean;
  scope?: "DOCTOR" | "HOSPITAL";
  role?:
    | "SUPER_ADMIN"
    | "HOSPITAL_ADMIN"
    | "INDEPENDENT_DOCTOR"
    | "HOSPITAL_DOCTOR"
    | "PATIENT";
  plan?: "FREE" | "STANDARD" | "PREMIUM";
  status?: "ACTIVE" | "TRIAL" | "INACTIVE" | "EXPIRED" | "PENDING";
  interval?: "monthly" | "yearly" | "—";
  autoRenew?: boolean;
  currency?: string;
  amount?: string | number | null;
  startDate?: string | null;
  endDate?: string | null;
  daysRemaining?: number | null;
  daysOverdue?: number | null;
  inGrace?: boolean;
  usage?: {
    primary: {
      key: LimitKey;
      current: number;
      limit: number | null;
      label: string;
    };
    full: {
      limits: Record<LimitKey, number | null>;
      usage: Record<LimitKey, number>;
    };
  };
  action?: {
    label: string;
    variant: "default" | "destructive" | "secondary";
    href: string;
  } | null;
  block?: boolean;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSubscriptionSummary() {
  const { data, error, isLoading, mutate } = useSWR<SummaryResponse>(
    "/api/subscription/summary",
    fetcher,
    { revalidateOnFocus: true }
  );
  return {
    data,
    error,
    isLoading,
    refresh: mutate,
    ready: !!data && !isLoading,
  };
}
