import {
  HospitalStatus,
  ReviewStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from "@prisma/client";

export type Hospital = {
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

  admin: {
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
  };

  doctors?: {
    id: string;
    specialization: string;
    user: {
      name: string;
      email: string;
      phone: string;
      profile: {
        avatarUrl: string;
      };
    };
    isVerified: boolean;
    isIndependent: boolean;
    availableForChat: boolean;
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
    payments: {
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
};
