/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Check,
  ChevronLeft,
  MessageSquare,
  Search,
  Star,
  ThumbsUp,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Sample data for recent appointments
const recentAppointments = [
  {
    id: "app1",
    doctorName: "Dr. Sophie Martin",
    doctorSpecialty: "Médecin Généraliste",
    date: new Date(2024, 2, 10),
    location: "Cabinet Médical Saint-Michel",
    avatar: "/placeholder.svg?height=40&width=40",
    hasReview: false,
  },
  {
    id: "app2",
    doctorName: "Dr. Thomas Dubois",
    doctorSpecialty: "Cardiologue",
    date: new Date(2024, 1, 25),
    location: "Hôpital Saint-Louis",
    avatar: "/placeholder.svg?height=40&width=40",
    hasReview: true,
  },
  {
    id: "app3",
    doctorName: "Dr. Émilie Laurent",
    doctorSpecialty: "Dermatologue",
    date: new Date(2024, 1, 15),
    location: "Centre Médical Montparnasse",
    avatar: "/placeholder.svg?height=40&width=40",
    hasReview: false,
  },
  {
    id: "app4",
    doctorName: "Dr. Antoine Moreau",
    doctorSpecialty: "Ophtalmologue",
    date: new Date(2024, 0, 30),
    location: "Clinique de la Vision",
    avatar: "/placeholder.svg?height=40&width=40",
    hasReview: false,
  },
];

// Sample data for establishments
const establishments = [
  {
    id: "est1",
    name: "Hôpital Saint-Louis",
    type: "Hôpital Universitaire",
    lastVisit: new Date(2024, 1, 25),
    image: "/placeholder.svg?height=40&width=40",
    hasReview: false,
  },
  {
    id: "est2",
    name: "Centre Médical Montparnasse",
    type: "Centre Médical",
    lastVisit: new Date(2024, 1, 15),
    image: "/placeholder.svg?height=40&width=40",
    hasReview: true,
  },
  {
    id: "est3",
    name: "Clinique de la Vision",
    type: "Clinique Privée",
    lastVisit: new Date(2024, 0, 30),
    image: "/placeholder.svg?height=40&width=40",
    hasReview: false,
  },
];

// Rating criteria for doctors
const doctorCriteria = [
  { id: "punctuality", label: "Ponctualité" },
  { id: "listening", label: "Écoute et attention" },
  { id: "explanation", label: "Clarté des explications" },
  { id: "competence", label: "Compétence perçue" },
  { id: "recommendation", label: "Recommanderiez-vous ce médecin ?" },
];

// Rating criteria for establishments
const establishmentCriteria = [
  { id: "cleanliness", label: "Propreté des locaux" },
  { id: "waiting", label: "Temps d'attente" },
  { id: "staff", label: "Accueil du personnel" },
  { id: "equipment", label: "Équipements et modernité" },
  { id: "accessibility", label: "Accessibilité" },
];

export default function GiveFeedbackPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"doctors" | "establishments">(
    "doctors"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  // Filter appointments based on search query
  const filteredAppointments = recentAppointments.filter(
    (app) =>
      app.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.doctorSpecialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter establishments based on search query
  const filteredEstablishments = establishments.filter(
    (est) =>
      est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle item selection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    setStep(2);
    // Reset ratings and comment
    setRatings({});
    setOverallRating(0);
    setComment("");
  };

  // Handle rating change
  const handleRatingChange = (criteriaId: string, value: number) => {
    setRatings({ ...ratings, [criteriaId]: value });

    // Calculate average rating
    const criteria =
      selectedTab === "doctors" ? doctorCriteria : establishmentCriteria;
    const totalRatings = { ...ratings, [criteriaId]: value };
    const filledRatings = criteria.filter(
      (c) => totalRatings[c.id] !== undefined
    ).length;

    if (filledRatings > 0) {
      const sum = criteria.reduce(
        (acc, c) => acc + (totalRatings[c.id] || 0),
        0
      );
      setOverallRating(Math.round((sum / criteria.length) * 10) / 10);
    } else {
      setOverallRating(0);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccessDialogOpen(true);
    }, 1500);
  };

  // Check if form is valid
  const isFormValid = () => {
    const criteria =
      selectedTab === "doctors" ? doctorCriteria : establishmentCriteria;
    const hasAllRatings = criteria.every((c) => ratings[c.id] !== undefined);
    return hasAllRatings && comment.length >= 10;
  };

  // Go back to previous step
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  // Handle success dialog close
  const handleSuccessDialogClose = () => {
    setIsSuccessDialogOpen(false);
    router.push("/dashboard/patient/reviews/my-feedback");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Donner un Avis</h2>
          <p className="text-muted-foreground">
            Partagez votre expérience et aidez d&apos;autres patients à faire
            leurs choix
          </p>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Choisir un médecin ou un établissement</CardTitle>
            <CardDescription>
              Sélectionnez un médecin ou un établissement que vous avez
              récemment visité
            </CardDescription>
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={selectedTab}
                onValueChange={(value) =>
                  setSelectedTab(value as "doctors" | "establishments")
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Type d'avis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctors">Médecins</SelectItem>
                  <SelectItem value="establishments">Établissements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {selectedTab === "doctors" ? (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Vos rendez-vous récents</h3>
                {filteredAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">
                      Aucun rendez-vous trouvé
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Vous n&apos;avez pas de rendez-vous récents ou aucun ne
                      correspond à votre recherche.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredAppointments.map((appointment) => (
                      <Card
                        key={appointment.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          appointment.hasReview ? "opacity-60" : ""
                        }`}
                        onClick={() =>
                          !appointment.hasReview &&
                          handleSelectItem(appointment)
                        }
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage
                                src={appointment.avatar}
                                alt={appointment.doctorName}
                              />
                              <AvatarFallback>
                                {appointment.doctorName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {appointment.doctorName}
                              </CardTitle>
                              <CardDescription>
                                {appointment.doctorSpecialty}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="grid gap-1">
                            <div className="text-sm">
                              {format(appointment.date, "d MMMM yyyy", {
                                locale: fr,
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.location}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          {appointment.hasReview ? (
                            <Badge variant="outline" className="bg-muted">
                              <Check className="mr-1 h-3 w-3" />
                              Avis déjà donné
                            </Badge>
                          ) : (
                            <Button size="sm">Donner un avis</Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">
                  Établissements récemment visités
                </h3>
                {filteredEstablishments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">
                      Aucun établissement trouvé
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Vous n&apos;avez pas visité d&apos;établissements
                      récemment ou aucun ne correspond à votre recherche.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredEstablishments.map((establishment) => (
                      <Card
                        key={establishment.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          establishment.hasReview ? "opacity-60" : ""
                        }`}
                        onClick={() =>
                          !establishment.hasReview &&
                          handleSelectItem(establishment)
                        }
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-md overflow-hidden">
                              <img
                                src={establishment.image || "/placeholder.svg"}
                                alt={establishment.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {establishment.name}
                              </CardTitle>
                              <CardDescription>
                                {establishment.type}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="grid gap-1">
                            <div className="text-sm">
                              Dernière visite:{" "}
                              {format(establishment.lastVisit, "d MMMM yyyy", {
                                locale: fr,
                              })}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          {establishment.hasReview ? (
                            <Badge variant="outline" className="bg-muted">
                              <Check className="mr-1 h-3 w-3" />
                              Avis déjà donné
                            </Badge>
                          ) : (
                            <Button size="sm">Donner un avis</Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>
              Votre avis sur{" "}
              {selectedTab === "doctors"
                ? selectedItem.doctorName
                : selectedItem.name}
            </CardTitle>
            <CardDescription>
              Partagez votre expérience pour aider d&apos;autres patients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              {selectedTab === "doctors" ? (
                <>
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={selectedItem.avatar}
                      alt={selectedItem.doctorName}
                    />
                    <AvatarFallback>
                      {selectedItem.doctorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">
                      {selectedItem.doctorName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.doctorSpecialty}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(selectedItem.date, "d MMMM yyyy", { locale: fr })}{" "}
                      • {selectedItem.location}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-md overflow-hidden">
                    <img
                      src={selectedItem.image || "/placeholder.svg"}
                      alt={selectedItem.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{selectedItem.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dernière visite:{" "}
                      {format(selectedItem.lastVisit, "d MMMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                </>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-base font-medium mb-4">
                Évaluation détaillée
              </h3>
              <div className="space-y-6">
                {(selectedTab === "doctors"
                  ? doctorCriteria
                  : establishmentCriteria
                ).map((criteria) => (
                  <div key={criteria.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={criteria.id}>{criteria.label}</Label>
                      <div className="flex items-center">
                        {ratings[criteria.id] && (
                          <span className="mr-2 text-sm font-medium">
                            {ratings[criteria.id]}/5
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Button
                          key={value}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => handleRatingChange(criteria.id, value)}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              (ratings[criteria.id] || 0) >= value
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span className="sr-only">{value} étoiles</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">Note globale</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`h-5 w-5 ${
                          Math.round(overallRating) >= value
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold">
                    {overallRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <Progress value={overallRating * 20} className="h-2" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire</Label>
              <Textarea
                id="comment"
                placeholder="Partagez votre expérience en détail..."
                className="min-h-[120px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 caractères.{" "}
                {comment.length < 10
                  ? `Encore ${10 - comment.length} caractères requis.`
                  : ""}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroup
                value={anonymous ? "anonymous" : "public"}
                onValueChange={(value) => setAnonymous(value === "anonymous")}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Publier avec mon nom</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="anonymous" id="anonymous" />
                  <Label htmlFor="anonymous">Publier anonymement</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button variant="outline" onClick={goBack}>
              Retour
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Envoi en cours...
                </>
              ) : (
                "Soumettre mon avis"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Success Dialog */}
      <AlertDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <ThumbsUp className="h-8 w-8 text-green-600" />
            </div>
            <AlertDialogTitle className="text-center mt-4">
              Merci pour votre avis !
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Votre avis a été enregistré avec succès et sera publié après
              modération. Votre contribution aide d&apos;autres patients à faire
              des choix éclairés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessDialogClose}>
              Voir mes avis
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
