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

interface VerificationEmailDoctorProps {
  verificationLink: string;
  doctorName?: string;
  expiryHours?: number;
}

export const VerificationEmailDoctor = ({
  verificationLink,
  doctorName = "Cher médecin",
  expiryHours = 48,
}: VerificationEmailDoctorProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <Html>
      <Head />
      <Preview>
        Confirmation de votre inscription en tant que médecin sur MITICCARE
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-800 leading-relaxed">
          <Container className="max-w-[600px] mx-auto bg-gray-50 px-2">
            {/* Header */}
            <Section className="bg-gradient-to-r from-green-600 to-green-500 p-2 text-center flex items-center flex-col rounded-t-lg">
              <Row className="flex flex-row items-center text-center">
                <Column>
                  <Img
                    src={`${baseUrl}/logos/logo_mitic_dark.png`}
                    width="160"
                    height="34"
                    alt="MITICCARE"
                  />
                </Column>
                <Column>
                  <Text className="font-bold text-4xl my-0">CARE</Text>
                </Column>
              </Row>
              <Heading className="text-black text-lg font-semibold m-0">
                Vérification de votre compte médecin
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="bg-white p-2 text-center">
              <Img
                src={`${baseUrl}/doctor_verification_icon.jpg`}
                width="44"
                height="44"
                alt="Vérification"
                className="mx-auto my-1"
              />

              <Heading className="text-lg font-semibold text-gray-800 !my-1">
                Bienvenue sur MITICCARE !
              </Heading>

              <Text className="text-sm font-medium text-gray-700 !my-0">
                Cher Médecin,
              </Text>

              <Text className="text-base font-medium text-gray-700 !my-0.5">
                <strong>{doctorName}</strong>
              </Text>

              <Text className="text-sm text-gray-600 mb-2 px-2">
                Merci de vous être inscrit sur notre plateforme de santé. Pour
                finaliser votre inscription, veuillez confirmer votre adresse
                email en cliquant sur le bouton ci-dessous.
              </Text>

              <Button
                href={verificationLink}
                className="bg-green-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors"
              >
                Confirmer mon email
              </Button>

              <Text className="text-xs text-gray-700 mt-5">
                Ce lien expire dans {expiryHours} heures.
              </Text>

              <Hr className="border-gray-200 my-3" />

              <Section className="bg-amber-50 border-l-4 border-amber-500 p-4 text-left rounded-md mb-4">
                <Text className="text-sm text-gray-700 m-0">
                  <strong className="text-amber-700">
                    Information importante :
                  </strong>{" "}
                  Après confirmation de votre email, votre compte devra être
                  vérifié par notre équipe avant que vous puissiez y accéder. Ce
                  processus peut prendre 24 à 48 heures ouvrables.
                </Text>
              </Section>

              <Section className="bg-gray-50 p-4 text-left rounded-md mb-4">
                <Text className="text-sm text-gray-700 font-semibold m-0 mb-2">
                  Documents nécessaires pour la vérification :
                </Text>
                <Text className="text-sm text-gray-600 m-0 mb-1">
                  • Copie de votre diplôme médical
                </Text>
                <Text className="text-sm text-gray-600 m-0 mb-1">
                  • Numéro d&apos;inscription à l&apos;ordre des médecins
                </Text>
                <Text className="text-sm text-gray-600 m-0 mb-1">
                  • Pièce d&apos;identité professionnelle
                </Text>
                <Text className="text-sm text-gray-600 m-0 mt-2">
                  Vous pourrez télécharger ces documents dans votre espace
                  personnel après la confirmation de votre email.
                </Text>
              </Section>

              <Text className="text-xs text-gray-500 mb-5 !my-0">
                Si le bouton ne fonctionne pas, vous pouvez copier et coller le
                lien suivant dans votre navigateur :
              </Text>

              <Text className="text-xs text-green-600 bg-green-50 border border-green-100 rounded-md p-3 mb-5 break-all">
                {verificationLink}
              </Text>

              <Section className="bg-gray-50 border-l-4 border-green-600 p-4 text-left rounded-md">
                <Text className="text-sm text-gray-600 m-0">
                  <strong className="text-gray-800">
                    Information de sécurité :
                  </strong>{" "}
                  MITICCARE ne vous demandera jamais vos informations
                  personnelles ou médicales par email. Si vous recevez un email
                  suspect, veuillez nous contacter immédiatement.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 p-2 text-center border-t border-gray-200 rounded-b-lg">
              <Text className="text-xs text-gray-500 mb-3 !my-0">
                Si vous avez des questions concernant le processus de
                vérification, veuillez contacter notre équipe à{" "}
                <Link
                  href="mailto:verification@miticsarl.com"
                  className="text-green-600"
                >
                  verification@miticsarl.com
                </Link>
              </Text>

              <Row className="mb-5">
                <Column align="center">
                  <Link
                    href={`${baseUrl}/aide`}
                    className="text-xs text-green-600 mx-3 no-underline hover:underline"
                  >
                    Aide
                  </Link>
                </Column>
                <Column align="center">
                  <Link
                    href={`${baseUrl}/confidentialite`}
                    className="text-xs text-green-600 mx-3 no-underline hover:underline"
                  >
                    Confidentialité
                  </Link>
                </Column>
                <Column align="center">
                  <Link
                    href={`${baseUrl}/conditions`}
                    className="text-xs text-green-600 mx-3 no-underline hover:underline"
                  >
                    Conditions d&apos;utilisation
                  </Link>
                </Column>
              </Row>

              <Text className="text-sm text-gray-500 mb-3">
                &copy; 2024 MITICCARE. Tous droits réservés.
              </Text>

              <Text className="text-xs text-gray-400 mt-5">
                MITICCARE
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

export default VerificationEmailDoctor;
