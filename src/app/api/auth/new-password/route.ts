import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordResetSuccessEmail } from "@/lib/email";

/** Validate token (GET /api/auth/new-password?token=...) */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token)
    return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt)
    return NextResponse.json(
      { valid: false, reason: "not_found" },
      { status: 200 }
    );

  const expired = vt.expires && vt.expires < new Date();
  return NextResponse.json({
    valid: !expired,
    email: vt.identifier,
    expires: vt.expires,
    reason: expired ? "expired" : "ok",
  });
}

/** Set password (POST { token, password }) */
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Missing token or password" },
        { status: 400 }
      );
    }

    const vt = await prisma.verificationToken.findUnique({ where: { token } });
    if (!vt)
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    if (vt.expires && vt.expires < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    // identifier = email (as in your invite code)
    const user = await prisma.user.findUnique({
      where: { email: vt.identifier },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const hashed = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashed, isActive: true },
      });
      await tx.verificationToken.delete({ where: { token } });
    });

    // (Optional) notify success with your existing template
    try {
      await sendPasswordResetSuccessEmail(user.name ?? "Patient", user.email);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to set password" },
      { status: 500 }
    );
  }
}
