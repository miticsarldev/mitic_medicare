'use client'
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

type FAQ = {
    question: string
    answer: string
    category: string
}

const faqs: FAQ[] = [
    {
        question: "Comment ajouter un médecin à la plateforme ?",
        answer: "Rendez-vous dans le panneau d’administration, cliquez sur 'Utilisateurs' > 'Ajouter un médecin', puis remplissez les informations demandées.",
        category: "Utilisateurs"
    },
    {
        question: "Comment modifier les horaires d’ouverture de l’hôpital ?",
        answer: "Dans la section 'Paramètres', cliquez sur 'Horaires' pour mettre à jour les heures d’ouverture.",
        category: "Paramètres"
    },
    {
        question: "Comment désactiver un compte utilisateur ?",
        answer: "Allez dans 'Utilisateurs', sélectionnez l'utilisateur concerné, puis cliquez sur 'Désactiver le compte'.",
        category: "Utilisateurs"
    },
    {
        question: "Comment consulter les statistiques de fréquentation ?",
        answer: "La section 'Statistiques' vous permet de visualiser les rapports de fréquentation par service ou période.",
        category: "Statistiques"
    },
    {
        question: "Que faire en cas de problème technique sur la plateforme ?",
        answer: "Contactez le support via le bouton 'Assistance' dans le coin supérieur droit ou envoyez un ticket.",
        category: "Support technique"
    }
]

const categories = ["Toutes les questions", "Utilisateurs", "Paramètres", "Statistiques", "Support technique"]

export default function FAQAdmin() {
    const [search, setSearch] = useState("")

    const filterFaqs = (cat: string) => {
        return faqs.filter(
            (faq) =>
                (cat === "Toutes les questions" || faq.category === cat) &&
                faq.question.toLowerCase().includes(search.toLowerCase())
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-center">FAQ Admin Hôpital</h1>

            <Input
                placeholder="Rechercher une question..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
            />

            <Tabs defaultValue="Toutes les questions" className="w-full">
                <TabsList className="w-full flex flex-wrap justify-start mb-4">
                    {categories.map((cat) => (
                        <TabsTrigger key={cat} value={cat} className="capitalize mr-2">
                            {cat}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {categories.map((cat) => (
                    <TabsContent key={cat} value={cat}>
                        <Accordion type="single" collapsible className="w-full border rounded-lg divide-y">
                            {filterFaqs(cat).map((faq, i) => (
                                <AccordionItem key={i} value={`faq-${i}`} className="px-4">
                                    <AccordionTrigger className="text-left py-3 text-base font-medium">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4 text-sm text-gray-600">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}

                            {filterFaqs(cat).length === 0 && (
                                <p className="p-4 text-gray-500">Aucune question trouvée.</p>
                            )}
                        </Accordion>
                    </TabsContent>
                ))}
            </Tabs>

            <div className="text-center pt-6">
                <p className="mb-2 text-gray-500">Vous ne trouvez pas la réponse ?</p>
                <Button>Contactez-nous</Button>
            </div>
        </div>
    )
}
