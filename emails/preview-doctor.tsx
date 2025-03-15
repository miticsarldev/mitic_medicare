import VerificationEmailDoctor from "./verification-email-doctor";

export default function PreviewVerificationEmail() {
  return (
    <VerificationEmailDoctor
      verificationLink="https://mitic-care.fr/verify-email?token=example-token-12345"
      doctorName="Jean Dupont"
      expiryHours={24}
    />
  );
}
