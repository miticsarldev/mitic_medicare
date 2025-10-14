import { DefaultSession } from "next-auth";
import {
  Account,
  DoctorSubscription,
  HospitalSubscription,
  PatientSubscription,
  UserProfile,
  UserRole,
} from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      email: string;
      name: string | null;
      dateOfBirth: Date | string | null;
      role: UserRole;
      emailVerified: Date | null;
      isApproved: boolean;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;

      userProfile?: UserProfile;
      accounts?: Account;
      patientSubscription?: PatientSubscription;
      doctorSubscription?: DoctorSubscription;
      hospitalSubscription?: HospitalSubscription;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    dateOfBirth: Date | string | null;
    role: UserRole;
    emailVerified: Date | null;
    isApproved: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    userProfile?: UserProfile;
    accounts?: Account;
    patientSubscription?: PatientSubscription;
    doctorSubscription?: DoctorSubscription;
    hospitalSubscription?: HospitalSubscription;
  }

  interface JWT {
    id: string;
    email: string;
    name: string | null;
    dateOfBirth: Date | string | null;
    role: UserRole;
    emailVerified: Date | null;
    isApproved: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    userProfile?: UserProfile;
    accounts?: Account;
    patientSubscription?: PatientSubscription;
    doctorSubscription?: DoctorSubscription;
    hospitalSubscription?: HospitalSubscription;
  }
}
