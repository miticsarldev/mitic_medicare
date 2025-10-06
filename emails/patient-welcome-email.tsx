import * as React from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

type Props = {
  name?: string;
  setPasswordUrl?: string;
  loginUrl?: string;
};

const PatientWelcomeEmail = ({
  name = "Cher patient",
  setPasswordUrl,
  loginUrl,
}: Props) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const hasInvite = Boolean(setPasswordUrl);

  return (
    <Html>
      <Head />
      <Preview>
        {hasInvite
          ? "Bienvenue sur MITIC CARE – Créez votre mot de passe"
          : "Bienvenue sur MITIC CARE"}
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
                {hasInvite
                  ? "Bienvenue — Créez votre mot de passe"
                  : "Bienvenue sur MITIC CARE"}
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="bg-white p-3 text-center">
              <Img
                src={`${baseUrl}/patient_welcome_icon.jpg`}
                width="44"
                height="44"
                alt="Bienvenue"
                className="mx-auto my-1"
              />

              <Heading className="text-lg font-semibold text-gray-800 !my-1">
                Bonjour {name},
              </Heading>

              {hasInvite ? (
                <>
                  <Text className="text-sm text-gray-600 mb-2 px-2">
                    Votre compte patient a été créé. Pour accéder à votre
                    espace, veuillez d&apos;abord définir un mot de passe.
                  </Text>

                  <Button
                    href={setPasswordUrl}
                    className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                  >
                    Créer mon mot de passe
                  </Button>

                  <Text className="text-xs text-gray-500 mt-5 !my-0">
                    Si le bouton ne fonctionne pas, copiez/collez ce lien dans
                    votre navigateur :
                  </Text>
                  <Text className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-md p-3 mb-4 break-all">
                    {setPasswordUrl}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-sm text-gray-600 mb-2 px-2">
                    Votre compte patient est prêt. Vous pouvez vous connecter
                    depuis le bouton ci-dessous.
                  </Text>
                  <Button
                    href={loginUrl ?? `${baseUrl}/auth`}
                    className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                  >
                    Se connecter
                  </Button>
                </>
              )}

              <Hr className="border-gray-200 my-4" />

              <Section className="bg-gray-50 border-l-4 border-blue-600 p-4 text-left rounded-md">
                <Text className="text-sm text-gray-600 m-0">
                  <strong className="text-gray-800">Sécurité :</strong> MITIC
                  CARE ne demandera jamais vos identifiants par email. Si vous
                  recevez un message suspect, contactez-nous.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 p-2 text-center border-t border-gray-200 rounded-b-lg">
              <Text className="text-sm text-gray-500 mb-3">
                &copy; {new Date().getFullYear()} MITIC CARE. Tous droits
                réservés.
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

export default PatientWelcomeEmail;
