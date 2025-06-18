/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/prisma";
import {
  DepartmentWithDetails,
  HospitalWithDetails,
  SearchResult,
  TopDoctor,
} from "@/types/ui-actions.types";

export type SearchFilters = {
  type: "doctor" | "hospital" | "department";
  query?: string;
  specialization?: string;
  city?: string;
  minRating?: number;
  gender?: string;
  availability?: string;
  experience?: string;
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
    ratings: { value: number; count: number }[];
    genders: { value: string; count: number }[];
    experienceLevels: { value: string; count: number }[];
  };
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

  const skip = (page - 1) * limit;

  try {
    if (type === "doctor") {
      // Build doctor filters
      const doctorFilters: any = {
        AND: [
          // Search by name if query is provided
          query
            ? {
                user: {
                  name: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              }
            : {},
          // Filter by specialization if provided
          specialization && specialization !== "all"
            ? {
                specialization: {
                  contains: specialization,
                  mode: "insensitive",
                },
              }
            : {},
          // Filter by city if provided
          city && city !== "all"
            ? {
                OR: [
                  {
                    user: {
                      profile: {
                        city: {
                          contains: city,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                  {
                    hospital: {
                      city: {
                        contains: city,
                        mode: "insensitive",
                      },
                    },
                  },
                ],
              }
            : {},
          // Filter by gender if provided
          gender && gender !== "all"
            ? {
                user: {
                  profile: {
                    genre: gender,
                  },
                },
              }
            : {},
          // Filter by experience if provided
          experience && experience !== "all"
            ? {
                experience: {
                  contains: experience,
                  mode: "insensitive",
                },
              }
            : {},
          // Only include verified doctors
          {
            isVerified: true,
          },
        ],
      };

      // Determine sort order
      let orderBy: any = {
        user: {
          name: "asc",
        },
      };

      if (sortBy === "rating_high") {
        // We'll handle this after fetching since it's calculated
      } else if (sortBy === "price_low") {
        orderBy = {
          consultationFee: "asc",
        };
      } else if (sortBy === "price_high") {
        orderBy = {
          consultationFee: "desc",
        };
      } else if (sortBy === "experience_high") {
        orderBy = {
          experience: "desc",
        };
      }

      // Count total results
      totalCount = await prisma.doctor.count({
        where: doctorFilters,
      });

      // Fetch doctors
      doctors = await prisma.doctor.findMany({
        where: doctorFilters,
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          hospital: true,
          department: true,
          availabilities: true,
          reviews: true,
        },
        orderBy,
        skip,
        take: limit,
      });

      // Calculate average rating for each doctor
      doctors = doctors.map((doctor) => {
        const ratings = doctor.reviews.map((r) => r.rating);
        const doctorReviews = doctor.reviews.length;
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length
            : 0;

        return {
          ...doctor,
          avgRating,
          doctorReviews,
          experience: doctor.experience ?? undefined,
        };
      });

      // Sort by rating if requested
      if (sortBy === "rating_high") {
        doctors.sort((a, b) => b.avgRating - a.avgRating);
      }

      // Filter by minimum rating if provided
      if (minRating) {
        doctors = doctors.filter((doctor) => doctor.avgRating >= minRating);
      }

      // Get facets (for filters)
      // Specializations facet
      const specializationFacets = await prisma.doctor.groupBy({
        by: ["specialization"],
        where: {
          specialization: {
            not: "",
          },
          isVerified: true,
        },
        _count: {
          id: true,
        },
      });

      facets.specializations = specializationFacets
        .filter((f) => f.specialization !== null)
        .map((f) => ({
          name: f.specialization as string,
          count: f._count.id,
        }))
        .sort((a, b) => b.count - a.count);

      // Cities facet
      const cityFacets = await prisma.hospital.groupBy({
        by: ["city"],
        where: {
          city: {
            not: "",
          },
        },
        _count: {
          id: true,
        },
      });

      facets.cities = cityFacets
        .filter((f) => f.city !== null)
        .map((f) => ({
          name: f.city as string,
          count: f._count.id,
        }))
        .sort((a, b) => b.count - a.count);

      // Gender facets
      const genderFacets = await prisma.userProfile.groupBy({
        by: ["genre"],
        where: {
          user: {
            doctor: {
              isVerified: true,
            },
          },
        },
        _count: {
          id: true,
        },
      });

      facets.genders = genderFacets
        .filter((f) => f.genre !== null)
        .map((f) => ({
          value: f.genre!,
          count: f._count.id,
        }));

      // Experience levels facet (simplified)
      facets.experienceLevels = [
        { value: "1-5", count: 0 },
        { value: "5-10", count: 0 },
        { value: "10+", count: 0 },
      ];
    } else if (type === "hospital") {
      // Hospital filters
      const hospitalFilters: any = {
        AND: [
          // Search by name if query is provided
          query
            ? {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              }
            : {},
          // Filter by city if provided
          city && city !== "all"
            ? {
                city: {
                  contains: city,
                  mode: "insensitive",
                },
              }
            : {},
          // Only include verified hospitals
          {
            isVerified: true,
          },
        ],
      };

      // Count total results
      totalCount = await prisma.hospital.count({
        where: hospitalFilters,
      });

      // Fetch hospitals
      hospitals = await prisma.hospital.findMany({
        where: hospitalFilters,
        include: {
          departments: true,
          doctors: {
            include: {
              user: true,
            },
            where: {
              isVerified: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
        skip,
        take: limit,
      });

      // Get facets for hospitals
      const cityFacets = await prisma.hospital.groupBy({
        by: ["city"],
        where: {
          city: {
            not: "",
          },
          isVerified: true,
        },
        _count: {
          id: true,
        },
      });

      facets.cities = cityFacets
        .filter((f) => f.city !== null)
        .map((f) => ({
          name: f.city as string,
          count: f._count.id,
        }))
        .sort((a, b) => b.count - a.count);
    } else if (type === "department") {
      // Department filters
      const departmentFilters: any = {
        AND: [
          // Search by name if query is provided
          query
            ? {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              }
            : {},
          // Filter by hospital city if city is provided
          city && city !== "all"
            ? {
                hospital: {
                  city: {
                    contains: city,
                    mode: "insensitive",
                  },
                },
              }
            : {},
        ],
      };

      // Count total results
      totalCount = await prisma.department.count({
        where: departmentFilters,
      });

      // Fetch departments
      departments = await prisma.department.findMany({
        where: departmentFilters,
        include: {
          hospital: true,
          doctors: {
            include: {
              user: true,
            },
            where: {
              isVerified: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
        skip,
        take: limit,
      });

      // Get facets for departments
      const cityFacets = await prisma.hospital.groupBy({
        by: ["city"],
        where: {
          city: {
            not: "",
          },
          isVerified: true,
        },
        _count: {
          id: true,
        },
      });

      facets.cities = cityFacets
        .filter((f) => f.city !== null)
        .map((f) => ({
          name: f.city as string,
          count: f._count.id,
        }))
        .sort((a, b) => b.count - a.count);
    }

    return {
      doctors,
      hospitals,
      departments,
      totalCount,
      facets,
    };
  } catch (error) {
    console.error("Error searching healthcare:", error);
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

export type SearchParams = {
  query: string;
  type: "doctor" | "hospital" | "department";
  specialization?: string;
  city?: string;
  limit?: number;
};

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
          user: {
            name: { contains: query, mode: "insensitive" },
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
