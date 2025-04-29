import { UserRole } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import prisma from "./prisma";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getProfileLink(role: UserRole) {
  switch (role) {
    case "HOSPITAL_ADMIN":
      return "/dashboard/hopital_admin/settings/profile";
    case "INDEPENDENT_DOCTOR":
      return "/dashboard/independent_doctor/settings/profile";
    case "HOSPITAL_DOCTOR":
      return "/dashboard/hospital_doctor/settings/profile";
    case "PATIENT":
      return "/dashboard/patient/settings/profile";
    default:
      return "/";
  }
}

export const getVerificationTokenByEmail = async (identifier: string) => {
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: identifier,
      },
    });

    return verificationToken;
  } catch (error) {
    console.log(error);
  }
};

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: token,
      },
    });

    return verificationToken;
  } catch (error) {
    console.log(error);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
