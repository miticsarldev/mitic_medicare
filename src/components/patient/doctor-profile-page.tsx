"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
  CalendarIcon,
  Clock,
  MapPin,
  Phone,
  Mail,
  Award,
  BookOpen,
  Briefcase,
  Heart,
  Star,
  MessageSquare,
  CheckCircle2,
  Building2,
  GraduationCap,
} from "lucide-react";
import {
  addDoctorToFavoritesDoctors,
  bookAppointment,
  getDoctorAvailableTimeSlots,
  removeDoctorToFavoritesDoctors,
  submitDoctorReview,
} from "@/app/dashboard/patient/actions";
import { DoctorProfileComplete } from "@/app/dashboard/patient/types";
import { Review } from "@prisma/client";
import { getSpecializationLabel } from "@/utils/function";

export default function DoctorProfile({
  doctor,
}: {
  doctor: DoctorProfileComplete;
}) {
  const router = useRouter();
  const { toast } = useToast();

  // State for dialogs and interactions
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(doctor.isFavorite || false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const data = await getDoctorAvailableTimeSlots(doctor.id, selectedDate);
        setAvailableSlots(data);
      } catch (err) {
        console.error("Erreur chargement créneaux :", err);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    if (selectedDate) fetchSlots();
  }, [selectedDate, doctor.id]);

  // Calculate average rating
  const avgRating = doctor.reviews?.length
    ? doctor.reviews.reduce(
        (sum: number, review: Review) => sum + review.rating,
        0
      ) / doctor.reviews.length
    : 0;

  // Format experience years
  const experienceYears = doctor.experience
    ? Number.parseInt(doctor.experience.match(/\d+/)?.[0] || "0")
    : 0;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Date invalide";
    const formatted = format(date, "EEEE d MMMM yyyy", { locale: fr });

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Toggle favorite
  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeDoctorToFavoritesDoctors({ doctorId: doctor.id });
      } else {
        await addDoctorToFavoritesDoctors({ doctorId: doctor.id });
      }

      setIsFavorite(!isFavorite);

      toast({
        title: !isFavorite ? "Ajouté aux favoris" : "Retiré des favoris",
        description: `${doctor.user.name} a bien été ${!isFavorite ? "ajouté à" : "retiré de"} vos favoris.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour les favoris.",
      });
    }
  };

  // Submit a review
  const submitReview = async () => {
    if (!reviewComment.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez saisir un commentaire.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitDoctorReview({
        doctorId: doctor.id,
        rating: reviewRating,
        comment: reviewComment,
        isAnonymous,
        title: "Avis sur le médecin",
      });

      toast({
        title: "Avis envoyé",
        description: "Merci pour votre avis. Il sera publié après modération.",
      });

      setIsReviewDialogOpen(false);
      setReviewRating(5);
      setReviewComment("");
      setIsAnonymous(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer votre avis. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Book appointment
  const handleBookingSubmit = async () => {
    if (!selectedSlot?.date || !selectedSlot?.time || !reason.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("doctorId", doctor.id);
    formData.append("scheduledDate", selectedSlot.date);
    formData.append("scheduledTime", selectedSlot.time);
    formData.append("reason", reason);

    try {
      await bookAppointment(formData);
      toast({
        title: "Rendez-vous confirmé",
        description: `Le rendez-vous avec ${doctor.user.name} est confirmé.`,
      });
      setIsBookingDialogOpen(false);
      router.push("/dashboard/patient/appointments/all");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Erreur",
        description: "Impossible de programmer le rendez-vous.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container p-2 sm:p-4 mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-2 sm:p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-28 w-28 md:h-40 md:w-40 border-4 border-white dark:border-gray-800 shadow-lg">
              <AvatarImage
                src={
                  doctor.user.profile?.avatarUrl ||
                  "/placeholder.svg?height=160&width=160"
                }
                alt={doctor.user.name}
              />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {getInitials(doctor.user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(avgRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : i < Math.ceil(avgRating)
                        ? "text-yellow-400 fill-yellow-400 opacity-50"
                        : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">
                {avgRating.toFixed(1)} ({doctor.reviews?.length || 0} avis)
              </span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
                  {doctor.user.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                  <Badge variant="secondary" className="text-primary">
                    {doctor.specialization}
                  </Badge>
                  {doctor.isVerified && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Vérifié
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={toggleFavorite}
                >
                  <Heart
                    className={`h-4 w-4 ${isFavorite ? "text-red-500 fill-red-500" : ""}`}
                  />
                  {isFavorite ? "Favori" : "Ajouter aux favoris"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {doctor.hospital?.name || "Médecin indépendant"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {doctor.department?.name || ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {experienceYears} ans d&apos;expérience
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pratique médicale
                  </p>
                </div>
              </div>

              {doctor.isIndependent && (
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat("fr-ML", {
                        style: "currency",
                        currency: "XOF",
                        minimumFractionDigits: 0,
                      }).format(doctor.consultationFee || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tarif consultation
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="about">À propos</TabsTrigger>
              <TabsTrigger value="reviews">Avis</TabsTrigger>
              <TabsTrigger value="location">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Présentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {doctor.user.profile?.bio ||
                      `Dr. ${doctor.user.name} est un médecin spécialisé en ${doctor.specialization} avec ${experienceYears} ans d'expérience. 
                      ${
                        doctor.hospital
                          ? `Il exerce actuellement à ${doctor.hospital.name} dans le département de ${doctor.department?.name}.`
                          : "Il exerce actuellement en tant que médecin indépendant."
                      }`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spécialités</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50">
                      {getSpecializationLabel(doctor.specialization)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="mt-0.5">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Doctorat en Médecine</h4>
                      <p className="text-sm text-muted-foreground">
                        {doctor.education?.includes("Université")
                          ? doctor.education
                          : "Université de Bamako, Faculté de Médecine"}
                      </p>
                    </div>
                  </div>

                  {doctor.specialization && (
                    <div className="flex gap-4">
                      <div className="mt-0.5">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          Spécialisation en {doctor.specialization}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Centre Hospitalier Universitaire du Point G
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Avis des patients</CardTitle>
                  <CardDescription>
                    {doctor.reviews?.length || 0} avis • Note moyenne:{" "}
                    {avgRating.toFixed(1)}/5
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {doctor.reviews && doctor.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {doctor.reviews.map((review: Review) => (
                        <div
                          key={review.id}
                          className="pb-6 border-b last:border-0"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {review.isAnonymous ? "AN" : "PT"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {review.isAnonymous
                                    ? "Patient anonyme"
                                    : "Patient"}
                                </p>
                                <div className="flex mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <p className="mt-3 text-gray-700 dark:text-gray-300">
                            {review.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Aucun avis pour le moment
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setIsReviewDialogOpen(true)}
                      >
                        Laisser un avis
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Adresse et contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.hospital && (
                    <div className="flex gap-3">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{doctor.hospital.name}</p>
                        <p className="text-muted-foreground">
                          {doctor.hospital.address}, {doctor.hospital.city},{" "}
                          {doctor.hospital.state}, {doctor.hospital.country}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p className="text-muted-foreground">
                        {doctor.user.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">
                        {doctor.user.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Stats Card */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {experienceYears}+
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Années d&apos;expérience
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {doctor.reviews?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Avis patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2 sm:space-y-4">
          {/* Appointment Card */}
          <Card className="sticky top-8">
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Prendre rendez-vous
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Consultez les disponibilités et réservez en ligne
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Calendar
                mode="single"
                className="rounded-md border mb-4"
                selected={new Date(selectedDate)}
                onSelect={(date) => {
                  if (date) setSelectedDate(date.toISOString().split("T")[0]);
                }}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />

              <div className="mt-4 space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Horaires disponibles
                </h4>
                {isLoadingSlots ? (
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availableSlots.map((time) => (
                      <Button
                        key={time}
                        variant={
                          selectedSlot?.time === time &&
                          selectedSlot?.date === selectedDate
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setSelectedSlot({ date: selectedDate, time });
                        }}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aucun créneau disponible ce jour-là.
                  </p>
                )}
              </div>

              <Separator className="my-3" />

              <div className="space-y-2">
                <Button
                  className="w-full"
                  disabled={!selectedSlot || !selectedDate}
                  onClick={() => {
                    if (!selectedSlot) {
                      toast({
                        title: "Sélection requise",
                        description:
                          "Veuillez d'abord sélectionner une date et une heure.",
                        variant: "destructive",
                      });
                      return;
                    }

                    setIsBookingDialogOpen(true);
                  }}
                >
                  Confirmer le rendez-vous
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>Besoin d&apos;aide? Contactez-nous</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Laisser un avis</DialogTitle>
            <DialogDescription>
              Partagez votre expérience avec {doctor.user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= reviewRating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {reviewRating === 1
                  ? "Très insatisfait"
                  : reviewRating === 2
                    ? "Insatisfait"
                    : reviewRating === 3
                      ? "Neutre"
                      : reviewRating === 4
                        ? "Satisfait"
                        : "Très satisfait"}
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Votre commentaire</Label>
              <Textarea
                id="comment"
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce médecin..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <Label htmlFor="anonymous">Publier anonymement</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={submitReview} disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours..." : "Publier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle>Confirmer le rendez-vous</DialogTitle>
            <DialogDescription>
              {doctor.user.name} –{" "}
              {selectedSlot?.date
                ? formatDate(selectedSlot.date)
                : "Date invalide"}{" "}
              à {selectedSlot?.time || ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Motif du rendez-vous
            </Label>
            <Textarea
              id="reason"
              placeholder="Décrivez brièvement la raison de votre consultation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Ces informations aideront le médecin à se préparer pour votre
              consultation.
            </p>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBookingDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              disabled={!reason.trim() || isSubmitting}
              onClick={handleBookingSubmit}
            >
              {isSubmitting ? "Traitement..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
