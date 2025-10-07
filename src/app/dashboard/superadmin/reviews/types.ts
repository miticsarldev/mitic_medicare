import type {
  Review,
  ReviewStatus,
  ReviewTargetType,
  User,
  UserProfile,
  Doctor,
  Hospital,
} from "@prisma/client";

export interface ReviewWithRelations extends Review {
  author: User & { profile?: UserProfile | null };
  doctor?: (Doctor & { user: User }) | null;
  hospital?: Hospital | null;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ReviewsStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  avgRating: number;
}

export interface ReviewsData {
  reviews: ReviewWithRelations[];
  pagination: PaginationOptions;
  stats: ReviewsStats;
}

export interface ReviewFilterOptions {
  status: ReviewStatus | "ALL";
  targetType: "ALL" | ReviewTargetType; // DOCTOR | HOSPITAL | PLATFORM
  searchQuery: string;
  ratingMin?: number;
  ratingMax?: number;
  dateRange: { from?: Date; to?: Date };
  doctorId?: string | null;
  hospitalId?: string | null;
}
