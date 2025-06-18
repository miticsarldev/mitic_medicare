import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface GeneralContactEmailTemplateProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const GeneralContactEmailTemplate = ({
  name,
  email,
  subject,
  message,
}: GeneralContactEmailTemplateProps) => {
  const currentDate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Html>
      <Head />
      <Preview>Nouveau message de contact - {subject}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-[600px] rounded-lg overflow-hidden">
            <Section className="bg-[#4361ee] py-5 px-5 text-center">
              <Heading className="text-white text-2xl m-0">
                MITIC CARE - Formulaire de contact
              </Heading>
            </Section>

            <Section className="py-8 px-5">
              <Text className="text-base text-gray-800 mb-6">
                Un nouveau message a été soumis depuis le formulaire de contact
                :
              </Text>

              {/* Détails du message */}
              <Section className="mb-6 border border-gray-200 rounded-md overflow-hidden">
                <Section className="border-b border-gray-200">
                  <Text className="bg-gray-50 py-3 px-4 font-medium m-0">
                    Date
                  </Text>
                  <Text className="py-3 px-4 m-0">{currentDate}</Text>
                </Section>
                <Section className="border-b border-gray-200">
                  <Text className="bg-gray-50 py-3 px-4 font-medium m-0">
                    Nom
                  </Text>
                  <Text className="py-3 px-4 m-0">{name}</Text>
                </Section>
                <Section className="border-b border-gray-200">
                  <Text className="bg-gray-50 py-3 px-4 font-medium m-0">
                    Email
                  </Text>
                  <Text className="py-3 px-4 m-0">
                    <Link href={`mailto:${email}`} className="text-[#4361ee]">
                      {email}
                    </Link>
                  </Text>
                </Section>
                <Section className="border-b border-gray-200">
                  <Text className="bg-gray-50 py-3 px-4 font-medium m-0">
                    Sujet
                  </Text>
                  <Text className="py-3 px-4 m-0 font-medium">{subject}</Text>
                </Section>
              </Section>

              {/* Message */}
              <Section
                className="bg-gray-50 p-5 rounded-md mb-6 border-l-4"
                style={{ borderLeftColor: "#4361ee" }}
              >
                <Heading
                  as="h3"
                  className="text-gray-800 text-base font-medium mb-3"
                >
                  Message
                </Heading>
                <Text className="text-gray-700 whitespace-pre-wrap leading-6 m-0">
                  {message}
                </Text>
              </Section>

              {/* CTA */}
              <Section className="bg-gray-50 p-5 text-center mt-8">
                <Text className="text-gray-700 mb-4">
                  Merci de répondre au client si nécessaire.
                </Text>
                <Button
                  href={`mailto:${email}`}
                  className="bg-[#4361ee] text-white py-3 px-5 rounded font-medium no-underline"
                >
                  Répondre à {name}
                </Button>
              </Section>
            </Section>

            <Section className="bg-gray-100 py-5 px-5 text-center text-gray-500">
              <Text className="text-sm mb-2">
                Ce message a été généré automatiquement par le site MITIC CARE.
              </Text>
              <Text className="text-sm m-0">
                © {new Date().getFullYear()} MITIC SARL. Tous droits réservés.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default GeneralContactEmailTemplate;
