import { BloodType, UserRole, UserGenre, AppointmentStatus } from "@prisma/client";

export type Patient = {
  id: string;
  userId: string;
  dateOfBirth?: Date;
  bloodType?: BloodType;
  allergies?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  medicalNotes?: string;
  chronicConditions?: string[];
  medicalRecordsCount?: number;
  appointmentsCount?: number;
  createdAt: Date;
  updatedAt: Date;

  user: {
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
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      bio?: string;
      avatarUrl?: string;
      genre?: UserGenre;
      createdAt?: Date;
      updatedAt?: Date;
    };
  };

  appointments?: {
    id: string;
    scheduledAt: Date;
    endTime: Date | null;
    status: AppointmentStatus;
    type?: string;
    reason?: string;
    notes?: string;
    cancellationReason?: string;
    createdAt: Date;
    updatedAt: Date;

    doctor: {
      id: string;
      specialization: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
    };

    hospital?: {
      id: string;
      name: string;
      city: string;
    };
  }[];

  medicalHistories?: {
    id: string;
    title: string;
    condition: string;
    diagnosedDate?: Date;
    status: string;
    details?: string;
    createdBy: string;
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
    hospital?: {
      id: string;
      name: string;
    };
    doctor: {
      id: string;
      user: {
        id: string;
        name: string;
      };
    };
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

    doctor: {
      id: string;
      user: {
        id: string;
        name: string;
      };
    };
  }[];

  vitalSigns?: {
    id: string;
    temperature?: number;
    heartRate?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    notes?: string;
    recordedAt: Date;
    createdAt: Date;
  }[];

  reviews?: {
    id: string;
    doctorId: string;
    rating: number;
    comment?: string;
    isAnonymous: boolean;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
};



export type PatientType = {
  id: string;
  userId: string;
  bloodType: BloodType | null;
  allergies?: string[] | string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  insuranceProvider?: string | null;
  insuranceNumber?: string | null;
  medicalNotes?: string | null;
  chronicConditions?: string[] | string | null;
  medicalRecordsCount?: number | null;
  appointmentsCount?: number | null;
  createdAt: Date;
  updatedAt: Date;

  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    emailVerified?: Date | null;
    isApproved?: boolean;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;

    profile?: {
      address?: string | null;
      city?: string | null;
      state?: string | null;
      zipCode?: string | null;
      country?: string | null;
      bio?: string | null;
      avatarUrl?: string | null;
      genre?: UserGenre | null;
      dateOfBirth?: Date;
      createdAt?: Date;
      updatedAt?: Date;
    } | null;
  };

  appointments: {
    id: string;
    scheduledAt: Date;
    startTime?: Date | null | undefined;
    endTime?: Date | null | undefined;
    status: AppointmentStatus;
    type?: string | null | undefined;
    reason?: string | null | undefined;
    notes?: string | null | undefined;
    cancellationReason?: string | null | undefined;
    completedAt?: Date | null;
    cancelledAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;

    doctor: {
      id: string;
      user: {
        name: string;
        email: string;
      } | null | undefined;
    } | null | undefined;

    hospital?: { id: string; name: string } | null;
  }[];

  medicalHistories: {
    id: string;
    title: string;
    condition: string;
    diagnosedDate?: Date | null;
    status: string;
    details?: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }[];

  medicalRecords: {
    id: string;
    diagnosis: string;
    treatment?: string;
    notes?: string;
    followUpNeeded?: boolean;
    followUpDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    hospital?: {
      id: string;
      name: string;
    };
    doctor: {
      id: string;
      user: {
        id: string;
        name: string;
      };
    } | null | undefined;
    attachments?: {
      id: string;
      fileName: string;
      fileType: string;
      fileUrl: string;
      fileSize: number;
      uploadedAt: Date;
    }[];
  }[];

  prescriptions: {
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

    doctor: {
      id: string;
      user: {
        id: string;
        name: string;
      };
    };
  }[];

  vitalSigns: {
    id: string;
    temperature?: number;
    heartRate?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    notes?: string;
    recordedAt: Date;
    createdAt: Date;
  }[];

  reviews: {
    id: string;
    doctorId: string;
    rating: number;
    comment?: string;
    isAnonymous: boolean;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
    doctor: {
      id: string;
      user: {
        name: string;
      };
    };
  }[];
};
