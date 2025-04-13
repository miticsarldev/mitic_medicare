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
  Row,
  Column,
  Tailwind,
} from "@react-email/components";

interface SupportEmailTemplateProps {
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
}

export const SupportEmailTemplate = ({
  name,
  email,
  subject,
  category,
  priority,
  message,
}: SupportEmailTemplateProps) => {
  // Convert priority to French and add color
  const priorityMap = {
    low: { text: "Basse", color: "#4CAF50" },
    medium: { text: "Moyenne", color: "#FF9800" },
    high: { text: "Haute", color: "#F44336" },
  };

  const priorityInfo =
    priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;

  // Format category for display
  const categoryMap: Record<string, string> = {
    technical: "Problème technique",
    account: "Compte & Profil",
    appointments: "Rendez-vous",
    medical: "Dossier médical",
    subscription: "Abonnement & Paiement",
    other: "Autre",
  };

  const formattedCategory = categoryMap[category] || category;

  // Get current date in French format
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
      <Preview>Nouvelle demande de support - {subject}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-[600px] rounded-lg overflow-hidden">
            <Section className="bg-[#4361ee] py-5 px-5 text-center">
              <Heading className="text-white text-2xl m-0">
                MITIC CARE - Support Client
              </Heading>
            </Section>

            <Section className="py-8 px-5">
              <Text className="text-base text-gray-800 mb-6">
                Une nouvelle demande de support a été reçue. Voici les détails :
              </Text>

              {/* Details Table */}
              <Section className="mb-6 border border-gray-200 rounded-md overflow-hidden">
                <Row className="border-b border-gray-200">
                  <Column className="bg-gray-50 py-3 px-4 font-medium w-[30%]">
                    Date
                  </Column>
                  <Column className="py-3 px-4">{currentDate}</Column>
                </Row>
                <Row className="border-b border-gray-200">
                  <Column className="bg-gray-50 py-3 px-4 font-medium">
                    Nom
                  </Column>
                  <Column className="py-3 px-4">{name}</Column>
                </Row>
                <Row className="border-b border-gray-200">
                  <Column className="bg-gray-50 py-3 px-4 font-medium">
                    Email
                  </Column>
                  <Column className="py-3 px-4">
                    <Link
                      href={`mailto:${email}`}
                      className="text-[#4361ee] no-underline"
                    >
                      {email}
                    </Link>
                  </Column>
                </Row>
                <Row className="border-b border-gray-200">
                  <Column className="bg-gray-50 py-3 px-4 font-medium">
                    Catégorie
                  </Column>
                  <Column className="py-3 px-4">{formattedCategory}</Column>
                </Row>
                <Row className="border-b border-gray-200">
                  <Column className="bg-gray-50 py-3 px-4 font-medium">
                    Priorité
                  </Column>
                  <Column className="py-3 px-4">
                    <Text
                      className="inline-block py-1 px-2 rounded text-xs text-white font-medium"
                      style={{ backgroundColor: priorityInfo.color }}
                    >
                      {priorityInfo.text}
                    </Text>
                  </Column>
                </Row>
                <Row>
                  <Column className="bg-gray-50 py-3 px-4 font-medium">
                    Sujet
                  </Column>
                  <Column className="py-3 px-4 font-medium">{subject}</Column>
                </Row>
              </Section>

              {/* Message Section */}
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

              {/* Call to Action */}
              <Section className="bg-gray-50 p-5 text-center mt-8">
                <Text className="text-gray-700 mb-4">
                  Veuillez traiter cette demande selon la priorité indiquée.
                </Text>
                <Button
                  href={`mailto:${email}`}
                  className="bg-[#4361ee] text-white py-3 px-5 rounded font-medium no-underline"
                >
                  Répondre au client
                </Button>
              </Section>
            </Section>

            <Section className="bg-gray-100 py-5 px-5 text-center text-gray-500">
              <Text className="text-sm mb-2">
                Ce message a été généré automatiquement par le système de
                support MITIC CARE.
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

export default SupportEmailTemplate;
