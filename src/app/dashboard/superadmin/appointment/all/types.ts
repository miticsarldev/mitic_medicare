import type {
  Appointment,
  AppointmentStatus,
  Doctor,
  Hospital,
  Patient,
  User,
  UserProfile,
} from "@prisma/client";

export interface AppointmentWithRelations extends Appointment {
  patient: Patient & {
    user: User & {
      profile: UserProfile | null;
    };
  };
  doctor: Doctor & {
    user: User;
    hospital?: Hospital | null;
  };
}

export interface AppointmentStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  upcomingAppointments: number;
  completionRate: number;
  cancellationRate: number;
  averageDuration: number;
  mostActiveDay: string;
  mostActiveHour: number;
  appointmentsByStatus: StatusCount[];
  appointmentsByDay: DayCount[];
  appointmentsByHour: HourCount[];
  appointmentsTrend: TrendData[];
  topDoctors: TopDoctor[];
  topHospitals: TopHospital[];
}

export interface StatusCount {
  status: AppointmentStatus;
  count: number;
  percentage: number;
}

export interface DayCount {
  day: string;
  count: number;
}

export interface HourCount {
  hour: number;
  count: number;
}

export interface TrendData {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
  pending: number;
}

export interface TopDoctor {
  id: string;
  name: string;
  specialization: string;
  appointmentCount: number;
  completionRate: number;
}

export interface TopHospital {
  id: string;
  name: string;
  appointmentCount: number;
  completionRate: number;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AppointmentsData {
  appointments: AppointmentWithRelations[];
  stats: AppointmentStats;
  pagination: PaginationOptions;
}

export interface FilterOptions {
  status: AppointmentStatus | "ALL";
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  searchQuery: string;
  doctorId: string | null;
  hospitalId: string | null;
  specialization: string | null;
}
