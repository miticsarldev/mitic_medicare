import {
  HospitalStatus,
  ReviewStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from "@prisma/client";
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
  website?: string;
  description?: string;
  logoUrl?: string;
  isVerified: boolean;
  status: HospitalStatus;
  createdAt: Date;
  updatedAt: Date;
  admin?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    emailVerified: Date | null;
    isApproved: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    profile?: {
      avatarUrl?: string;
    };
  };
  doctors?: {
    id: string;
    specialization: string;
    isVerified: boolean;
    isIndependent: boolean;
    availableForChat: boolean;
    user: {
      name: string;
      profile?: {
        avatarUrl?: string;
      };
    };
  }[];
  departments?: {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  subscription?: {
    id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    amount: number;
    currency: string;
    autoRenew: boolean;
    createdAt: Date;
    updatedAt: Date;
    payments?: {
      id: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      transactionId?: string;
      status: string;
      paymentDate: Date;
      createdAt: Date;
    }[];
  };
  reviews?: {
    id: string;
    title: string;
    content: string;
    rating: number;
    status: ReviewStatus;
    isAnonymous: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
  doctorsCount?: number;
  rating?: number;
  topDoctors?: Array<{
    id: string;
    name: string;
    specialty: string;
    image: string;
  }>;
}

export interface ExportHospital {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  status: HospitalStatus;
  verified: string; // "true" or "false" instead of boolean
  doctorsCount: number;
  createdAt: string; // ISO string instead of Date
}