import transporter from "@/lib/transporter";
import {
  getApprovalEmailTemplate,
  getPasswordResetCodeEmailTemplate,
  getPasswordResetSuccessEmailTemplate,
  getPatientWelcomeEmailTemplate,
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

export async function sendApprovingEmail(
  name: string,
  email: string,
  userRole: UserRole = "INDEPENDENT_DOCTOR",
  hospitalName: string
) {
  const subject = "MITIC CARE – Compte approuvé";
  let htmlContent: string;
  if (userRole === "INDEPENDENT_DOCTOR") {
    htmlContent = await getApprovalEmailTemplate(
      name,
      hospitalName,
      "INDEPENDENT_DOCTOR"
    );
  } else if (userRole === "HOSPITAL_ADMIN") {
    htmlContent = await getApprovalEmailTemplate(
      name,
      hospitalName,
      "HOSPITAL_ADMIN"
    );
  } else {
    return;
  }

  const mailOptions = {
    from: `"MITIC CARE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email d'approbation envoyé à ${email}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email d'approbation:", error);
  }
}

export async function sendPatientWelcomeEmail(opts: {
  name: string;
  email: string;
  setPasswordUrl?: string; // e.g. /auth/new-password?token=...
  loginUrl?: string; // e.g. /login
}) {
  const { name, email, setPasswordUrl, loginUrl } = opts;

  const htmlContent = await getPatientWelcomeEmailTemplate({
    name,
    setPasswordUrl,
    loginUrl,
  });

  const subject = setPasswordUrl
    ? "MITIC CARE – Créez votre mot de passe"
    : "MITIC CARE – Bienvenue";

  const mailOptions = {
    from: `"MITIC CARE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenue envoyé à ${email}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email de bienvenue:", error);
  }
}
