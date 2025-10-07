import {
  Body,
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

interface PasswordResetEmailProps {
  resetCode: string;
  userName?: string;
  expiryMinutes?: number;
}

export const PasswordResetEmail = ({
  resetCode,
  userName = "Cher utilisateur",
  expiryMinutes = 15,
}: PasswordResetEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <Html>
      <Head />
      <Preview>Réinitialisation de votre mot de passe MITICCARE</Preview>
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
                    alt="MITICCARE"
                  />
                </Column>
                <Column>
                  <Text className="font-bold text-4xl my-0 text-white">
                    CARE
                  </Text>
                </Column>
              </Row>
              <Heading className="text-white text-lg font-semibold m-0">
                Réinitialisation de votre mot de passe
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="bg-white p-2 text-center">
              <Img
                src={`${baseUrl}/security_icon.png`}
                width="44"
                height="44"
                alt="Sécurité"
                className="mx-auto my-1"
              />
              <Heading className="text-lg font-semibold text-gray-800 !my-1">
                Demande de réinitialisation
              </Heading>
              <Text className="text-sm font-medium text-gray-700 !my-0">
                Bonjour,
              </Text>
              <Text className="text-base font-medium text-gray-700 !my-0.5">
                <strong>{userName}</strong>
              </Text>
              <Text className="text-sm text-gray-600 mb-2 px-2">
                Vous avez demandé la réinitialisation de votre mot de passe sur
                MITICCARE. Utilisez le code de vérification ci-dessous pour
                procéder à la réinitialisation.
              </Text>

              {/* Reset Code Display */}
              <Section className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 my-6">
                <Text className="text-sm text-gray-600 m-0 mb-2">
                  Votre code de vérification :
                </Text>
                <Text className="text-3xl font-bold text-blue-600 tracking-widest m-0 mb-2 font-mono">
                  {resetCode}
                </Text>
                <Text className="text-xs text-gray-500 m-0">
                  Ce code expire dans {expiryMinutes} minutes
                </Text>
              </Section>

              <Text className="text-sm text-gray-600 mb-4 px-2">
                Saisissez ce code sur la page de réinitialisation pour créer
                votre nouveau mot de passe.
              </Text>

              <Hr className="border-gray-200 my-3" />

              <Section className="bg-amber-50 border-l-4 border-amber-500 p-4 text-left rounded-md mb-4">
                <Text className="text-sm text-gray-700 m-0">
                  <strong className="text-amber-700">Attention :</strong> Si
                  vous n&apos;avez pas demandé cette réinitialisation, ignorez
                  cet email. Votre mot de passe actuel reste inchangé et
                  sécurisé.
                </Text>
              </Section>

              <Section className="bg-gray-50 p-4 text-left rounded-md mb-4">
                <Text className="text-sm text-gray-700 font-semibold m-0 mb-2">
                  Conseils pour un mot de passe sécurisé :
                </Text>
                <Text className="text-sm text-gray-600 m-0 mb-1">
                  • Au moins 8 caractères
                </Text>
                <Text className="text-sm text-gray-600 m-0 mb-1">
                  • Mélange de majuscules et minuscules
                </Text>
                <Text className="text-sm text-gray-600 m-0 mb-1">
                  • Inclure des chiffres et caractères spéciaux
                </Text>
                <Text className="text-sm text-gray-600 m-0 mt-2">
                  • Éviter les informations personnelles évidentes
                </Text>
              </Section>

              <Section className="bg-red-50 border-l-4 border-red-500 p-4 text-left rounded-md">
                <Text className="text-sm text-gray-600 m-0">
                  <strong className="text-red-700">
                    Information de sécurité :
                  </strong>{" "}
                  MITICCARE ne vous demandera jamais votre mot de passe par
                  email. Ne partagez jamais ce code avec qui que ce soit. Si
                  vous recevez un email suspect, contactez-nous immédiatement.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 p-2 text-center border-t border-gray-200 rounded-b-lg">
              <Text className="text-xs text-gray-500 mb-3 !my-0">
                Si vous avez des difficultés avec la réinitialisation, contactez
                notre support à{" "}
                <Link
                  href="mailto:support@miticsarl.com"
                  className="text-blue-600"
                >
                  support@miticsarl.com
                </Link>
              </Text>
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

export default PasswordResetEmail;
