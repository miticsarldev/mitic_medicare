import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface ApprovalEmailProps {
  name: string;
  hospitalName?: string;
  userRole: "INDEPENDENT_DOCTOR" | "HOSPITAL_ADMIN";
}

export const ApprovalEmail = ({
  name,
  hospitalName,
  userRole,
}: ApprovalEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const isHospitalAdmin = userRole === "HOSPITAL_ADMIN";

  const title = isHospitalAdmin
    ? `Votre établissement ${hospitalName} a été approuvé !`
    : "Votre compte médecin a été approuvé !";

  const intro = isHospitalAdmin
    ? `Félicitations ${name}, votre établissement ${hospitalName} a été approuvé avec succès.`
    : `Félicitations Dr. ${name}, votre compte a été approuvé avec succès.`;

  const body = isHospitalAdmin
    ? `Vous pouvez dès à présent accéder à votre espace administrateur pour gérer ${hospitalName}.`
    : `Vous pouvez maintenant accéder à votre espace médecin et commencer à utiliser MITIC CARE.`;

  return (
    <Html>
      <Head />
      <Preview>Approbation de votre compte MITIC CARE</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-800 leading-relaxed">
          <Container className="max-w-[600px] mx-auto bg-white px-4 rounded-md">
            <Section className="text-center py-4 border-b border-gray-200">
              <Img
                src={`${baseUrl}/logos/logo_mitic_dark.png`}
                width="160"
                height="34"
                alt="MITIC CARE"
                className="mx-auto"
              />
              <Heading className="text-lg font-semibold mt-2">{title}</Heading>
            </Section>

            <Section className="p-4 text-center">
              <Text className="text-base font-medium text-gray-700 mb-2">
                {intro}
              </Text>

              <Text className="text-sm text-gray-600 mb-4">{body}</Text>

              <Button
                href={baseUrl}
                className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-purple-700 transition-colors"
              >
                Accéder à la plateforme
              </Button>

              <Hr className="border-gray-200 my-4" />

              <Text className="text-xs text-gray-500">
                Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre
                navigateur :
              </Text>
              <Text className="text-xs text-purple-600 break-all bg-purple-50 border border-purple-100 p-3 rounded-md my-2">
                {baseUrl}
              </Text>
            </Section>

            <Section className="bg-gray-100 p-4 text-center text-xs text-gray-500 border-t border-gray-200">
              <Text className="mb-2">
                Pour toute assistance, contactez-nous à
                <Link
                  href="mailto:contact@miticsarlml.com"
                  className="text-purple-600"
                >
                  contact@miticsarlml
                </Link>
              </Text>
              <Text>
                &copy; 2025 MITIC CARE - Hamdallaye ACI 2000, Bamako, MALI
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ApprovalEmail;
