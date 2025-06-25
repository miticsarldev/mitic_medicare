"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "Toutes les questions" },
    { id: "patients", name: "Gestion des patients" },
    { id: "appointments", name: "Rendez-vous" },
    { id: "medical", name: "Dossiers médicaux" },
    { id: "technical", name: "Problèmes techniques" },
  ];

  const faqItems = [
    {
      id: "1",
      question: "Comment gérer les rendez-vous des patients ?",
      answer:
        "Dans votre tableau de bord, accédez à la section 'Rendez-vous' où vous pouvez voir, modifier ou annuler les rendez-vous des patients.",
      category: "appointments",
      popular: true,
    },
    {
      id: "2",
      question: "Comment accéder aux dossiers médicaux des patients ?",
      answer:
        "Les dossiers médicaux sont accessibles via la section 'Dossiers médicaux' après authentification et validation de votre accès.",
      category: "medical",
      popular: true,
    },
    {
      id: "3",
      question: "Comment ajouter des notes médicales à un dossier patient ?",
      answer:
        "Sur la page du patient, cliquez sur 'Ajouter une note', renseignez vos observations et enregistrez-les dans son dossier médical.",
      category: "medical",
      popular: false,
    },
    {
      id: "4",
      question: "Que faire si un patient ne se présente pas à son rendez-vous ?",
      answer:
        "Vous pouvez marquer le rendez-vous comme 'Non honoré' et contacter le patient pour reprogrammer une nouvelle consultation.",
      category: "appointments",
      popular: false,
    },
    {
      id: "5",
      question: "Comment signaler un problème technique sur la plateforme ?",
      answer:
        "Utilisez la section 'Support Technique' pour décrire votre problème et contacter l'équipe d'assistance.",
      category: "technical",
      popular: false,
    },
    {
      id: "6",
      question: "Comment ajouter un nouveau patient à ma liste ?",
      answer:
        "Accédez à la section 'Gestion des patients' et cliquez sur 'Ajouter un patient'. Remplissez les informations requises et enregistrez le nouveau patient.",
      category: "patients",
      popular: true,
    },
  ];

  const filteredFAQs = faqItems.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false;
    }
    if (
      searchQuery &&
      !item.question.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">FAQ Médecins</h1>
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
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex flex-wrap justify-start gap-2 mb-6">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="px-4 py-2">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Card>
        <CardContent className="p-6">
          <Accordion type="single" collapsible>
            {filteredFAQs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      <div className="text-center mt-8">
        <p className="text-muted-foreground">Vous ne trouvez pas la réponse ?</p>
        <Button asChild className="mt-2">
          <Link href="contact">Contactez-nous</Link>
        </Button>
      </div>
    </div>
  );
}
