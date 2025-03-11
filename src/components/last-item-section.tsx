"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Heart,
  Share2,
  ThumbsUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRef } from "react";

// Types basés sur le schéma Prisma
interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  coverImage: string;
  readingTime: number;
  publishedAt: Date;
  featured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string;
    role: "hospital_admin" | "independent_doctor" | "hospital_doctor";
    specialization?: string;
    avatarUrl?: string;
    institution?: {
      name: string;
      type: "clinic" | "hospital";
    };
  };
  tags: string[];
  likes: number;
  views: number;
}

// Données d'exemple basées sur le schéma Prisma
const articles: Article[] = [
  {
    id: "1",
    title: "Les bienfaits de la méditation sur la santé cardiovasculaire",
    excerpt:
      "Découvrez comment la pratique régulière de la méditation peut réduire le stress et améliorer la santé de votre cœur.",
    content: "",
    slug: "bienfaits-meditation-sante-cardiovasculaire",
    coverImage: "/medical-blog-cover-image.webp",
    readingTime: 5,
    publishedAt: new Date("2023-11-15"),
    featured: true,
    category: {
      id: "c1",
      name: "Bien-être",
      slug: "bien-etre",
    },
    author: {
      id: "d1",
      name: "Dr. Sophie Martin",
      role: "hospital_doctor",
      specialization: "Cardiologie",
      avatarUrl: "/medical-blog-doctor-image.webp",
      institution: {
        name: "Hôpital Européen Georges Pompidou",
        type: "hospital",
      },
    },
    tags: ["méditation", "stress", "santé cardiaque", "bien-être"],
    likes: 128,
    views: 3240,
  },
  {
    id: "2",
    title: "L'importance des vitamines D pour le système immunitaire",
    excerpt:
      "La vitamine D joue un rôle crucial dans le renforcement de notre système immunitaire. Voici comment s'assurer d'en avoir suffisamment.",
    content: "",
    slug: "importance-vitamine-d-systeme-immunitaire",
    coverImage: "/medical-blog-cover-image.webp",
    readingTime: 4,
    publishedAt: new Date("2023-12-03"),
    featured: true,
    category: {
      id: "c2",
      name: "Nutrition",
      slug: "nutrition",
    },
    author: {
      id: "d2",
      name: "Dr. Thomas Dubois",
      role: "independent_doctor",
      specialization: "Médecine générale",
      avatarUrl: "/medical-blog-doctor-image.webp",
    },
    tags: ["vitamines", "immunité", "nutrition", "santé"],
    likes: 95,
    views: 2180,
  },
  {
    id: "3",
    title:
      "Comment optimiser votre entraînement cardio pour de meilleurs résultats",
    excerpt:
      "Des conseils d'experts pour maximiser l'efficacité de vos séances de cardio et améliorer votre condition physique globale.",
    content: "",
    slug: "optimiser-entrainement-cardio-meilleurs-resultats",
    coverImage: "/medical-blog-cover-image.webp",
    readingTime: 6,
    publishedAt: new Date("2023-12-10"),
    featured: false,
    category: {
      id: "c3",
      name: "Fitness",
      slug: "fitness",
    },
    author: {
      id: "d3",
      name: "Dr. Claire Lefevre",
      role: "hospital_doctor",
      specialization: "Médecine du sport",
      avatarUrl: "/medical-blog-doctor-image.webp",
      institution: {
        name: "Clinique du Sport",
        type: "clinic",
      },
    },
    tags: ["cardio", "fitness", "entraînement", "santé"],
    likes: 87,
    views: 1950,
  },
  {
    id: "4",
    title: "Les avancées récentes dans le traitement du diabète de type 2",
    excerpt:
      "Un aperçu des dernières innovations médicales et approches thérapeutiques pour mieux gérer le diabète de type 2.",
    content: "",
    slug: "avancees-recentes-traitement-diabete-type-2",
    coverImage: "/medical-blog-cover-image.webp",
    readingTime: 7,
    publishedAt: new Date("2023-12-18"),
    featured: false,
    category: {
      id: "c4",
      name: "Recherche médicale",
      slug: "recherche-medicale",
    },
    author: {
      id: "d4",
      name: "Dr. Jean Moreau",
      role: "hospital_doctor",
      specialization: "Endocrinologie",
      avatarUrl: "/medical-blog-doctor-image.webp",
      institution: {
        name: "Centre Hospitalier Universitaire",
        type: "hospital",
      },
    },
    tags: ["diabète", "recherche", "traitement", "innovation"],
    likes: 112,
    views: 2760,
  },
  {
    id: "5",
    title: "Sommeil et santé mentale : une relation essentielle",
    excerpt:
      "Comment la qualité de votre sommeil affecte votre santé mentale et les stratégies pour améliorer les deux aspects.",
    content: "",
    slug: "sommeil-sante-mentale-relation-essentielle",
    coverImage: "/medical-blog-cover-image.webp",
    readingTime: 5,
    publishedAt: new Date("2023-12-22"),
    featured: true,
    category: {
      id: "c5",
      name: "Santé mentale",
      slug: "sante-mentale",
    },
    author: {
      id: "d5",
      name: "Dr. Amina Benali",
      role: "independent_doctor",
      specialization: "Psychiatrie",
      avatarUrl: "/medical-blog-doctor-image.webp",
    },
    tags: ["sommeil", "santé mentale", "bien-être", "stress"],
    likes: 145,
    views: 3120,
  },
  {
    id: "6",
    title: "Prévention des maladies cardiovasculaires : guide complet",
    excerpt:
      "Les mesures préventives essentielles pour réduire les risques de maladies cardiovasculaires à tout âge.",
    content: "",
    slug: "prevention-maladies-cardiovasculaires-guide-complet",
    coverImage: "/medical-blog-cover-image.webp",
    readingTime: 8,
    publishedAt: new Date("2023-12-28"),
    featured: false,
    category: {
      id: "c1",
      name: "Bien-être",
      slug: "bien-etre",
    },
    author: {
      id: "d1",
      name: "Dr. Sophie Martin",
      role: "hospital_doctor",
      specialization: "Cardiologie",
      avatarUrl: "/medical-blog-doctor-image.webp",
      institution: {
        name: "Hôpital Européen Georges Pompidou",
        type: "hospital",
      },
    },
    tags: ["prévention", "cœur", "santé cardiovasculaire", "mode de vie"],
    likes: 103,
    views: 2450,
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export function LastItemSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="py-16 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <Badge
            variant="outline"
            className="mb-3 px-4 py-1 text-sm font-medium bg-primary/10 text-primary border-primary/20"
          >
            Ressources Santé
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Nos Derniers Articles
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Rédigés par nos experts de santé pour vous informer et vous
            accompagner dans votre parcours de soins
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : ""}
        >
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/90 font-medium px-8 py-6 rounded-full"
          >
            Voir plus d&apos;articles
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <motion.div variants={itemVariants} animate="visible">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg border-gray-200 dark:border-gray-800">
        <div className="relative">
          <div className="aspect-[16/9] relative overflow-hidden">
            <Image
              src={article.coverImage}
              alt={article.title}
              width={200}
              height={200}
              className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
            />
          </div>
          {article.featured && (
            <Badge className="absolute top-3 right-3 bg-primary">
              À la une
            </Badge>
          )}
          <Badge
            className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 text-primary hover:bg-white dark:hover:bg-gray-800"
            variant="outline"
          >
            {article.category.name}
          </Badge>
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={article.author.avatarUrl}
                alt={article.author.name}
              />
              <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {article.author.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {article.author.specialization}
              </p>
            </div>
          </div>
          <Link href={`/articles/${article.slug}`} className="group">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>
        </CardHeader>

        <CardContent className="pb-4 flex-grow">
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
            {article.excerpt}
          </p>

          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {format(article.publishedAt, "d MMM yyyy", { locale: fr })}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{article.readingTime} min</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{article.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0 border-t border-gray-200 dark:border-gray-800 mt-auto">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-gray-500 hover:text-primary"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{article.likes}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>J&apos;aime cet article</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-gray-500 hover:text-primary"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>{article.views}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Nombre de lectures</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-primary"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sauvegarder</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-primary"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Partager</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
