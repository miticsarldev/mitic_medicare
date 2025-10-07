import {
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriberType,
  UserRole,
  HospitalStatus,
} from "@prisma/client";

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string | null;
  status: string;
  paymentDate: string; // ISO format
  createdAt: string; // ISO format
}

export interface Subscription {
  id: string;
  subscriberType: SubscriberType;
  doctorId: string | null;
  hospitalId: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string; // ISO format
  endDate: string; // ISO format
  amount: number;
  currency: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  doctor?: {
    id: string;
    userId: string;
    hospitalId: string | null;
    departmentId: string | null;
    specialization: string;
    licenseNumber: string;
    education: string | null;
    experience: string | null;
    isVerified: boolean;
    isIndependent: boolean;
    availableForChat: boolean;
    consultationFee: number | null;
    createdAt: string;
    updatedAt: string;

    user?: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: UserRole;
      emailVerified: string | null;
      isApproved: boolean;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;

      profile?: {
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
        createdAt: string;
        updatedAt: string;
      };
    };

    hospital?: {
      id: string;
      name: string;
      city: string;
      country: string;
    };

    department?: {
      id: string;
      name: string;
    };
  };

  hospital?: {
    id: string;
    name: string;
    adminId: string;
    address: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    email: string;
    website?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    isVerified: boolean;
    status: HospitalStatus;
    createdAt: string;
    updatedAt: string;

    admin?: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: string;
      isActive: boolean;
    };
  };

  payments: SubscriptionPayment[];
}
