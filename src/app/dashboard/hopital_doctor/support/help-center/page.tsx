"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  FileText,
  HelpCircle,
  LifeBuoy,
  Search,
  ThumbsUp,
  Video,
} from "lucide-react";
import Link from "next/link";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function DoctorHelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Catégories adaptées pour les médecins
  const categories = [
    {
      id: "1",
      title: "Gestion des patients",
      description: "Apprenez à gérer les dossiers patients efficacement",
      icon: <BookOpen className="h-6 w-6" />,
      articles: 10,
    },
    {
      id: "2",
      title: "Agenda et Rendez-vous",
      description: "Gérez votre emploi du temps et vos consultations",
      icon: <FileText className="h-6 w-6" />,
      articles: 8,
    },
    {
      id: "3",
      title: "Dossiers Médicaux",
      description: "Accédez et mettez à jour les dossiers médicaux",
      icon: <FileText className="h-6 w-6" />,
      articles: 12,
    },
    {
      id: "4",
      title: "Facturation et Paiements",
      description: "Gérez les factures et les paiements de vos patients",
      icon: <FileText className="h-6 w-6" />,
      articles: 5,
    },
    {
      id: "5",
      title: "Sécurité et Confidentialité",
      description: "Protégez les données de vos patients",
      icon: <HelpCircle className="h-6 w-6" />,
      articles: 7,
    },
    {
      id: "6",
      title: "Support technique",
      description: "Trouvez des solutions aux problèmes techniques",
      icon: <LifeBuoy className="h-6 w-6" />,
      articles: 9,
    },
  ];

  // Articles populaires pour les médecins
  const popularArticles = [
    {
      id: "1",
      title: "Comment accéder aux dossiers des patients ?",
      category: "Dossiers Médicaux",
      views: 1245,
      helpful: 98,
    },
    {
      id: "2",
      title: "Comment planifier un rendez-vous avec un patient ?",
      category: "Agenda et Rendez-vous",
      views: 987,
      helpful: 92,
    },
    {
      id: "3",
      title: "Comment mettre à jour les informations médicales ?",
      category: "Dossiers Médicaux",
      views: 876,
      helpful: 89,
    },
    {
      id: "4",
      title: "Comment sécuriser les données patient ?",
      category: "Sécurité et Confidentialité",
      views: 765,
      helpful: 85,
    },
    {
      id: "5",
      title: "Comment gérer les paiements et factures ?",
      category: "Facturation et Paiements",
      views: 654,
      helpful: 91,
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Centre d&apos;Aide Médecin</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Trouvez des réponses à vos questions sur la gestion des patients,
          rendez-vous et autres aspects de votre pratique médicale.
        </p>
      </div>

      <div className="relative mb-8 max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher dans le centre d'aide..."
          className="pl-10 py-6 text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="overflow-hidden transition-all hover:shadow-md"
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {category.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-sm text-muted-foreground">
                {category.articles} articles
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-end">
              <Button variant="ghost" size="sm" className="gap-1">
                Explorer
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="articles" className="mb-10">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="articles" className="text-base">
            <FileText className="mr-2 h-4 w-4" />
            Articles populaires
          </TabsTrigger>
          <TabsTrigger value="videos" className="text-base">
            <Video className="mr-2 h-4 w-4" />
            Tutoriels vidéo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <div className="space-y-4">
            {popularArticles.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden transition-all hover:shadow-sm"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg hover:text-primary transition-colors">
                        <Link href="#">{article.title}</Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{article.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {article.views} vues
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-xs">{article.helpful}%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="p-4 pt-2 flex justify-end">
                  <Button variant="ghost" size="sm">
                    Lire l&apos;article
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Button variant="outline">Voir tous les articles</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
