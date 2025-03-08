"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  FileText,
  HelpCircle,
  LifeBuoy,
  MessageSquare,
  Search,
  ThumbsUp,
  Video,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Popular categories
  const categories = [
    {
      id: "1",
      title: "Premiers pas",
      description: "Découvrez comment utiliser notre plateforme",
      icon: <BookOpen className="h-6 w-6" />,
      articles: 12,
    },
    {
      id: "2",
      title: "Rendez-vous",
      description: "Gérer vos rendez-vous médicaux",
      icon: <FileText className="h-6 w-6" />,
      articles: 8,
    },
    {
      id: "3",
      title: "Dossier médical",
      description: "Accéder et gérer votre dossier médical",
      icon: <FileText className="h-6 w-6" />,
      articles: 10,
    },
    {
      id: "4",
      title: "Abonnements",
      description: "Gérer votre abonnement et vos paiements",
      icon: <FileText className="h-6 w-6" />,
      articles: 6,
    },
    {
      id: "5",
      title: "Sécurité & Confidentialité",
      description: "Protéger vos données personnelles",
      icon: <FileText className="h-6 w-6" />,
      articles: 9,
    },
    {
      id: "6",
      title: "Problèmes techniques",
      description: "Résoudre les problèmes techniques",
      icon: <HelpCircle className="h-6 w-6" />,
      articles: 15,
    },
  ];

  // Popular articles
  const popularArticles = [
    {
      id: "1",
      title: "Comment prendre un rendez-vous avec un médecin ?",
      category: "Rendez-vous",
      views: 1245,
      helpful: 98,
    },
    {
      id: "2",
      title: "Comment accéder à mon dossier médical ?",
      category: "Dossier médical",
      views: 987,
      helpful: 92,
    },
    {
      id: "3",
      title: "Comment modifier mes informations personnelles ?",
      category: "Compte",
      views: 876,
      helpful: 89,
    },
    {
      id: "4",
      title: "Comment annuler ou reporter un rendez-vous ?",
      category: "Rendez-vous",
      views: 765,
      helpful: 85,
    },
    {
      id: "5",
      title: "Comment changer mon mot de passe ?",
      category: "Sécurité",
      views: 654,
      helpful: 91,
    },
  ];

  // Video tutorials
  const videoTutorials = [
    {
      id: "1",
      title: "Comment utiliser le tableau de bord patient",
      duration: "3:45",
      thumbnail: "/placeholder.svg?height=120&width=220",
    },
    {
      id: "2",
      title: "Prendre un rendez-vous en ligne",
      duration: "2:30",
      thumbnail: "/placeholder.svg?height=120&width=220",
    },
    {
      id: "3",
      title: "Gérer votre dossier médical",
      duration: "4:15",
      thumbnail: "/placeholder.svg?height=120&width=220",
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Centre d&apos;Aide</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Trouvez des réponses à vos questions et apprenez à utiliser notre
          plateforme de santé.
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

        <TabsContent value="videos">
          <div className="grid gap-6 md:grid-cols-3">
            {videoTutorials.map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden transition-all hover:shadow-md"
              >
                <div className="relative">
                  <Image
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    width={220}
                    height={120}
                    className="w-full h-[160px] object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6 text-white ml-1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium">{video.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Button variant="outline">Voir tous les tutoriels</Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-muted/50 rounded-lg p-6 mb-10">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              Besoin d&apos;aide supplémentaire ?
            </h2>
            <p className="text-muted-foreground mb-4">
              Notre équipe de support est disponible pour vous aider avec toutes
              vos questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button>
                <MessageSquare className="mr-2 h-4 w-4" />
                Contacter le support
              </Button>
              <Button variant="outline">
                <LifeBuoy className="mr-2 h-4 w-4" />
                Consulter les FAQs
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Image
              src="/placeholder.svg?height=150&width=150"
              alt="Support"
              width={150}
              height={150}
              className="rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">
          Agents de support disponibles
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((agent) => (
            <div
              key={agent}
              className="flex items-center gap-3 p-3 rounded-lg border"
            >
              <Avatar>
                <AvatarImage
                  src={`/placeholder.svg?height=40&width=40`}
                  alt="Agent"
                />
                <AvatarFallback>AG</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Agent {agent}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  En ligne
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Discuter
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
