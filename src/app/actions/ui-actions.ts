/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/prisma";
import { average, parseExperienceYears } from "@/config/search.helpers";
import {
  FILTERS_BY_TYPE,
  type AllowedType,
  type DoctorSortBy,
  type HospitalSortBy,
  type DepartmentSortBy,
} from "@/config/filters.config";
import {
  DepartmentWithDetails,
  HospitalWithDetails,
  SearchResult,
  TopDoctor,
} from "@/types/ui-actions.types";

export type SearchFilters = {
  type: AllowedType;
  query?: string;
  specialization?: string;
  city?: string;
  minRating?: number; // average rating (post-filter)
  gender?: "MALE" | "FEMALE";
  experience?: string; // you store it as text; we keep it text for query, parse to number only for sorting
  sortBy?: string;
  page?: number;
  limit?: number;
};

export type SearchResults = {
  doctors: any[];
  hospitals: any[];
  departments: any[];
  totalCount: number;
  facets: {
    specializations: { name: string; count: number }[];
    cities: { name: string; count: number }[];
    ratings: { value: number; count: number }[]; // (reserved; can be filled later)
    genders: { value: string; count: number }[];
    experienceLevels: { value: string; count: number }[];
  };
};

export type SearchParams = {
  query: string;
  type: "doctor" | "hospital" | "department";
  specialization?: string;
  city?: string;
  limit?: number;
};

export async function searchHealthcare(
  filters: SearchFilters
): Promise<SearchResults> {
  const {
    type,
    query,
    specialization,
    city,
    minRating,
    gender,
    experience,
    sortBy,
    page = 1,
    limit = 10,
  } = filters;

  const skip = (page - 1) * limit;

  // validate sortBy for the selected type
  const allowedSorts = FILTERS_BY_TYPE[type].sortBy as readonly string[];
  const sort: string | undefined = allowedSorts.includes(sortBy ?? "")
    ? (sortBy as string)
    : undefined;

  let doctors: any[] = [];
  let hospitals: any[] = [];
  let departments: any[] = [];
  let totalCount = 0;

  const facets: SearchResults["facets"] = {
    specializations: [],
    cities: [],
    ratings: [],
    genders: [],
    experienceLevels: [],
  };

  try {
    if (type === "doctor") {
      // WHERE
      const where: any = {
        AND: [
          query
            ? {
                user: {
                  name: { contains: query, mode: "insensitive" },
                },
              }
            : {},
          specialization && specialization !== "all"
            ? {
                specialization: {
                  contains: specialization,
                  mode: "insensitive",
                },
              }
            : {},
          city && city !== "all"
            ? {
                OR: [
                  {
                    user: {
                      profile: {
                        city: { contains: city, mode: "insensitive" },
                      },
                    },
                  },
                  {
                    hospital: { city: { contains: city, mode: "insensitive" } },
                  },
                ],
              }
            : {},
          gender ? { user: { profile: { genre: gender } } } : {},
          experience && experience !== "all"
            ? { experience: { contains: experience, mode: "insensitive" } }
            : {},
          { isVerified: true },
          { user: { isActive: true } },
        ],
      };

      // ORDER BY
      // Many sorts can be done in SQL. For avg rating & review count we can use relation aggregates.
      let orderBy: any = { user: { name: "asc" } }; // default

      switch (sort as DoctorSortBy | undefined) {
        case "name_az":
          orderBy = { user: { name: "asc" } };
          break;
        case "experience_high":
          // experience is TEXT => fallback: order by createdAt desc in SQL, then final JS sort by parsed years
          orderBy = { createdAt: "desc" };
          break;
        case "fee_low":
          orderBy = { consultationFee: "asc" };
          break;
        case "fee_high":
          orderBy = { consultationFee: "desc" };
          break;
        case "reviews_high":
          orderBy = { reviews: { _count: "desc" } };
          break;
        case "rating_high":
          // Prisma supports relation aggregate orderBy on numeric fields:
          // orderBy: { reviews: { _avg: { rating: 'desc' } } }
          orderBy = { reviews: { _avg: { rating: "desc" } } };
          break;
        case "recently_added":
          orderBy = { createdAt: "desc" };
          break;
        default:
          // keep default
          break;
      }

      totalCount = await prisma.doctor.count({ where });

      const rows = await prisma.doctor.findMany({
        where,
        include: {
          user: { include: { profile: true } },
          hospital: true,
          department: true,
          reviews: { select: { rating: true } },
        },
        orderBy,
        skip,
        take: limit,
      });

      // compute avgRating & numeric experience for downstream sorting/filtering
      let computed = rows.map((d) => {
        const ratings = d.reviews.map((r) => r.rating);
        const avgRating = average(ratings);
        const expYears = parseExperienceYears(d.experience ?? undefined);
        return { ...d, avgRating, expYears, reviewCount: ratings.length };
      });

      // post-filter by min average rating (cannot reliably do in SQL)
      if (minRating) {
        computed = computed.filter((d) => d.avgRating >= minRating);
      }

      // final JS sort for the cases that need computed values (experience_high if text)
      if (sort === "experience_high") {
        computed.sort((a, b) => b.expYears - a.expYears);
      }

      doctors = computed;

      // FACETS
      const specializationFacets = await prisma.doctor.groupBy({
        by: ["specialization"],
        where: {
          isVerified: true,
          user: { isActive: true, isApproved: true },
          specialization: { not: "" },
        },
        _count: { _all: true },
      });

      facets.specializations = specializationFacets
        .filter((f) => f.specialization)
        .map((f) => ({
          name: f.specialization as string,
          count: f._count._all,
        }))
        .sort((a, b) => b.count - a.count);

      const cityFacets = await prisma.hospital.groupBy({
        by: ["city"],
        where: { isVerified: true, city: { not: "" } },
        _count: { _all: true },
      });
      facets.cities = cityFacets
        .filter((f) => f.city)
        .map((f) => ({ name: f.city as string, count: f._count._all }))
        .sort((a, b) => b.count - a.count);

      const genderFacets = await prisma.userProfile.groupBy({
        by: ["genre"],
        where: { user: { doctor: { isVerified: true } } },
        _count: { _all: true },
      });
      facets.genders = genderFacets
        .filter((f) => f.genre)
        .map((f) => ({ value: f.genre as string, count: f._count._all }));

      // (Optional static buckets)
      facets.experienceLevels = [
        { value: "1-5", count: 0 },
        { value: "5-10", count: 0 },
        { value: "10+", count: 0 },
      ];
    }

    if (type === "hospital") {
      const where: any = {
        AND: [
          query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          city && city !== "all"
            ? { city: { contains: city, mode: "insensitive" } }
            : {},
          { isVerified: true },
        ],
      };

      let orderBy: any = { name: "asc" };

      switch (sort as HospitalSortBy | undefined) {
        case "name_az":
          orderBy = { name: "asc" };
          break;
        case "rating_high":
          orderBy = { reviews: { _avg: { rating: "desc" } } };
          break;
        case "reviews_high":
          orderBy = { reviews: { _count: "desc" } };
          break;
        case "doctors_high":
          orderBy = { doctors: { _count: "desc" } };
          break;
        case "departments_high":
          orderBy = { departments: { _count: "desc" } };
          break;
        case "recently_added":
          orderBy = { createdAt: "desc" };
          break;
        default:
          break;
      }

      totalCount = await prisma.hospital.count({ where });

      const rows = await prisma.hospital.findMany({
        where,
        include: {
          departments: { select: { id: true } },
          doctors: {
            where: { isVerified: true, user: { isActive: true } },
            select: { id: true, reviews: { select: { rating: true } } },
          },
          reviews: { select: { rating: true } },
        },
        orderBy,
        skip,
        take: limit,
      });

      hospitals = rows.map((h) => {
        const ratings = h.reviews.map((r) => r.rating);
        const avgRating = average(ratings);
        return {
          ...h,
          avgRating,
          reviewCount: ratings.length,
          doctorsCount: h.doctors.length,
          departmentsCount: h.departments.length,
        };
      });

      const cityFacets = await prisma.hospital.groupBy({
        by: ["city"],
        where: { isVerified: true, city: { not: "" } },
        _count: { _all: true },
      });
      facets.cities = cityFacets
        .filter((f) => f.city)
        .map((f) => ({ name: f.city as string, count: f._count._all }))
        .sort((a, b) => b.count - a.count);

      // (Optional placeholders)
      facets.genders = [];
      facets.experienceLevels = [];
    }

    if (type === "department") {
      const where: any = {
        AND: [
          query ? { name: { contains: query, mode: "insensitive" } } : {},
          city && city !== "all"
            ? {
                hospital: {
                  city: { contains: city, mode: "insensitive" },
                  isVerified: true,
                },
              }
            : { hospital: { isVerified: true } },
        ],
      };

      let orderBy: any = { name: "asc" };

      switch (sort as DepartmentSortBy | undefined) {
        case "name_az":
          orderBy = { name: "asc" };
          break;
        case "doctors_high":
          orderBy = { doctors: { _count: "desc" } };
          break;
        case "hospital_az":
          orderBy = { hospital: { name: "asc" } };
          break;
        case "recently_added":
          orderBy = { createdAt: "desc" };
          break;
        default:
          break;
      }

      totalCount = await prisma.department.count({ where });

      const rows = await prisma.department.findMany({
        where,
        include: {
          hospital: true,
          doctors: {
            where: { isVerified: true },
            select: { id: true, reviews: { select: { rating: true } } },
          },
        },
        orderBy,
        skip,
        take: limit,
      });

      departments = rows.map((d) => {
        const allRatings = d.doctors.flatMap((doc) =>
          doc.reviews.map((r) => r.rating)
        );
        const avgRating = average(allRatings);
        return { ...d, doctorsCount: d.doctors.length, avgRating };
      });

      const cityFacets = await prisma.hospital.groupBy({
        by: ["city"],
        where: { isVerified: true, city: { not: "" } },
        _count: { _all: true },
      });
      facets.cities = cityFacets
        .filter((f) => f.city)
        .map((f) => ({ name: f.city as string, count: f._count._all }))
        .sort((a, b) => b.count - a.count);

      facets.genders = [];
      facets.experienceLevels = [];
    }

    return { doctors, hospitals, departments, totalCount, facets };
  } catch (e) {
    console.error("searchHealthcare error:", e);
    return {
      doctors: [],
      hospitals: [],
      departments: [],
      totalCount: 0,
      facets: {
        specializations: [],
        cities: [],
        ratings: [],
        genders: [],
        experienceLevels: [],
      },
    };
  }
}

// Get all cities for dropdown
export async function getCities(): Promise<string[]> {
  try {
    // Get cities from hospitals
    const hospitalCities = await prisma.hospital.findMany({
      select: {
        city: true,
      },
      distinct: ["city"],
      where: {
        city: {
          not: "",
        },
      },
    });

    // Get cities from user profiles
    const profileCities = await prisma.userProfile.findMany({
      select: {
        city: true,
      },
      distinct: ["city"],
      where: {
        city: {
          not: null,
        },
      },
    });

    // Combine and deduplicate
    const allCities = [
      ...hospitalCities.map((h) => h.city),
      ...profileCities.map((p) => p.city),
    ].filter((city): city is string => city !== null);

    // Remove duplicates and sort
    return Array.from(new Set(allCities)).sort();
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}

// Get top doctors
export async function getTopDoctors(limit: number = 6): Promise<TopDoctor[]> {
  const doctors = await prisma.doctor.findMany({
    where: {
      user: {
        isActive: true,
        isApproved: true,
      },
    },
    select: {
      id: true,
      specialization: true,
      experience: true,
      user: {
        select: {
          name: true,
          isApproved: true,
          profile: {
            select: {
              avatarUrl: true,
              genre: true,
              city: true,
            },
          },
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });

  const doctorsWithRatings = doctors
    .map((doctor) => {
      const ratings = doctor.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length
          : 0;

      return {
        id: doctor.id,
        name: doctor.user.name,
        specialization: doctor.specialization,
        avatarUrl: doctor.user.profile?.avatarUrl || null,
        isVerified: doctor.user?.isApproved,
        rating: Math.round(avgRating),
        reviews: ratings.length,
        genre: doctor.user?.profile?.genre ?? null,
        city: doctor.user.profile?.city,
        experience: doctor.experience,
      };
    })
    .filter((doctor) => doctor.reviews > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);

  return doctorsWithRatings;
}

// Get all specializations for dropdown
export async function getSpecializations(): Promise<string[]> {
  try {
    const specializations = await prisma.doctor.findMany({
      select: {
        specialization: true,
      },
      distinct: ["specialization"],
      where: {
        specialization: {
          not: "",
        },
      },
    });

    return specializations
      .map((s) => s.specialization)
      .filter((s): s is string => s !== null)
      .sort();
  } catch (error) {
    console.error("Error fetching specializations:", error);
    return [];
  }
}

export async function searchHealthcareItems(params: SearchParams) {
  const { query, type, specialization, city, limit = 10 } = params;

  if (!query || query.length < 2) {
    return { results: [] as SearchResult[] };
  }

  try {
    let results: SearchResult[] = [];

    if (type === "doctor") {
      const doctors = await prisma.doctor.findMany({
        where: {
          isVerified: true,
          user: {
            isActive: true,
            name: { contains: query, mode: "insensitive" },
            ...(city && city !== "all"
              ? { profile: { city: { contains: city, mode: "insensitive" } } }
              : {}),
          },
          ...(specialization && specialization !== "all" && { specialization }),
          ...(city && city !== "all" && { city }),
        },
        select: {
          id: true,
          specialization: true,
          hospital: {
            select: {
              city: true,
              logoUrl: true,
              name: true,
            },
          },
          user: {
            select: {
              name: true,
              profile: {
                select: {
                  avatarUrl: true,
                },
              },
              reviews: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
        take: limit,
      });

      results = doctors.map((doc) => {
        const ratings = doc.user.reviews?.map((r) => r.rating) || [];
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : null;

        return {
          id: doc.id,
          type: "doctor",
          name: doc.user.name,
          specialization: doc.specialization,
          city: doc.hospital?.city,
          imageUrl: doc.user.profile?.avatarUrl,
          rating: avgRating,
        };
      });
    } else if (type === "hospital") {
      const hospitals = await prisma.hospital.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
          ...(city && city !== "all" && { city }),
          isVerified: true,
        },
        select: {
          id: true,
          name: true,
          city: true,
          logoUrl: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        take: limit,
      });

      results = hospitals.map((hospital) => {
        const ratings = hospital.reviews?.map((r) => r.rating) || [];
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : null;

        return {
          id: hospital.id,
          type: "hospital",
          name: hospital.name,
          city: hospital.city,
          imageUrl: hospital.logoUrl,
          rating: avgRating,
        };
      });
    } else if (type === "department") {
      const departments = await prisma.department.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
          hospital: {
            isVerified: true,
            ...(city && city !== "all"
              ? { city: { contains: city, mode: "insensitive" } }
              : {}),
          },
        },
        select: {
          id: true,
          name: true,
          hospital: {
            select: {
              name: true,
              logoUrl: true,
            },
          },
        },
        take: limit,
      });

      // Transform the results to include hospitalName
      results = departments.map((dept) => ({
        id: dept.id,
        name: dept.name,
        type: "department" as const,
        hospitalName: dept.hospital?.name ?? null,
        hospitalImage: dept.hospital?.logoUrl ?? "",
      }));
    }

    return { results };
  } catch (error) {
    console.error("Search error:", error);
    throw new Error("Failed to perform search");
  }
}

export async function getHospitalById(
  id: string
): Promise<HospitalWithDetails | null> {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        admin: {
          include: {
            profile: true,
          },
        },
        departments: {
          include: {
            doctors: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
        doctors: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            department: true,
            reviews: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    profile: {
                      select: {
                        avatarUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: {
                    avatarUrl: true,
                  },
                },
              },
            },
          },
          where: {
            status: "APPROVED",
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!hospital) return null;

    const doctorsWithRating = hospital.doctors.map((doctor) => {
      const totalRating = doctor.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const avgRating =
        doctor.reviews.length > 0 ? totalRating / doctor.reviews.length : 0;

      return {
        id: doctor.id,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        experience: doctor.experience ?? undefined,
        education: doctor.education ?? undefined,
        isVerified: doctor.isVerified,
        consultationFee: doctor.consultationFee
          ? Number(doctor.consultationFee)
          : undefined,
        user: {
          id: doctor.user.id,
          name: doctor.user.name,
          email: doctor.user.email,
          profile: doctor.user.profile
            ? {
                address: doctor.user.profile.address ?? undefined,
                city: doctor.user.profile.city ?? undefined,
                state: doctor.user.profile.state ?? undefined,
                zipCode: doctor.user.profile.zipCode ?? undefined,
                country: doctor.user.profile.country ?? undefined,
                bio: doctor.user.profile.bio ?? undefined,
                avatarUrl: doctor.user.profile.avatarUrl ?? undefined,
                genre: doctor.user.profile.genre ?? undefined,
              }
            : undefined,
        },
        department: doctor.department
          ? {
              id: doctor.department.id,
              name: doctor.department.name,
            }
          : undefined,
        reviews: doctor.reviews.map((r) => ({
          id: r.id,
          title: r.title,
          content: r.content,
          rating: r.rating,
          likes: r.likes,
          dislikes: r.dislikes,
          createdAt: r.createdAt,
          author: {
            id: r.author.id,
            name: r.author.name,
            profile: r.author.profile?.avatarUrl
              ? { avatarUrl: r.author.profile.avatarUrl }
              : undefined,
          },
        })),
        avgRating,
      };
    });

    const totalRating = hospital.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const avgRating =
      hospital.reviews.length > 0 ? totalRating / hospital.reviews.length : 0;

    return {
      id: hospital.id,
      name: hospital.name,
      //   admin: hospital.admin,
      admin: {
        ...hospital.admin,
        profile: hospital.admin.profile
          ? {
              address: hospital.admin.profile.address ?? undefined,
              city: hospital.admin.profile.city ?? undefined,
              state: hospital.admin.profile.state ?? undefined,
              zipCode: hospital.admin.profile.zipCode ?? undefined,
              country: hospital.admin.profile.country ?? undefined,
              bio: hospital.admin.profile.bio ?? undefined,
              avatarUrl: hospital.admin.profile.avatarUrl ?? undefined,
              genre: hospital.admin.profile.genre ?? undefined,
            }
          : undefined,
      },
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
      zipCode: hospital.zipCode,
      country: hospital.country,
      phone: hospital.phone,
      email: hospital.email,
      website: hospital.website ?? undefined,
      description: hospital.description ?? undefined,
      logoUrl: hospital.logoUrl ?? undefined,
      isVerified: hospital.isVerified,
      status: hospital.status,
      createdAt: hospital.createdAt,
      updatedAt: hospital.updatedAt,
      doctors: doctorsWithRating,
      departments: hospital.departments.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description ?? undefined,
        doctors: d.doctors.map((doc) => ({
          id: doc.id,
          user: {
            id: doc.user.id,
            name: doc.user.name,
            email: doc.user.email,
            profile: doc.user.profile
              ? {
                  address: doc.user.profile.address ?? undefined,
                  city: doc.user.profile.city ?? undefined,
                  state: doc.user.profile.state ?? undefined,
                  zipCode: doc.user.profile.zipCode ?? undefined,
                  country: doc.user.profile.country ?? undefined,
                  bio: doc.user.profile.bio ?? undefined,
                  avatarUrl: doc.user.profile.avatarUrl ?? undefined,
                  genre: doc.user.profile.genre ?? undefined,
                }
              : undefined,
          },
        })),
      })),
      reviews: hospital.reviews.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        rating: r.rating,
        likes: r.likes,
        dislikes: r.dislikes,
        createdAt: r.createdAt,
        author: {
          id: r.author.id,
          name: r.author.name,
          profile: r.author.profile?.avatarUrl
            ? { avatarUrl: r.author.profile.avatarUrl }
            : undefined,
        },
      })),
      avgRating,
    };
  } catch (error) {
    console.error("Error fetching hospital:", error);
    return null;
  }
}

export async function getDepartmentById(
  id: string
): Promise<DepartmentWithDetails | null> {
  try {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        hospital: true,
        doctors: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            reviews: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    profile: {
                      select: {
                        avatarUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!department) return null;

    const doctorsWithRating = department.doctors.map((doctor) => {
      const totalRating = doctor.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const avgRating =
        doctor.reviews.length > 0 ? totalRating / doctor.reviews.length : 0;

      return {
        id: doctor.id,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        experience: doctor.experience ?? undefined,
        education: doctor.education ?? undefined,
        isVerified: doctor.isVerified,
        consultationFee: doctor.consultationFee
          ? Number(doctor.consultationFee)
          : undefined,
        user: {
          id: doctor.user.id,
          name: doctor.user.name,
          email: doctor.user.email,
          phone: doctor.user.phone,
          profile: doctor.user.profile
            ? {
                address: doctor.user.profile.address ?? undefined,
                city: doctor.user.profile.city ?? undefined,
                state: doctor.user.profile.state ?? undefined,
                zipCode: doctor.user.profile.zipCode ?? undefined,
                country: doctor.user.profile.country ?? undefined,
                bio: doctor.user.profile.bio ?? undefined,
                avatarUrl: doctor.user.profile.avatarUrl ?? undefined,
                genre: doctor.user.profile.genre ?? undefined,
              }
            : undefined,
        },
        reviews: doctor.reviews.map((r) => ({
          id: r.id,
          title: r.title,
          content: r.content,
          rating: r.rating,
          createdAt: r.createdAt,
          author: {
            id: r.author.id,
            name: r.author.name,
            profile: r.author.profile?.avatarUrl
              ? { avatarUrl: r.author.profile.avatarUrl }
              : undefined,
          },
        })),
        avgRating,
      };
    });

    return {
      id: department.id,
      name: department.name,
      description: department.description ?? undefined,
      hospital: {
        ...department.hospital,
        website: department.hospital?.website ?? "",
        description: department.hospital?.description ?? "",
        logoUrl: department.hospital?.logoUrl ?? "",
      },
      doctors: doctorsWithRating,
    };
  } catch (error) {
    console.error("Error fetching department:", error);
    return null;
  }
}
