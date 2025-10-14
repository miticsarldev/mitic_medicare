import * as React from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

export type VerificationPendingProps = {
  name?: string;
  role?: "HOSPITAL_ADMIN" | "INDEPENDENT_DOCTOR";
  helpUrl?: string;
  statusUrl?: string;
};

const VerificationPendingEmail = ({
  name = "Cher utilisateur",
  role = "INDEPENDENT_DOCTOR",
  helpUrl,
  statusUrl,
}: VerificationPendingProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const roleLabel =
    role === "HOSPITAL_ADMIN"
      ? "Administrateur d'hôpital"
      : "Médecin indépendant";

  return (
    <Html>
      <Head />
      <Preview>Votre compte est en vérification</Preview>
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
              </Row>
              <Heading className="text-black text-lg font-semibold m-0">
                Demande en cours de vérification
              </Heading>
            </Section>

            {/* Main */}
            <Section className="bg-white p-3 text-left">
              <Heading className="text-lg font-semibold text-gray-800 !mt-1 !mb-2">
                Bonjour {name},
              </Heading>

              <Text className="text-sm text-gray-700">
                Merci d’avoir confirmé votre adresse email. Votre compte{" "}
                <strong>{roleLabel}</strong> est maintenant en attente de
                vérification par notre équipe.
              </Text>

              <Text className="text-sm text-gray-700">
                Vous recevrez une notification par email dès que la vérification
                sera terminée. En attendant, vous pouvez consulter l’état de
                votre demande depuis votre espace.
              </Text>

              <div className="mt-4 flex gap-2">
                <Button
                  href={statusUrl ?? `${baseUrl}/auth`}
                  className="bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                  Voir l’état de ma demande
                </Button>
                {helpUrl && (
                  <Button
                    href={helpUrl}
                    className="bg-gray-100 text-gray-800 font-semibold px-5 py-3 rounded-lg border hover:bg-gray-200 transition-colors"
                  >
                    Aide / Support
                  </Button>
                )}
              </div>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 p-2 text-center border-t border-gray-200 rounded-b-lg">
              <Text className="text-sm text-gray-500 mb-3">
                &copy; {new Date().getFullYear()} MITICCARE. Tous droits
                réservés.
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

export default VerificationPendingEmail;
