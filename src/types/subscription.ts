// types/subscription.ts
export type LimitKey =
  | "appointmentsPerMonth"
  | "patientsPerMonth"
  | "doctorsPerHospital";

export type SummaryResponse = {
  show: boolean;

  // who + plan
  scope?: "DOCTOR" | "HOSPITAL";
  role?:
    | "SUPER_ADMIN"
    | "HOSPITAL_ADMIN"
    | "INDEPENDENT_DOCTOR"
    | "HOSPITAL_DOCTOR"
    | "PATIENT";
  plan?: "FREE" | "STANDARD" | "PREMIUM";

  // lifecycle
  status?: "ACTIVE" | "TRIAL" | "INACTIVE" | "EXPIRED" | "PENDING";

  // dates (ISO strings from the API)
  startDate?: string | null;
  endDate?: string | null;

  // NEW: time meta derived from today
  daysRemaining?: number | null; // 0+ or null
  daysOverdue?: number | null; // 0+ or null

  // quotas
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
};
