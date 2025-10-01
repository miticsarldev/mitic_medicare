export const FILTERS_BY_TYPE = {
  doctor: {
    // filters supported in sidebar for doctors
    fields: [
      "specialization",
      "city",
      "minRating",
      "gender",
      "experience",
      "sortBy",
    ] as const,
    sortBy: [
      "name_az",
      "rating_high",
      "reviews_high",
      "fee_low",
      "fee_high",
      "experience_high",
      "recently_added",
    ] as const,
  },
  hospital: {
    fields: ["city", "minRating", "sortBy"] as const,
    sortBy: [
      "name_az",
      "rating_high",
      "reviews_high",
      "doctors_high",
      "departments_high",
      "recently_added",
    ] as const,
  },
  department: {
    fields: ["city", "sortBy"] as const,
    sortBy: [
      "name_az",
      "doctors_high",
      "hospital_az",
      "recently_added",
    ] as const,
  },
} as const;

export type AllowedType = keyof typeof FILTERS_BY_TYPE;
export type DoctorSortBy = (typeof FILTERS_BY_TYPE.doctor.sortBy)[number];
export type HospitalSortBy = (typeof FILTERS_BY_TYPE.hospital.sortBy)[number];
export type DepartmentSortBy =
  (typeof FILTERS_BY_TYPE.department.sortBy)[number];
