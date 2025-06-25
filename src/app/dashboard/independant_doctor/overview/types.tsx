export interface WeeklyPatients {
    date: string;
    count: number;
  }
  
  export interface PendingAppointment {
    id: string;
    patient: string;
    date: string;
    time: string;
  }
  
  export interface Review {
    id: string;
    patient: string;
    rating: number;
    comment: string;
    createdAt: string;
  }
  export interface DailyAppointments {
    day: string;
    count: number;
  }
  
  export interface DashboardData {
    patientsToday: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    dailyAppointments: DailyAppointments[];
    weeklyPatients: WeeklyPatients[];
    pendingAppointmentsList: PendingAppointment[];
    reviews: Review[];
    recentPrescriptions: {
      id: string;
      patient: string;
      medicationName: string;
      dosage: string;
      frequency: string;
      instructions?: string;
      createdAt: string;
    }[];
    upcomingAvailabilities: {
      id: string;
      dayOfWeek: number;
      dayName: string;
      startTime: string;
      endTime: string;
      isActive: boolean;
    }[];
  }

 export  type AppointmentTypeStatsItem = {
          type: string;
          count: number;
        };
  
    export    type TypeDataResponse = {
          appointmentTypeStats: AppointmentTypeStatsItem[];
        };