/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowUpDown,
  Calendar,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Sample data for blog articles
const articles = [
  {
    id: "1",
    title: "Les avancées récentes en cardiologie",
    slug: "avancees-recentes-cardiologie",
    excerpt:
      "Découvrez les dernières innovations dans le domaine de la cardiologie et leurs impacts sur les traitements.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...",
    category: "Cardiologie",
    tags: ["Innovation", "Recherche", "Traitement"],
    author: {
      id: "a1",
      name: "Dr. Sophie Martin",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    status: "published",
    featured: true,
    image: "/placeholder.svg?height=400&width=600",
    publishedAt: "2024-02-15T10:30:00",
    updatedAt: "2024-02-16T14:20:00",
    views: 1245,
    comments: 18,
  },
  {
    id: "2",
    title: "Comment prévenir les maladies chroniques",
    slug: "prevenir-maladies-chroniques",
    excerpt:
      "Guide pratique pour adopter un mode de vie sain et réduire les risques de maladies chroniques.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...",
    category: "Prévention",
    tags: ["Santé", "Mode de vie", "Nutrition"],
    author: {
      id: "a2",
      name: "Dr. Thomas Dubois",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    status: "published",
    featured: false,
    image: "/placeholder.svg?height=400&width=600",
    publishedAt: "2024-01-28T09:15:00",
    updatedAt: "2024-01-28T09:15:00",
    views: 2780,
    comments: 32,
  },
  {
    id: "3",
    title: "L'importance du sommeil pour la santé mentale",
    slug: "importance-sommeil-sante-mentale",
    excerpt:
      "Comprendre le lien entre la qualité du sommeil et la santé mentale, avec des conseils pour mieux dormir.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...",
    category: "Santé mentale",
    tags: ["Sommeil", "Bien-être", "Stress"],
    author: {
      id: "a3",
      name: "Dr. Marie Lefevre",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    status: "draft",
    featured: false,
    image: "/placeholder.svg?height=400&width=600",
    publishedAt: null,
    updatedAt: "2024-03-05T16:45:00",
    views: 0,
    comments: 0,
  },
  {
    id: "4",
    title: "Nutrition et immunité : renforcer ses défenses naturelles",
    slug: "nutrition-immunite-defenses-naturelles",
    excerpt:
      "Les aliments et nutriments essentiels pour soutenir votre système immunitaire et rester en bonne santé.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...",
    category: "Nutrition",
    tags: ["Alimentation", "Immunité", "Vitamines"],
    author: {
      id: "a4",
      name: "Dr. Jean Dupont",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    status: "published",
    featured: true,
    image: "/placeholder.svg?height=400&width=600",
    publishedAt: "2024-02-02T11:20:00",
    updatedAt: "2024-02-10T13:30:00",
    views: 3150,
    comments: 27,
  },
  {
    id: "5",
    title: "Les bienfaits de l'activité physique régulière",
    slug: "bienfaits-activite-physique-reguliere",
    excerpt:
      "Comment l'exercice régulier améliore la santé physique et mentale, avec des recommandations adaptées à chaque profil.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...",
    category: "Activité physique",
    tags: ["Sport", "Bien-être", "Santé cardiovasculaire"],
    author: {
      id: "a2",
      name: "Dr. Thomas Dubois",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    status: "published",
    featured: false,
    image: "/placeholder.svg?height=400&width=600",
    publishedAt: "2024-01-15T14:00:00",
    updatedAt: "2024-01-15T14:00:00",
    views: 1890,
    comments: 15,
  },
  {
    id: "6",
    title: "Comprendre et gérer l'anxiété au quotidien",
    slug: "comprendre-gerer-anxiete-quotidien",
    excerpt:
      "Stratégies et techniques pour reconnaître et gérer les symptômes d'anxiété dans la vie de tous les jours.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...",
    category: "Santé mentale",
    tags: ["Anxiété", "Stress", "Bien-être mental"],
    author: {
      id: "a5",
      name: "Dr. Claire Petit",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    status: "review",
    featured: false,
    image: "/placeholder.svg?height=400&width=600",
    publishedAt: null,
    updatedAt: "2024-03-01T09:30:00",
    views: 0,
    comments: 0,
  },
];

// Sample data for categories
const categories = [
  "Cardiologie",
  "Prévention",
  "Santé mentale",
  "Nutrition",
  "Activité physique",
  "Pédiatrie",
  "Dermatologie",
  "Gynécologie",
  "Ophtalmologie",
  "Neurologie",
];

// Sample data for tags
const tags = [
  "Innovation",
  "Recherche",
  "Traitement",
  "Santé",
  "Mode de vie",
  "Nutrition",
  "Sommeil",
  "Bien-être",
  "Stress",
  "Alimentation",
  "Immunité",
  "Vitamines",
  "Sport",
  "Santé cardiovasculaire",
  "Anxiété",
  "Bien-être mental",
];

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<
    (typeof articles)[0] | null
  >(null);
  const [sortBy, setSortBy] = useState<"date" | "views" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Form state for create/edit
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState("draft");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);

  // Filter articles based on search, category, status, and tags
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || article.category === selectedCategory;

    const matchesStatus = !selectedStatus || article.status === selectedStatus;

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => article.tags.includes(tag));

    return matchesSearch && matchesCategory && matchesStatus && matchesTags;
  });

  // Sort articles
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = a.publishedAt
        ? new Date(a.publishedAt).getTime()
        : new Date(a.updatedAt).getTime();
      const dateB = b.publishedAt
        ? new Date(b.publishedAt).getTime()
        : new Date(b.updatedAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortBy === "views") {
      return sortOrder === "asc" ? a.views - b.views : b.views - a.views;
    } else {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
  });

  // Toggle sort order
  const toggleSort = (field: "date" | "views" | "title") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormTitle("");
    setFormSlug("");
    setFormExcerpt("");
    setFormContent("");
    setFormCategory("");
    setFormTags([]);
    setFormStatus("draft");
    setFormFeatured(false);
    setFormImage(null);
    setFormImagePreview(null);
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (article: (typeof articles)[0]) => {
    setSelectedArticle(article);
    setFormTitle(article.title);
    setFormSlug(article.slug);
    setFormExcerpt(article.excerpt);
    setFormContent(article.content);
    setFormCategory(article.category);
    setFormTags(article.tags);
    setFormStatus(article.status);
    setFormFeatured(article.featured);
    setFormImagePreview(article.image);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (article: (typeof articles)[0]) => {
    setSelectedArticle(article);
    setIsDeleteDialogOpen(true);
  };

  // Handle create article
  const handleCreateArticle = () => {
    // In a real app, this would send data to the backend
    console.log("Creating article:", {
      title: formTitle,
      slug: formSlug,
      excerpt: formExcerpt,
      content: formContent,
      category: formCategory,
      tags: formTags,
      status: formStatus,
      featured: formFeatured,
      image: formImage,
    });
    setIsCreateDialogOpen(false);
    resetForm();
  };

  // Handle update article
  const handleUpdateArticle = () => {
    // In a real app, this would send data to the backend
    console.log("Updating article:", {
      id: selectedArticle?.id,
      title: formTitle,
      slug: formSlug,
      excerpt: formExcerpt,
      content: formContent,
      category: formCategory,
      tags: formTags,
      status: formStatus,
      featured: formFeatured,
      image: formImage,
    });
    setIsEditDialogOpen(false);
    resetForm();
  };

  // Handle delete article
  const handleDeleteArticle = () => {
    // In a real app, this would send a delete request to the backend
    console.log("Deleting article:", selectedArticle?.id);
    setIsDeleteDialogOpen(false);
    setSelectedArticle(null);
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Toggle form tag selection
  const toggleFormTag = (tag: string) => {
    if (formTags.includes(tag)) {
      setFormTags(formTags.filter((t) => t !== tag));
    } else {
      setFormTags([...formTags, tag]);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setFormSlug(slug);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non publié";
    return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: fr });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Publié</Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Brouillon
          </Badge>
        );
      case "review":
        return <Badge variant="secondary">En révision</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Articles & Blog</h2>
          <p className="text-muted-foreground">
            Gérez les articles du blog et le contenu éditorial du site
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Nouvel article
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Titre, contenu, auteur..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={selectedCategory || ""}
                  onValueChange={(value) => setSelectedCategory(value || null)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={selectedStatus || ""}
                  onValueChange={(value) => setSelectedStatus(value || null)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="review">En révision</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <ScrollArea className="h-[200px] rounded-md border p-2">
                  <div className="space-y-1">
                    {tags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => toggleTag(tag)}
                        />
                        <label
                          htmlFor={`tag-${tag}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setSelectedStatus(null);
                  setSelectedTags([]);
                }}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total des articles</span>
                <span className="font-medium">{articles.length}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Par statut</span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                      Publiés
                    </span>
                    <span>
                      {articles.filter((a) => a.status === "published").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-gray-300" />
                      Brouillons
                    </span>
                    <span>
                      {articles.filter((a) => a.status === "draft").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-blue-400" />
                      En révision
                    </span>
                    <span>
                      {articles.filter((a) => a.status === "review").length}
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">
                  Articles mis en avant
                </span>
                <div className="flex items-center justify-between text-sm">
                  <span>Nombre d&apos;articles</span>
                  <span>{articles.filter((a) => a.featured).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Liste des articles</CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={`${sortBy}-${sortOrder}`}
                    onValueChange={(value) => {
                      const [field, order] = value.split("-") as [
                        "date" | "views" | "title",
                        "asc" | "desc"
                      ];
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">
                        Date (récent d&apos;abord)
                      </SelectItem>
                      <SelectItem value="date-asc">
                        Date (ancien d&apos;abord)
                      </SelectItem>
                      <SelectItem value="views-desc">
                        Vues (plus vues d&apos;abord)
                      </SelectItem>
                      <SelectItem value="views-asc">
                        Vues (moins vues d&apos;abord)
                      </SelectItem>
                      <SelectItem value="title-asc">Titre (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Titre (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">
                        <div className="flex items-center space-x-1">
                          <span>Titre</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => toggleSort("title")}
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-1">
                          <span>Date</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => toggleSort("date")}
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-1">
                          <span>Vues</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => toggleSort("views")}
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedArticles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Aucun article trouvé.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedArticles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              {article.featured && (
                                <Badge
                                  variant="outline"
                                  className="mr-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300"
                                >
                                  Mis en avant
                                </Badge>
                              )}
                              <span className="truncate max-w-[200px]">
                                {article.title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{article.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="text-xs">
                                {formatDate(
                                  article.publishedAt || article.updatedAt
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(article.status)}
                          </TableCell>
                          <TableCell>
                            {article.views.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEditDialog(article)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Aperçu
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => openDeleteDialog(article)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  Affichage de <strong>{sortedArticles.length}</strong> sur{" "}
                  <strong>{articles.length}</strong> articles
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Article Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Créer un nouvel article</DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous pour créer un nouvel
              article de blog.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Contenu</TabsTrigger>
                <TabsTrigger value="media">Média</TabsTrigger>
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    placeholder="Titre de l'article"
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      if (!formSlug) {
                        generateSlug(e.target.value);
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="slug"
                      placeholder="slug-de-l-article"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => generateSlug(formTitle)}
                      type="button"
                    >
                      Générer
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    L&apos;URL de l&apos;article sera: example.com/blog/
                    {formSlug || "slug-de-l-article"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Extrait</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Bref résumé de l'article"
                    className="min-h-[80px]"
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenu</Label>
                  <Textarea
                    id="content"
                    placeholder="Contenu de l'article..."
                    className="min-h-[300px]"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <div className="space-y-2">
                  <Label>Image principale</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                    >
                      {formImagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={formImagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={(e) => {
                              e.preventDefault();
                              setFormImage(null);
                              setFormImagePreview(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">
                              Cliquez pour télécharger
                            </span>{" "}
                            ou glissez-déposez
                          </p>
                          <p className="text-xs text-muted-foreground">
                            SVG, PNG, JPG ou GIF (MAX. 2MB)
                          </p>
                        </div>
                      )}
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={formCategory}
                      onValueChange={setFormCategory}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="review">En révision</SelectItem>
                        <SelectItem value="published">Publié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <ScrollArea className="h-[200px] rounded-md border p-2">
                    <div className="space-y-1">
                      {tags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`form-tag-${tag}`}
                            checked={formTags.includes(tag)}
                            onCheckedChange={() => toggleFormTag(tag)}
                          />
                          <label
                            htmlFor={`form-tag-${tag}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formFeatured}
                    onCheckedChange={(checked) => setFormFeatured(!!checked)}
                  />
                  <label
                    htmlFor="featured"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mettre en avant cet article
                  </label>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateArticle}>Créer l&apos;article</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;article</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l&apos;article.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Contenu</TabsTrigger>
                <TabsTrigger value="media">Média</TabsTrigger>
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Titre</Label>
                  <Input
                    id="edit-title"
                    placeholder="Titre de l'article"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="edit-slug"
                      placeholder="slug-de-l-article"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => generateSlug(formTitle)}
                      type="button"
                    >
                      Générer
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    L&apos;URL de l&apos;article sera: example.com/blog/
                    {formSlug}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-excerpt">Extrait</Label>
                  <Textarea
                    id="edit-excerpt"
                    placeholder="Bref résumé de l'article"
                    className="min-h-[80px]"
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-content">Contenu</Label>
                  <Textarea
                    id="edit-content"
                    placeholder="Contenu de l'article..."
                    className="min-h-[300px]"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <div className="space-y-2">
                  <Label>Image principale</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="edit-dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                    >
                      {formImagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={formImagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={(e) => {
                              e.preventDefault();
                              setFormImage(null);
                              setFormImagePreview(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">
                              Cliquez pour télécharger
                            </span>{" "}
                            ou glissez-déposez
                          </p>
                          <p className="text-xs text-muted-foreground">
                            SVG, PNG, JPG ou GIF (MAX. 2MB)
                          </p>
                        </div>
                      )}
                      <input
                        id="edit-dropzone-file"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Catégorie</Label>
                    <Select
                      value={formCategory}
                      onValueChange={setFormCategory}
                    >
                      <SelectTrigger id="edit-category">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Statut</Label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger id="edit-status">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="review">En révision</SelectItem>
                        <SelectItem value="published">Publié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <ScrollArea className="h-[200px] rounded-md border p-2">
                    <div className="space-y-1">
                      {tags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-form-tag-${tag}`}
                            checked={formTags.includes(tag)}
                            onCheckedChange={() => toggleFormTag(tag)}
                          />
                          <label
                            htmlFor={`edit-form-tag-${tag}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-featured"
                    checked={formFeatured}
                    onCheckedChange={(checked) => setFormFeatured(!!checked)}
                  />
                  <label
                    htmlFor="edit-featured"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mettre en avant cet article
                  </label>
                </div>

                <div className="space-y-2">
                  <Label>Statistiques</Label>
                  <div className="rounded-md border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Vues
                      </span>
                      <span className="font-medium">
                        {selectedArticle?.views.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Commentaires
                      </span>
                      <span className="font-medium">
                        {selectedArticle?.comments}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Date de publication
                      </span>
                      <span className="text-sm">
                        {selectedArticle?.publishedAt
                          ? format(
                              new Date(selectedArticle.publishedAt),
                              "dd/MM/yyyy"
                            )
                          : "Non publié"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Dernière modification
                      </span>
                      <span className="text-sm">
                        {selectedArticle?.updatedAt
                          ? format(
                              new Date(selectedArticle?.updatedAt || ""),
                              "dd/MM/yyyy"
                            )
                          : "Non modifié"}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleUpdateArticle}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Article Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir supprimer cet article ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;article sera définitivement
              supprimé de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedArticle && (
            <div className="py-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{selectedArticle.title}</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {selectedArticle.excerpt}
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteArticle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
