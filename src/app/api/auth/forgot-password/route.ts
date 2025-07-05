import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateResetToken } from "@/lib/token";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "L'adresse email est requise." },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        {
          message:
            "Si cette adresse email existe, vous recevrez un code de réinitialisation.",
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = await generateResetToken(normalizedEmail);

    // Send password reset email
    await sendPasswordResetEmail(user.name, normalizedEmail, resetToken.token);

    return NextResponse.json(
      { message: "Code de réinitialisation envoyé par email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
