"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Edit,
  FileQuestion,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Sample data for FAQ items
const faqItems = [
  {
    id: "1",
    question: "Comment prendre rendez-vous avec un médecin ?",
    answer:
      "Pour prendre rendez-vous avec un médecin, connectez-vous à votre compte, accédez à la section 'Rendez-vous', cliquez sur 'Nouveau rendez-vous', sélectionnez le médecin souhaité, choisissez une date et un horaire disponible, puis confirmez votre rendez-vous. Vous recevrez une confirmation par email.",
    category: "Rendez-vous",
    isPublished: true,
    order: 1,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-02-10T14:20:00",
    views: 1245,
  },
  {
    id: "2",
    question: "Comment accéder à mon dossier médical ?",
    answer:
      "Pour accéder à votre dossier médical, connectez-vous à votre compte et cliquez sur 'Mon dossier médical' dans le menu principal. Vous y trouverez l'ensemble de vos consultations, ordonnances, résultats d'analyses et autres documents médicaux. Si vous rencontrez des difficultés, contactez notre service client.",
    category: "Dossier médical",
    isPublished: true,
    order: 2,
    createdAt: "2024-01-20T09:15:00",
    updatedAt: "2024-01-20T09:15:00",
    views: 980,
  },
  {
    id: "3",
    question: "Comment modifier ou annuler un rendez-vous ?",
    answer:
      "Pour modifier ou annuler un rendez-vous, connectez-vous à votre compte, accédez à la section 'Mes rendez-vous', sélectionnez le rendez-vous concerné, puis cliquez sur 'Modifier' ou 'Annuler'. Les annulations doivent être effectuées au moins 24 heures à l'avance.",
    category: "Rendez-vous",
    isPublished: true,
    order: 3,
    createdAt: "2024-01-25T11:45:00",
    updatedAt: "2024-02-05T16:30:00",
    views: 875,
  },
  
  {
    id: "5",
    question: "Comment sont protégées mes données médicales ?",
    answer:
      "Vos données médicales sont protégées par des mesures de sécurité strictes conformes au RGPD et aux normes de santé. Nous utilisons le chiffrement, l'authentification à deux facteurs et des audits réguliers. Seuls les professionnels de santé impliqués dans votre parcours de soins peuvent y accéder, avec votre consentement.",
    category: "Confidentialité",
    isPublished: true,
    order: 5,
    createdAt: "2024-02-05T10:00:00",
    updatedAt: "2024-02-15T11:30:00",
    views: 720,
  },
  
  {
    id: "7",
    question: "Comment mettre à jour mes informations personnelles ?",
    answer:
      "Pour mettre à jour vos informations personnelles, connectez-vous à votre compte, cliquez sur 'Mon profil' dans le menu déroulant de votre nom d'utilisateur, puis sur 'Modifier'. Vous pourrez y mettre à jour vos coordonnées, informations d'assurance et préférences de communication.",
    category: "Compte",
    isPublished: true,
    order: 7,
    createdAt: "2024-02-15T09:30:00",
    updatedAt: "2024-02-15T09:30:00",
    views: 430,
  },
];

// Sample data for categories
const categories = [
  "Rendez-vous",
  "Dossier médical",
  "Téléconsultation",
  "Confidentialité",
  "Facturation",
  "Compte",
  "Abonnement",
  "Technique",
  "Général",
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<(typeof faqItems)[0] | null>(
    null
  );
  const [sortBy, setSortBy] = useState<"order" | "views" | "date">("order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);

  // Form state for create/edit
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formOrder, setFormOrder] = useState(0);

  // Filter FAQ items based on search, category, and published status
  const filteredFAQs = faqItems.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || faq.category === selectedCategory;

    const matchesPublished = !showPublishedOnly || faq.isPublished;

    return matchesSearch && matchesCategory && matchesPublished;
  });

  // Sort FAQ items
  const sortedFAQs = [...filteredFAQs].sort((a, b) => {
    if (sortBy === "order") {
      return sortOrder === "asc" ? a.order - b.order : b.order - a.order;
    } else if (sortBy === "views") {
      return sortOrder === "asc" ? a.views - b.views : b.views - a.views;
    } else {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }
  });

  // Toggle sort order
  const toggleSort = (field: "order" | "views" | "date") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormQuestion("");
    setFormAnswer("");
    setFormCategory("");
    setFormIsPublished(true);
    setFormOrder(faqItems.length + 1);
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setFormOrder(faqItems.length + 1);
    setIsCreateDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (faq: (typeof faqItems)[0]) => {
    setSelectedFAQ(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormCategory(faq.category);
    setFormIsPublished(faq.isPublished);
    setFormOrder(faq.order);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (faq: (typeof faqItems)[0]) => {
    setSelectedFAQ(faq);
    setIsDeleteDialogOpen(true);
  };

  // Handle create FAQ
  const handleCreateFAQ = () => {
    // In a real app, this would send data to the backend
    console.log("Creating FAQ:", {
      question: formQuestion,
      answer: formAnswer,
      category: formCategory,
      isPublished: formIsPublished,
      order: formOrder,
    });
    setIsCreateDialogOpen(false);
    resetForm();
  };

  // Handle update FAQ
  const handleUpdateFAQ = () => {
    // In a real app, this would send data to the backend
    console.log("Updating FAQ:", {
      id: selectedFAQ?.id,
      question: formQuestion,
      answer: formAnswer,
      category: formCategory,
      isPublished: formIsPublished,
      order: formOrder,
    });
    setIsEditDialogOpen(false);
    resetForm();
  };

  // Handle delete FAQ
  const handleDeleteFAQ = () => {
    // In a real app, this would send a delete request to the backend
    console.log("Deleting FAQ:", selectedFAQ?.id);
    setIsDeleteDialogOpen(false);
    setSelectedFAQ(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">FAQ</h2>
          <p className="text-muted-foreground">
            Gérez les questions fréquemment posées et leurs réponses
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle question
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
                    placeholder="Rechercher une question..."
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published-only"
                  checked={showPublishedOnly}
                  onCheckedChange={(checked) => setShowPublishedOnly(!!checked)}
                />
                <label
                  htmlFor="published-only"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Afficher uniquement les questions publiées
                </label>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setShowPublishedOnly(false);
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
                <span className="text-sm">Total des questions</span>
                <span className="font-medium">{faqItems.length}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Par statut</span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                      Publiées
                    </span>
                    <span>
                      {faqItems.filter((faq) => faq.isPublished).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-gray-300" />
                      Non publiées
                    </span>
                    <span>
                      {faqItems.filter((faq) => !faq.isPublished).length}
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Par catégorie</span>
                <div className="space-y-1">
                  {categories.slice(0, 5).map((category) => {
                    const count = faqItems.filter(
                      (faq) => faq.category === category
                    ).length;
                    return (
                      <div
                        key={category}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{category}</span>
                        <span>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Liste des questions</CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={`${sortBy}-${sortOrder}`}
                    onValueChange={(value) => {
                      const [field, order] = value.split("-") as [
                        "order" | "views" | "date",
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
                      <SelectItem value="order-asc">
                        Ordre (croissant)
                      </SelectItem>
                      <SelectItem value="order-desc">
                        Ordre (décroissant)
                      </SelectItem>
                      <SelectItem value="views-desc">
                        Vues (plus vues d&apos;abord)
                      </SelectItem>
                      <SelectItem value="views-asc">
                        Vues (moins vues d&apos;abord)
                      </SelectItem>
                      <SelectItem value="date-desc">
                        Date (récent d&apos;abord)
                      </SelectItem>
                      <SelectItem value="date-asc">
                        Date (ancien d&apos;abord)
                      </SelectItem>
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
                      <TableHead className="w-[50px]">
                        <div className="flex items-center space-x-1">
                          <span>#</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => toggleSort("order")}
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableHead>
                      <TableHead className="w-[300px]">Question</TableHead>
                      <TableHead>Catégorie</TableHead>
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
                      <TableHead>
                        <div className="flex items-center space-x-1">
                          <span>Mise à jour</span>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedFAQs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Aucune question trouvée.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedFAQs.map((faq) => (
                        <TableRow key={faq.id}>
                          <TableCell>{faq.order}</TableCell>
                          <TableCell className="font-medium">
                            <div className="truncate max-w-[250px]">
                              {faq.question}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{faq.category}</Badge>
                          </TableCell>
                          <TableCell>{faq.views.toLocaleString()}</TableCell>
                          <TableCell>{formatDate(faq.updatedAt)}</TableCell>
                          <TableCell>
                            {faq.isPublished ? (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                Publié
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-muted-foreground"
                              >
                                Non publié
                              </Badge>
                            )}
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
                                  onClick={() => openEditDialog(faq)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {faq.order > 1 ? (
                                    <>
                                      <ChevronUp className="mr-2 h-4 w-4" />
                                      Monter
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="mr-2 h-4 w-4" />
                                      Descendre
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => openDeleteDialog(faq)}
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
                  Affichage de <strong>{sortedFAQs.length}</strong> sur{" "}
                  <strong>{faqItems.length}</strong> questions
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
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Aperçu de la FAQ</CardTitle>
              <CardDescription>
                Prévisualisation de la FAQ telle qu&apos;elle apparaîtra sur le
                site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {sortedFAQs
                  .filter((faq) => faq.isPublished)
                  .map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create FAQ Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle question</DialogTitle>
            <DialogDescription>
              Créez une nouvelle question pour la FAQ.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="Saisissez la question..."
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Réponse</Label>
              <Textarea
                id="answer"
                placeholder="Saisissez la réponse..."
                className="min-h-[200px]"
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
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
                <Label htmlFor="order">Ordre d&apos;affichage</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="published"
                checked={formIsPublished}
                onCheckedChange={(checked) => setFormIsPublished(!!checked)}
              />
              <label
                htmlFor="published"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Publier immédiatement
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateFAQ}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la question</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la question.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-question">Question</Label>
              <Input
                id="edit-question"
                placeholder="Saisissez la question..."
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-answer">Réponse</Label>
              <Textarea
                id="edit-answer"
                placeholder="Saisissez la réponse..."
                className="min-h-[200px]"
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Catégorie</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
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
                <Label htmlFor="edit-order">Ordre d&apos;affichage</Label>
                <Input
                  id="edit-order"
                  type="number"
                  min="1"
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-published"
                checked={formIsPublished}
                onCheckedChange={(checked) => setFormIsPublished(!!checked)}
              />
              <label
                htmlFor="edit-published"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Publier
              </label>
            </div>

            <div className="space-y-2">
              <Label>Statistiques</Label>
              <div className="rounded-md border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vues</span>
                  <span className="font-medium">
                    {selectedFAQ?.views.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Date de création
                  </span>
                  <span className="text-sm">
                    {selectedFAQ ? formatDate(selectedFAQ.createdAt) : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Dernière modification
                  </span>
                  <span className="text-sm">
                    {selectedFAQ ? formatDate(selectedFAQ.updatedAt) : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleUpdateFAQ}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete FAQ Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir supprimer cette question ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La question sera définitivement
              supprimée de la FAQ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedFAQ && (
            <div className="py-4">
              <div className="flex items-center space-x-2">
                <FileQuestion className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{selectedFAQ.question}</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Catégorie: {selectedFAQ.category}
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFAQ}
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
