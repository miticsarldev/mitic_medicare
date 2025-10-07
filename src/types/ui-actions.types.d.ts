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

export type HospitalWithDetails = {
  id: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  website?: string;
  isVerified: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  address: string;
  phone: string;
  email: string;
  description?: string;
  logoUrl?: string;
  admin: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profile?: {
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      bio?: string;
      avatarUrl?: string;
      genre?: UserGenre;
    };
  };
  departments: {
    id: string;
    name: string;
    description?: string;
    doctors: {
      id: string;
      user: {
        id: string;
        name: string;
        email: string;
        profile?: {
          address?: string;
          city?: string;
          state?: string;
          zipCode?: string;
          country?: string;
          bio?: string;
          avatarUrl?: string;
          genre?: UserGenre;
        };
      };
    }[];
  }[];
  doctors: {
    id: string;
    specialization: string;
    licenseNumber: string;
    experience?: string;
    education?: string;
    isVerified: boolean;
    consultationFee?: number;
    user: {
      id: string;
      name: string;
      email: string;
      profile?: {
        address?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
        bio?: string;
        avatarUrl?: string;
        genre?: UserGenre;
      };
    };
    department?: {
      id: string;
      name: string;
    };
    reviews: {
      id: string;
      rating: number;
      title: string;
      likes: number;
      dislikes: number;
      content: string;
      createdAt: Date;
      author: {
        id: string;
        name: string;
        profile?: {
          avatarUrl?: string;
        };
      };
    }[];
    avgRating: number;
  }[];
  reviews: {
    id: string;
    rating: number;
    title: string;
    likes: number;
    dislikes: number;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      profile?: {
        avatarUrl?: string;
      };
    };
  }[];
  avgRating: number;
};

export interface DepartmentWithDetails {
  id: string;
  name: string;
  description?: string;
  hospital: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    logoUrl: string;
  };
  doctors: {
    id: string;
    specialization: string;
    licenseNumber: string;
    experience?: string;
    education?: string;
    isVerified: boolean;
    consultationFee?: number;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      profile?: {
        address?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
        bio?: string;
        avatarUrl?: string;
        genre?: UserGenre;
      };
    };
    reviews: {
      id: string;
      title: string;
      content: string;
      rating: number;
      createdAt: Date;
      author: {
        id: string;
        name: string;
        profile?: {
          avatarUrl?: string;
        };
      };
    }[];
    avgRating: number;
  }[];
}
