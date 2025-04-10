// types.ts
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
  }
  