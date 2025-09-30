"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";
import { UserRole, UserGenre } from "@prisma/client";

/** Fetch the current DB user using session id OR email. */
async function getCurrentDbUser(session: Session | null) {
  if (!session?.user) return null;

  const { id, email } = session.user as { id?: string; email?: string };

  // Prefer id if provided; otherwise fallback to email
  if (id) {
    const byId = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (byId) return byId;
  }
  if (email) {
    const byEmail = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    if (byEmail) return byEmail;
  }
  return null;
}

/** Assert SUPER_ADMIN using session first, otherwise DB row. */
function assertSuper(session: Session | null, dbRole?: UserRole | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionRole = (session?.user as any)?.role as UserRole | undefined;
  if (sessionRole === "SUPER_ADMIN") return;
  if (dbRole === "SUPER_ADMIN") return;
  throw new Error("Unauthorized");
}

/** Load superadmin from DB with profile (robust to missing session.user.id). */
export async function getUserAdminProfile() {
  const session = await getServerSession(authOptions);
  const dbUser = await getCurrentDbUser(session);

  if (!dbUser) throw new Error("User not found");

  // Now assert role safely (session OR DB)
  assertSuper(session, dbUser.role);

  return {
    user: {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role as UserRole,
      dateOfBirth: dbUser.dateOfBirth ?? null,
      createdAt: dbUser.createdAt,
    },
    profile: {
      bio: dbUser.profile?.bio ?? "",
      address: dbUser.profile?.address ?? "",
      city: dbUser.profile?.city ?? "",
      state: dbUser.profile?.state ?? "",
      zipCode: dbUser.profile?.zipCode ?? "",
      country: dbUser.profile?.country ?? "",
      genre: (dbUser.profile?.genre as UserGenre | null) ?? null,
      avatarUrl: dbUser.profile?.avatarUrl ?? "",
    },
  };
}

/**
 * Update the CURRENT superadmin (ignore incoming id to avoid cross-account updates).
 * - Keeps phone unchanged unless you choose to add it to the payload (your schema requires non-null).
 * - Upserts User.profile per your Prisma schema.
 */
export async function updateUserAdmin(input: {
  name: string;
  email: string;
  role: UserRole;
  isApproved?: boolean; // optional if you want to allow toggling
  isActive?: boolean; // optional if you want to allow toggling
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
  const dbUser = await getCurrentDbUser(session);
  if (!dbUser) throw new Error("Unauthorized");
  assertSuper(session, dbUser.role);

  const {
    name,
    email,
    role,
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

  // Build safe user update
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userData: any = {
    name,
    email,
    role,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
  };

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      ...userData,
      profile: {
        upsert: {
          create: {
            bio: bio ?? "",
            address: address ?? "",
            city: city ?? "",
            state: state ?? "",
            zipCode: zipCode ?? "",
            country: country ?? "",
            genre: genre ?? null,
            ...(avatarUrl ? { avatarUrl } : {}),
          },
          update: {
            bio: bio ?? "",
            address: address ?? "",
            city: city ?? "",
            state: state ?? "",
            zipCode: zipCode ?? "",
            country: country ?? "",
            genre: genre ?? null,
            ...(avatarUrl ? { avatarUrl } : {}),
          },
        },
      },
    },
  });

  revalidatePath("/dashboard/superadmin/settings/profile");
  return { success: true };
}
