import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface VerificationEmailProps {
  verificationLink: string;
  userName?: string;
  expiryHours?: number;
}

export const VerificationEmail = ({
  verificationLink,
  userName = "Cher patient",
  expiryHours = 24,
}: VerificationEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <Html>
      <Head />
      <Preview>
        Confirmez votre adresse email pour activer votre compte MITIC CARE
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-800 leading-relaxed">
          <Container className="max-w-[600px] mx-auto bg-gray-50 px-2">
            {/* Header */}
            <Section className="bg-gradient-to-r from-blue-600 to-blue-500 p-2 text-center flex items-center flex-col rounded-t-lg">
              <Row className="flex flex-row items-center text-center">
                <Column>
                  <Img
                    src={`${baseUrl}/logos/logo_mitic_dark.png`}
                    width="160"
                    height="34"
                    alt="MITIC CARE"
                  />
                </Column>
                <Column>
                  <Text className="font-bold text-4xl my-0">CARE</Text>
                </Column>
              </Row>
              <Heading className="text-black text-lg font-semibold m-0">
                Vérification de votre compte
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="bg-white p-2 text-center">
              <Img
                src={`${baseUrl}/email_verif_icon.png`}
                width="44"
                height="44"
                alt="Vérification"
                className="mx-auto my-1"
              />

              <Heading className="text-lg font-semibold text-gray-800 !my-1">
                Bienvenue sur MITIC CARE !
              </Heading>

              <Text className="text-sm font-medium text-gray-700 !my-0">
                Cher Patient,
              </Text>

              <Text className="text-base font-medium text-gray-700 !my-0.5">
                <strong>{userName}</strong>
              </Text>

              <Text className="text-sm text-gray-600 mb-2 px-2">
                Merci de vous être inscrit sur notre plateforme de santé. Pour
                finaliser votre inscription et accéder à tous nos services,
                veuillez confirmer votre adresse email.
              </Text>

              <Button
                href={verificationLink}
                className="bg-[#4b2883FF] text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-[#4b288355] transition-colors"
              >
                Confirmer mon email
              </Button>

              <Text className="text-xs text-gray-700 mt-5">
                Ce lien expire dans {expiryHours} heures.
              </Text>

              <Hr className="border-gray-200 my-3" />

              <Text className="text-xs text-gray-500 mb-5 !my-0">
                Si le bouton ne fonctionne pas, vous pouvez copier et coller le
                lien suivant dans votre navigateur :
              </Text>

              <Text className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-md p-3 mb-5 break-all">
                {verificationLink}
              </Text>

              <Section className="bg-gray-50 border-l-4 border-blue-600 p-4 text-left rounded-md">
                <Text className="text-sm text-gray-600 m-0">
                  <strong className="text-gray-800">
                    Information de sécurité :
                  </strong>{" "}
                  MITIC CARE ne vous demandera jamais vos informations
                  personnelles ou médicales par email. Si vous recevez un email
                  suspect, veuillez nous contacter immédiatement.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 p-2 text-center border-t border-gray-200 rounded-b-lg">
              <Text className="text-xs text-gray-500 mb-3 !my-0">
                Si vous n&apos;avez pas demandé cette inscription, veuillez
                ignorer cet email.
              </Text>

              <Row className="mb-5">
                <Column align="center">
                  <Link
                    href={`${baseUrl}/aide`}
                    className="text-xs text-blue-600 mx-3 no-underline hover:underline"
                  >
                    Aide
                  </Link>
                </Column>
                <Column align="center">
                  <Link
                    href={`${baseUrl}/confidentialite`}
                    className="text-xs text-blue-600 mx-3 no-underline hover:underline"
                  >
                    Confidentialité
                  </Link>
                </Column>
                <Column align="center">
                  <Link
                    href={`${baseUrl}/conditions`}
                    className="text-xs text-blue-600 mx-3 no-underline hover:underline"
                  >
                    Conditions d&apos;utilisation
                  </Link>
                </Column>
              </Row>

              <Text className="text-sm text-gray-500 mb-3">
                &copy; 2024 MITIC CARE. Tous droits réservés.
              </Text>

              <Text className="text-xs text-gray-400 mt-5">
                MITIC CARE SARL
                <br />
                Hamdallaye ACI 2000, Bamako, MALI
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerificationEmail;
