export type VerificationDocument = {
  id: string;
  name: string;
  type: string;
  url: string;
  size: string;
  verified: boolean;
  uploadedAt: string;
};

export type VerificationDetails = {
  // Doctor specific fields
  specialization?: string;
  licenseNumber?: string;
  hospitalId?: string;
  hospitalName?: string;
  departmentName?: string;

  // Hospital specific fields
  name?: string;
  website?: string;
  adminName?: string;
  adminEmail?: string;
  adminPhone?: string;

  // Common fields
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
};

export type Verification = {
  id: string;
  type: "DOCTOR" | "HOSPITAL";
  status: "PENDING" | "APPROVED" | "REJECTED";
  name: string;
  email: string;
  specialty?: string | null;
  submittedAt: string;
  updatedAt: string;
  verificationProgress: number;
  notes: string;
  assignedTo: string;
  documents: VerificationDocument[];
  rejectionReason?: string | null;
  avatarUrl?: string | null;
  details?: VerificationDetails;
};
