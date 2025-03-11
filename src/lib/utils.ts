import { UserRole } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getProfileLink(role: UserRole) {
  switch (role) {
    case "hospital_admin":
      return "/dashboard/hopital_admin/settings/profile";
    case "independent_doctor":
      return "/dashboard/independent_doctor/settings/profile";
    case "hospital_doctor":
      return "/dashboard/hospital_doctor/settings/profile";
    case "patient":
      return "/dashboard/patient/settings/profile";
    default:
      return "/";
  }
}
