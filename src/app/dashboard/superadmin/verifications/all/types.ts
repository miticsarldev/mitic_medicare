import { UserRole } from "@prisma/client";

export interface UserProfile {
  id: string;
  userId: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  genre?: "MALE" | "FEMALE" | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  userId: string;
  hospitalId?: string | null;
  departmentId?: string | null;
  specialization: string;
  licenseNumber: string;
  education?: string | null;
  experience?: string | null;
  isVerified: boolean;
  isIndependent: boolean;
  availableForChat: boolean;
  consultationFee?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hospital {
  id: string;
  name: string;
  adminId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  isVerified: boolean;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  createdAt: Date;
  updatedAt: Date;
}

export interface PendingApprovalUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  profile: UserProfile | null;
  doctor: Doctor | null;
  hospital: Hospital | null;
}
