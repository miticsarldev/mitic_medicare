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

interface PasswordResetSuccessEmailProps {
  userName?: string;
  resetTime?: string;
}

export const PasswordResetSuccessEmail = ({
  userName = "Cher utilisateur",
  resetTime = new Date().toLocaleString("fr-FR"),
}: PasswordResetSuccessEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <Html>
      <Head />
      <Preview>
        Votre mot de passe MITICCARE a été réinitialisé avec succès
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
              </Row>
              <Heading className="text-white text-lg font-semibold m-0">
                Mot de passe réinitialisé
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="bg-white p-2 text-center">
              <Img
                src={`${baseUrl}/success_icon.png`}
                width="44"
                height="44"
                alt="Succès"
                className="mx-auto my-1"
              />
              <Heading className="text-lg font-semibold text-gray-800 !my-1">
                Réinitialisation réussie !
              </Heading>
              <Text className="text-sm font-medium text-gray-700 !my-0">
                Bonjour,
              </Text>
              <Text className="text-base font-medium text-gray-700 !my-0.5">
                <strong>{userName}</strong>
              </Text>
              <Text className="text-sm text-gray-600 mb-4 px-2">
                Votre mot de passe MITICCARE a été réinitialisé avec succès le{" "}
                {resetTime}.
              </Text>

              <Section className="bg-green-50 border-2 border-green-200 rounded-lg p-4 my-4">
                <Text className="text-sm text-green-700 m-0 font-semibold">
                  ✓ Votre compte est maintenant sécurisé avec votre nouveau mot
                  de passe
                </Text>
              </Section>

              <Hr className="border-gray-200 my-3" />

              <Section className="bg-amber-50 border-l-4 border-amber-500 p-4 text-left rounded-md mb-4">
                <Text className="text-sm text-gray-700 m-0">
                  <strong className="text-amber-700">
                    Si ce n&apos;était pas vous :
                  </strong>{" "}
                  Si vous n&apos;avez pas effectué cette réinitialisation,
                  contactez immédiatement notre équipe de sécurité. Votre compte
                  pourrait être compromis.
                </Text>
              </Section>

              <Section className="bg-gray-50 p-4 text-left rounded-md mb-4">
                <Text className="text-sm text-gray-700 font-semibold m-0 mb-2">
                  Conseils de sécurité :
                </Text>
                <Text className="text-sm text-gray-600 m-0 mb-1">
                  • Ne partagez jamais votre mot de passe
                </Text>
                <Text className="text-sm text-gray-600 m-0 mb-1">
                  • Utilisez un mot de passe unique pour MITICCARE
                </Text>
                <Text className="text-sm text-gray-600 m-0 mb-1">
                  • Activez l&apos;authentification à deux facteurs si
                  disponible
                </Text>
                <Text className="text-sm text-gray-600 m-0 mt-2">
                  • Déconnectez-vous des appareils partagés
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 p-2 text-center border-t border-gray-200 rounded-b-lg">
              <Text className="text-xs text-gray-500 mb-3 !my-0">
                Pour toute question de sécurité, contactez-nous à{" "}
                <Link
                  href="mailto:security@miticsarl.com"
                  className="text-green-600"
                >
                  contact@miticsarl.com
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

export default PasswordResetSuccessEmail;
