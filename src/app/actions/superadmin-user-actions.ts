"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserRole, UserGenre } from "@prisma/client";

import type { Session } from "next-auth";

function assertSuper(session: Session | null) {
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getUserAdminProfile() {
  const session = await getServerSession(authOptions);
  assertSuper(session);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = session.user;

  if (!user) throw new Error("User not found");

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      isApproved: user.isApproved,
      dateOfBirth: user.dateOfBirth,
      createdAt: user.createdAt,
    },
    profile: {
      bio: user.userProfile?.bio ?? "",
      address: user.userProfile?.address ?? "",
      city: user.userProfile?.city ?? "",
      state: user.userProfile?.state ?? "",
      zipCode: user.userProfile?.zipCode ?? "",
      country: user.userProfile?.country ?? "",
      genre: user.userProfile?.genre ?? null,
      avatarUrl: user.userProfile?.avatarUrl ?? "",
    },
  };
}

export async function updateUserAdmin(input: {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isApproved: boolean;
  isActive: boolean;
  dateOfBirth?: string | null;
  // profile
  bio?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  genre?: UserGenre | null;
  avatarUrl?: string | null;
}) {
  const session = await getServerSession(authOptions);
  assertSuper(session);

  const {
    id,
    name,
    email,
    phone,
    role,
    isApproved,
    isActive,
    dateOfBirth,
    bio,
    address,
    city,
    state,
    zipCode,
    country,
    genre,
    avatarUrl,
  } = input;

  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      phone: phone ?? undefined,
      role,
      isApproved,
      isActive,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      profile: {
        upsert: {
          create: {
            bio: bio ?? "",
            address: address ?? "",
            city: city ?? "",
            state: state ?? "",
            zipCode: zipCode ?? "",
            country: country ?? "",
            genre: (genre as UserGenre) ?? null,
            ...(avatarUrl ? { avatarUrl } : {}),
          },
          update: {
            bio: bio ?? "",
            address: address ?? "",
            city: city ?? "",
            state: state ?? "",
            zipCode: zipCode ?? "",
            country: country ?? "",
            genre: (genre as UserGenre) ?? null,
            ...(avatarUrl ? { avatarUrl } : {}),
          },
        },
      },
    },
  });

  revalidatePath(`/dashboard/superadmin/settings/profile`);
  return { success: true };
}
