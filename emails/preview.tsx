import { VerificationEmail } from "./verification-email";

export default function PreviewVerificationEmail() {
  return (
    <VerificationEmail
      verificationLink="https://mitic-care.fr/verify-email?token=example-token-12345"
      userName="Jean Dupont"
      expiryHours={24}
    />
  );
}
