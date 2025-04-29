import { UserGenre } from "@prisma/client";

export type TopDoctor = {
  id: string;
  name: string;
  specialization: string;
  avatarUrl: string | null;
  isVerified: boolean;
  rating: number;
  reviews: number;
  genre: UserGenre | null;
  city?: string | null;
  experience?: string | null;
  hospitalName?: string;
};

export type DoctorResult = {
  id: string;
  type: "doctor";
  name: string;
  specialization: string;
  city?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
};

export type HospitalResult = {
  id: string;
  type: "hospital";
  name: string;
  city: string;
  imageUrl?: string | null;
  rating?: number | null;
};

export type DepartmentResult = {
  id: string;
  type: "department";
  name: string;
  hospitalName?: string;
  hospitalImage: string;
};

export type SearchResult = DoctorResult | HospitalResult | DepartmentResult;
