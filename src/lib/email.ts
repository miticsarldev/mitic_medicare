import transporter from "@/lib/transporter";
import {
  getPasswordResetCodeEmailTemplate,
  getPasswordResetSuccessEmailTemplate,
  getVerificationEmailTemplate,
} from "./emailTemplate";
import { UserRole } from "@prisma/client";

export async function sendVerificationEmail(
  name: string,
  email: string,
  token: string,
  userRole: UserRole = "PATIENT",
  hospitalName?: string
) {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${token}&role=${userRole}`;
  let htmlContent: string;
  if (userRole === "PATIENT") {
    htmlContent = await getVerificationEmailTemplate(
      name,
      verificationLink,
      "PATIENT",
      1
    );
  } else if (userRole === "INDEPENDENT_DOCTOR") {
    htmlContent = await getVerificationEmailTemplate(
      name,
      verificationLink,
      "INDEPENDENT_DOCTOR",
      1
    );
  } else {
    htmlContent = await getVerificationEmailTemplate(
      name,
      verificationLink,
      "HOSPITAL_ADMIN",
      1,
      hospitalName
    );
  }

  const mailOptions = {
    from: `"MITIC CARE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "MITIC CARE - Confirmation d'Email",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${email}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
  }
}

export async function sendPasswordResetEmail(
  name: string,
  email: string,
  token: string
) {
  const htmlContent = await getPasswordResetCodeEmailTemplate(
    name,
    token,
    15 // expires minutes
  );

  const mailOptions = {
    from: `"MITIC CARE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "MITIC CARE - Code de réinitialisation de mot de passe",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${email}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
  }
}

export async function sendPasswordResetSuccessEmail(
  name: string,
  email: string
) {
  const htmlContent = await getPasswordResetSuccessEmailTemplate(name);

  const mailOptions = {
    from: `"MITIC CARE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "MITIC CARE – Votre mot de passe a été réinitialisé avec succès",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${email}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
  }
}
