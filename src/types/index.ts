import { SubscriptionPlan } from "@prisma/client";

export interface PatientAnalyticsType {
  totalPatients: number;
  activePatients: number;
  newPatients: number;
  patientActivity: { month: string; count: number }[];
  geographicalDistribution: { region: string; count: number }[];
}

export interface HospitalAnalyticsType {
  totalHospitals: number;
  activeHospitals: number;
  newHospitals: number;
  registrationsActivity: { month: string; count: number }[];
  geographicalDistribution: { region: string; count: { id: number } }[];
  subscriptionsByPlan: { plan: SubscriptionPlan; count: number }[];
}

export interface Doctor {
  id: number;
  name: string;
  departement: string;
  specialty: string;
  email: string;
  phone: string;
  status: "Actif" | "Inactif";
  location: string;
  image: string;
}

export interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export type Appointment = {
  id: string;
  patientName: string;
  date: Date;
  motif: string;
  status: string;
  notes: string;
  prescription: boolean;
  followUp: string | null;
  avatar: string;
};
