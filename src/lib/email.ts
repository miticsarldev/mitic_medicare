import transporter from "@/lib/transporter";
import { getVerificationEmailTemplate } from "./emailTemplate";
import { UserRole } from "@prisma/client";

export async function sendVerificationEmail(
  name: string,
  email: string,
  token: string,
  userRole: UserRole = "patient",
  hospitalName?: string
) {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${token}&role=${userRole}`;
  let htmlContent: string;
  if (userRole === "patient") {
    htmlContent = await getVerificationEmailTemplate(
      name,
      verificationLink,
      "patient",
      1
    );
  } else if (userRole === "independent_doctor") {
    htmlContent = await getVerificationEmailTemplate(
      name,
      verificationLink,
      "independent_doctor",
      1
    );
  } else {
    htmlContent = await getVerificationEmailTemplate(
      name,
      verificationLink,
      "hospital_admin",
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
