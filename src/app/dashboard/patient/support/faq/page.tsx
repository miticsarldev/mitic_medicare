"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // FAQ categories
  const categories = [
    { id: "all", name: "Toutes les questions" },
    { id: "account", name: "Compte & Profil" },
    { id: "appointments", name: "Rendez-vous" },
    { id: "medical", name: "Dossier médical" },
    { id: "subscription", name: "Abonnement & Paiement" },
    { id: "technical", name: "Problèmes techniques" },
  ];

  // FAQ items
  const faqItems = [
    {
      id: "1",
      question: "Comment prendre un rendez-vous avec un médecin ?",
      answer:
        "Pour prendre un rendez-vous, accédez à la section 'Mes Rendez-vous' dans votre tableau de bord, puis cliquez sur 'Prendre un Rendez-vous'. Vous pourrez ensuite choisir un médecin, une date et une heure qui vous conviennent. Une confirmation vous sera envoyée par email et SMS une fois le rendez-vous confirmé.",
      category: "appointments",
      popular: true,
    },
    {
      id: "2",
      question: "Comment modifier ou annuler un rendez-vous ?",
      answer:
        "Pour modifier ou annuler un rendez-vous, accédez à la section 'Mes Rendez-vous' dans votre tableau de bord, puis sélectionnez le rendez-vous concerné. Vous pourrez alors cliquer sur 'Modifier' ou 'Annuler'. Veuillez noter que les annulations doivent être effectuées au moins 24 heures à l'avance pour éviter des frais.",
      category: "appointments",
      popular: true,
    },
    {
      id: "3",
      question: "Comment accéder à mon dossier médical ?",
      answer:
        "Votre dossier médical est accessible depuis la section 'Mon Dossier Médical' dans votre tableau de bord. Vous y trouverez votre historique médical, vos ordonnances, vos résultats d'analyses et autres documents médicaux. Vous pouvez également télécharger ces documents ou les partager avec vos médecins.",
      category: "medical",
      popular: true,
    },
    {
      id: "4",
      question: "Comment mettre à jour mes informations personnelles ?",
      answer:
        "Pour mettre à jour vos informations personnelles, accédez à la section 'Paramètres & Sécurité' puis 'Mon Profil'. Vous pourrez y modifier vos coordonnées, votre adresse, vos informations médicales de base et d'autres détails personnels. N'oubliez pas de cliquer sur 'Enregistrer' après avoir effectué vos modifications.",
      category: "account",
      popular: false,
    },
    {
      id: "5",
      question: "Comment changer mon mot de passe ?",
      answer:
        "Pour changer votre mot de passe, accédez à la section 'Paramètres & Sécurité' puis 'Sécurité & Confidentialité'. Dans la section 'Changer de mot de passe', entrez votre mot de passe actuel, puis votre nouveau mot de passe deux fois. Cliquez ensuite sur 'Mettre à jour le mot de passe' pour confirmer le changement.",
      category: "account",
      popular: false,
    },
    {
      id: "6",
      question: "Comment fonctionne l'abonnement Premium ?",
      answer:
        "L'abonnement Premium vous offre des avantages exclusifs comme des rendez-vous prioritaires, des consultations vidéo illimitées, l'accès à des spécialistes premium et un support client 24/7. Vous pouvez vous abonner depuis la section 'Abonnement & Services' puis 'Mettre à Niveau'. Le paiement peut être mensuel ou annuel, avec une réduction sur l'abonnement annuel.",
      category: "subscription",
      popular: true,
    },
    {
      id: "7",
      question: "Comment annuler mon abonnement ?",
      answer:
        "Pour annuler votre abonnement, accédez à la section 'Abonnement & Services' puis 'Mon Abonnement'. En bas de la page, vous trouverez un bouton 'Annuler l'abonnement'. Suivez les instructions pour confirmer l'annulation. Votre abonnement restera actif jusqu'à la fin de la période de facturation en cours.",
      category: "subscription",
      popular: false,
    },
    {
      id: "8",
      question: "Que faire si l'application ne fonctionne pas correctement ?",
      answer:
        "Si vous rencontrez des problèmes techniques, essayez d'abord de rafraîchir la page ou de vous déconnecter puis vous reconnecter. Si le problème persiste, videz le cache de votre navigateur ou essayez d'utiliser un autre navigateur. Si rien ne fonctionne, contactez notre support technique via la section 'Assistance & Aide' puis 'Support Client'.",
      category: "technical",
      popular: false,
    },
    {
      id: "9",
      question:
        "Comment partager mon dossier médical avec un nouveau médecin ?",
      answer:
        "Pour partager votre dossier médical avec un nouveau médecin, accédez à la section 'Mon Dossier Médical' puis 'Voir Mon Dossier'. Cliquez sur le bouton 'Partager' et sélectionnez les documents que vous souhaitez partager. Vous pouvez ensuite générer un lien sécurisé temporaire ou envoyer directement les documents par email au médecin concerné.",
      category: "medical",
      popular: false,
    },
    {
      id: "10",
      question: "Comment activer les notifications par SMS ?",
      answer:
        "Pour activer les notifications par SMS, accédez à la section 'Paramètres & Sécurité' puis 'Sécurité & Confidentialité'. Dans la section 'Notifications', activez l'option 'Notifications par SMS'. Assurez-vous que votre numéro de téléphone est correctement renseigné dans votre profil pour recevoir les SMS.",
      category: "account",
      popular: false,
    },
  ];

  // Filter FAQ items based on search query and selected category
  const filteredFAQs = faqItems.filter((item) => {
    // Filter by category
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false;
    }

    // Filter by search query
    if (
      searchQuery &&
      !item.question.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Get popular FAQs
  const popularFAQs = faqItems.filter((item) => item.popular);

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Questions Fréquentes</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Trouvez rapidement des réponses aux questions les plus courantes sur
          notre plateforme.
        </p>
      </div>

      <div className="relative mb-8 max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher une question..."
          className="pl-10 py-6 text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-8">
        <Tabs
          defaultValue="all"
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <TabsList className="flex flex-wrap justify-start gap-2 mb-6">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="px-4 py-2"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {searchQuery && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">
            Résultats de recherche pour &quot;{searchQuery}&quot;
          </h2>
          <p className="text-muted-foreground">
            {filteredFAQs.length} résultat(s) trouvé(s)
          </p>
        </div>
      )}

      {!searchQuery && selectedCategory === "all" && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Badge variant="secondary" className="mr-2">
              Populaires
            </Badge>
            Questions les plus fréquentes
          </h2>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {popularFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left font-medium py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-4">
          {selectedCategory === "all"
            ? "Toutes les questions"
            : categories.find((c) => c.id === selectedCategory)?.name}
        </h2>

        <Card>
          <CardContent className="p-6">
            {filteredFAQs.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left font-medium py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Aucune question trouvée pour cette recherche.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 mt-10">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">
            Vous n&apos;avez pas trouvé de réponse à votre question ?
          </h2>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            Notre équipe de support est disponible pour vous aider avec toutes
            vos questions.
          </p>
          <Link href="/dashboard/patient/support/contact">
            <Button>Contacter le support</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
