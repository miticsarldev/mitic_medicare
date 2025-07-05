import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/hash";
import prisma from "@/lib/prisma";
import { sendPasswordResetSuccessEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Tous les champs sont requis." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Find and verify the reset token
    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token: code,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Code invalide ou expiré." },
        { status: 400 }
      );
    }

    // Get user info for the success email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé." },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    // Delete the used reset token
    await prisma.verificationToken.delete({
      where: { id: resetToken.id },
    });

    // Delete all other reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });

    // Send success confirmation email
    try {
      await sendPasswordResetSuccessEmail(user.name, normalizedEmail);
    } catch (emailError) {
      console.error("Failed to send success email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { message: "Mot de passe réinitialisé avec succès." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
