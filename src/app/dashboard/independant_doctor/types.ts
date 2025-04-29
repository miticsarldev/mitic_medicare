import { AppointmentStatus, Prisma } from "@prisma/client";

export type Period = "week" | "month" | "year";
export type TimeRange = "24h" | "7d" | "30d" | "90d" | "1y";

export interface AppointmentStatistics {
  date: string;
  status: AppointmentStatus;
  count: number;
}

export interface RevenueStatistics {
  date: string;
  revenue: number;
}

export interface PerformanceHistory {
  date: string;
  value: number;
}

export interface PerformanceStatistics {
  consultationsCompleted: {
    value: number;
    change: string;
    trend: "up" | "down";
    history: PerformanceHistory[];
  };
  averageRating: {
    value: string;
    change: string;
    trend: "up" | "down";
  };
  responseTime: {
    value: string;
    change: string;
    trend: "up" | "down";
  };
  patientSatisfaction: {
    value: string;
    change: string;
    trend: "up" | "down";
  };
}

export interface ReviewStatistics {
  averageRating: {
    value: string;
    change: string;
    trend: "up" | "down";
  };
  totalReviews: {
    value: number;
    change: string;
    trend: "up" | "down";
  };
  responseRate: {
    value: string;
    change: string;
    trend: "up" | "down";
  };
}

export type DashboardStats = {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  averageRating: number | null;
};

export type AppointmentWithPatient = Prisma.AppointmentGetPayload<{
  include: {
    patient: {
      include: {
        user: {
          include: {
            profile: true;
          };
        };
      };
    };
  };
}>;

export type ReviewWithAuthor = Prisma.ReviewGetPayload<{
  include: {
    author: {
      include: {
        profile: true;
      };
    };
  };
}>;
