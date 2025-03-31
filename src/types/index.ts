/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubscriptionPlan } from "@prisma/client";

export interface PatientAnalyticsType {
  totalPatients: number;
  activePatients: number;
  newPatients: number;
  patientActivity: { month: string; count: number }[];
  geographicalDistribution: { region: string; count: number }[];
}

// Define the Analytics type
export type DoctorAnalyticsType = {
  totalDoctors: number;
  activeDoctors: number;
  verifiedDoctors: number;
  newDoctors: number;
  registrationsActivity: { month: string; count: number }[];
  geographicalDistribution: { city: string; count: number }[];
  specialtyDistribution: { specialty: string; count: number }[];
  subscriptionDistribution: { plan: string; count: number }[];
};

export interface HospitalAnalyticsType {
  totalHospitals: number;
  activeHospitals: number;
  newHospitals: number;
  registrationsActivity: { month: string; count: number }[];
  geographicalDistribution: { region: string; count: { id: number } }[];
  subscriptionsByPlan: { plan: SubscriptionPlan; count: number }[];
}

export interface SubscriptionAnalyticsType {
  totalSubscriptions: number;
  activeSubscriptions: number;
  doctorSubscriptions: number;
  hospitalSubscriptions: number;
  newSubscriptions: number;
  subscriptionsByPlan: any;
  revenueByMonth: any;
  totalRevenue: any;
  avgSubscriptionValue: any;
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
