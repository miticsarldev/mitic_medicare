export type Doctor = {
  id: string;
  userId?: string;
  specialization: string;
  licenseNumber: string;
  education: string | null;
  experience: string | null;
  isVerified: boolean;
  isIndependent: boolean;
  availableForChat?: boolean;
  consultationFee?: number | null;
  avgRating?: number | null;
  createdAt?: Date;
  updatedAt?: Date;

  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    emailVerified: Date | null;
    isApproved: boolean;
    isActive: boolean;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    profile?: {
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      bio?: string;
      avatarUrl?: string;
      genre?: UserGenre;
      createdAt?: Date | undefined;
      updatedAt?: Date | undefined;
    };
  };

  hospital?: {
    id: string;
    name: string;
    city: string;
    state: string;
    country: string;
    email: string;
    phone: string;
    address: string;
    website?: string;
    description?: string;
    logoUrl?: string;
    isVerified: boolean;
    status: HospitalStatus;
    createdAt: Date;
    updatedAt: Date;
    subscription?: {
      plan: SubscriptionPlan;
      status: SubscriptionStatus;
      startDate: Date;
      endDate: Date;
      amount: number;
      currency: string;
      autoRenew: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  };

  department?: {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  };

  subscription?: {
    id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    amount: number;
    currency: string;
    autoRenew: boolean;
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
    createdAt: Date;
    updatedAt: Date;
  };

  appointments?: {
    id: string;
    scheduledAt: Date;
    endTime: Date;
    status: AppointmentStatus;
    type?: string;
    reason?: string;
    notes?: string;
    cancellationReason?: string;
    createdAt: Date;
    updatedAt: Date;
    patient: {
      id: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
    };
  }[];

  availabilities?: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];

  medicalRecords?: {
    id: string;
    diagnosis: string;
    treatment?: string;
    notes?: string;
    followUpNeeded: boolean;
    followUpDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    attachments: {
      id: string;
      fileName: string;
      fileType: string;
      fileUrl: string;
      fileSize: number;
      uploadedAt: Date;
    }[];
  }[];

  prescriptions?: {
    id: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
    isActive: boolean;
    startDate: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
  }[];

  doctorReviews?: {
    id: string;
    rating: number;
    comment?: string;
    isAnonymous: boolean;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
    patient: {
      id: string;
      user: {
        id: string;
        name: string;
      };
    };
  }[];

  reviews?: {
    id: string;
    title: string;
    content: string;
    rating: number;
    status: ReviewStatus;
    isAnonymous: boolean;
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string;
    };
    responses: {
      id: string;
      content: string;
      isOfficial: boolean;
      createdAt: Date;
    }[];
  }[];

  _count?: {
    appointments: number;
    availabilities: number;
    reviews: number;
  };

  avgRating?: number;
};
