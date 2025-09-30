"use server";

import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

function assertSuper(session: Session | null) {
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
}

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

/**
 * Change password for the currently logged-in SUPER_ADMIN.
 * - Verifies current password with bcrypt
 * - Updates password hash
 * - Invalidates all other sessions for this user
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const session = await getServerSession(authOptions);
  const dbUser = await getCurrentDbUser(session);

  assertSuper(session);

  const user = await prisma.user.findUnique({
    where: { id: dbUser?.id },
    select: { id: true, password: true },
  });

  if (!user || !user.password) {
    throw new Error("User not found");
  }

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    // Don’t reveal whether the user exists; just say invalid password
    throw new Error("Mot de passe actuel invalide.");
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    }),
    // Invalidate all sessions (forces re-login everywhere)
    prisma.session.deleteMany({
      where: { userId: user.id },
    }),
  ]);

  // Optional revalidation
  revalidatePath("/dashboard/superadmin/settings/security");
  return { ok: true };
}

/**
 * Permanently delete the currently logged-in SUPER_ADMIN account.
 * WARNING: This is irreversible.
 * Relations are configured with onDelete: Cascade in your schema, so
 * associated rows (sessions, accounts, profile, etc.) will be removed.
 */
export async function deleteAccount() {
  const session = await getServerSession(authOptions);
  assertSuper(session);

  const userId = session!.user!.id;
  if (!userId) throw new Error("Unauthorized");

  await prisma.user.delete({ where: { id: userId } });

  // Sessions are cascaded, but we can still revalidate UI
  revalidatePath("/");
  return { ok: true };
}
