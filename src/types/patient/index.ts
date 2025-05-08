import {
  type Appointment,
  type BloodType,
  type Doctor,
  type Hospital,
  type MedicalHistory,
  type MedicalRecord,
  type Patient,
  type Prescription,
  type Review,
  type ReviewTargetType,
  type User,
  type UserGenre,
  type UserProfile,
  type VitalSign,
} from "@prisma/client";

// Dashboard types
export type DashboardStats = {
  appointmentsCount: number;
  medicalRecordsCount: number;
  doctorsCount: number;
  medicationsCount: number;
};

export type DashboardData = {
  stats: DashboardStats;
  upcomingAppointments: AppointmentWithRelations[];
  medications: PrescriptionWithRelations[];
  vitalSigns: VitalSign[];
  recentMedicalRecords: MedicalRecordWithRelations[];
};

// Appointment types
export type AppointmentWithRelations = Appointment & {
  doctor: Doctor & {
    user: User;
  };
  patient: Patient & {
    user: User;
  };
  hospital?: Hospital | null;
};

// Medical record types
export type MedicalRecordWithRelations = MedicalRecord & {
  doctor: Doctor & {
    user: User;
  };
  patient: Patient & {
    user: User;
  };
  hospital?: Hospital | null;
};

export type MedicalHistoryWithRelations = MedicalHistory & {
  patient: Patient;
  createdByUser: User;
};

// Doctor types
export type DoctorWithRelations = Doctor & {
  user: User & {
    profile?: UserProfile | null; // Le profil est optionnel dans user
  };
  hospital?: Hospital | null;
  reviews: Review[];
};

// Hospital types
export type HospitalWithRelations = Hospital & {
  admin: User;
};

// Review types
export type ReviewWithRelations = Review & {
  author: User;
  doctor?: Doctor | null;
  hospital?: Hospital | null;
};

// Prescription types
export type PrescriptionWithRelations = Prescription & {
  doctor: Doctor & {
    user: User;
  };
};

// Patient types
export type PatientWithRelations = Patient & {
  user: User & {
    profile?: UserProfile | null;
  };
};

// Form submission types
export type AppointmentFormData = {
  doctorId: string;
  date: Date;
  time: string;
  reason: string;
  notes: string;
};

export type ProfileFormData = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  bio?: string;
  genre?: UserGenre;
  dateOfBirth: string;
};

export type MedicalInfoFormData = {
  dateOfBirth: Date;
  bloodType?: BloodType;
  allergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  medicalNotes?: string;
};

export type SecurityFormData = {
  currentPassword: string;
  newPassword: string;
  twoFactorAuth: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
};

export type ReviewFormData = {
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  title: string;
  content: string;
  isAnonymous: boolean;
};

export type FeedbackFormData = {
  category: string;
  satisfaction: string;
  title: string;
  details: string;
  contactPermission: boolean;
};
