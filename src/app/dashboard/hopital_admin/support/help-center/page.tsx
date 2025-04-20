'use client'
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
  MessageCircleQuestion,
  Lock,
  UserPlus,
  FileText,
  Activity,
  BookText,
  Info,
  User,
  Calendar
} from "lucide-react"

type HelpItem = {
  icon: JSX.Element
  title: string
  description: string
  category: string
}

type Article = {
  icon: JSX.Element
  title: string
  description: string
  author: string
  date: string
}

const helpItems: HelpItem[] = [
  {
    icon: <UserPlus className="text-primary w-6 h-6" />,
    title: "Créer un compte utilisateur",
    description: "Gérez les rôles et autorisations du personnel hospitalier.",
    category: "Administration"
  },
  {
    icon: <FileText className="text-primary w-6 h-6" />,
    title: "Accéder à un dossier patient",
    description: "Consultez et modifiez les données médicales avec sécurité.",
    category: "Dossiers Patients"
  },
  {
    icon: <Lock className="text-primary w-6 h-6" />,
    title: "Sécuriser son compte",
    description: "Réinitialisation de mot de passe, 2FA, gestion des accès.",
    category: "Sécurité"
  },
  {
    icon: <Activity className="text-primary w-6 h-6" />,
    title: "Suivi des urgences",
    description: "Priorisez les patients en urgence selon leur état.",
    category: "Urgences"
  },
  {
    icon: <MessageCircleQuestion className="text-primary w-6 h-6" />,
    title: "Contacter le support",
    description: "Rencontrez-vous un problème technique ou un bug ?",
    category: "Support"
  }
]

const articles: Article[] = [
  {
    icon: <BookText className="text-primary w-5 h-5" />,
    title: "Nouvelles fonctionnalités de gestion des prescriptions",
    description: "Découvrez comment utiliser le module de prescription optimisée.",
    author: "Dr. Clara Lefevre",
    date: "12 avril 2025"
  },
  {
    icon: <Info className="text-primary w-5 h-5" />,
    title: "Mise à jour de sécurité du 10 avril",
    description: "Un correctif important a été appliqué sur la gestion des accès.",
    author: "Équipe IT",
    date: "10 avril 2025"
  },
  {
    icon: <BookText className="text-primary w-5 h-5" />,
    title: "Comment ajouter un nouveau patient",
    description: "Étapes détaillées pour un enregistrement rapide et complet.",
    author: "Assistante Médicale",
    date: "5 avril 2025"
  }
]

export default function HelpCenter() {
  const [search, setSearch] = useState("")

  const filtered = helpItems.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Centre d’aide</h1>
        <p className="text-gray-500 text-base">
          Trouvez rapidement des réponses sur la plateforme de gestion hospitalière
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Input
          placeholder="Rechercher un sujet, une action ou une question..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {filtered.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-md">
                {item.icon}
              </div>
              <div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{item.category}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-2 text-sm text-gray-600">
              {item.description}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ARTICLES SECTION */}
      <div className="space-y-6 pt-10">
        <h2 className="text-2xl font-semibold">Articles récents</h2>
        <div className="space-y-4">
          {articles.map((article, index) => (
            <Card key={index} className="flex flex-col sm:flex-row gap-4 p-4 hover:shadow-sm transition">
              <div className="flex-shrink-0 p-3 rounded-md bg-primary/10">{article.icon}</div>
              <div className="flex flex-col justify-between space-y-1">
                <h3 className="text-lg font-medium">{article.title}</h3>
                <p className="text-sm text-muted-foreground">{article.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                  <User className="w-4 h-4" />
                  {article.author}
                  <Calendar className="w-4 h-4 ml-4" />
                  {article.date}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center pt-12 border-t mt-6">
        <p className="text-gray-500 mb-3">Vous n’avez pas trouvé votre réponse ?</p>
        <Button>Contacter notre équipe support</Button>
      </div>
    </div>
  )
}
