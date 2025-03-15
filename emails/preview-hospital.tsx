import VerificationEmailHospital from "./verification-email-hospital";

export default function PreviewVerificationEmail() {
  return (
    <VerificationEmailHospital
      verificationLink="https://mitic-care.fr/verify-email?token=example-token-12345"
      adminName="Cher administrateur"
      hospitalName="votre établissement"
      expiryHours={24}
    />
  );
}
