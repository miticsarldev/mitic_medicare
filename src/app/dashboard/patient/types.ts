import type { Prisma } from "@prisma/client";

// Extend Prisma types with additional properties for UI
export type Patient = Prisma.PatientGetPayload<{
  include: { user: true };
}> & {
  user: {
    name: string;
    email: string;
    dateOfBirth: Date | string | null;
  };
};

export type Doctor = Prisma.DoctorGetPayload<{
  include: {
    user: true;
    hospital: true;
    department: true;
    subscription: true;
    reviews: true;
    doctorReviews: true;
    _count: true;
  };
}> & {
  doctorName: string;
  hospitalName?: string;
  departmentName?: string;
  avgRating?: number;
};

export type Appointment = Prisma.AppointmentGetPayload<{
  include: { doctor: { include: { user: true } } };
}> & {
  doctorName: string;
};

export type MedicalRecord = Prisma.MedicalRecordGetPayload<{
  include: { doctor: { include: { user: true } } };
}> & {
  doctorName: string;
};

export type Prescription = Prisma.PrescriptionGetPayload<{
  include: { doctor: { include: { user: true } } };
}> & {
  doctorName: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type VitalSign = Prisma.VitalSignGetPayload<{}>;

export type MedicalHistory = Prisma.MedicalHistoryGetPayload<{
  include: { createdByUser: true };
}> & {
  createdByName: string;
};

export type PatientOverviewData = {
  patient: Patient;
  nextAppointment: Appointment | null;
  recentAppointments: Appointment[];
  latestMedicalRecord: MedicalRecord | null;
  activePrescriptions: Prescription[];
  vitalSigns: VitalSign[];
  medicalHistory: MedicalHistory[];
};
