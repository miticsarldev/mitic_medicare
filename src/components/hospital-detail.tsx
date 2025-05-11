"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Star,
  Users,
  Grid3X3,
  Clock,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { HospitalWithDetails } from "@/types/ui-actions.types";

interface HospitalDetailProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hospital: HospitalWithDetails;
}

export default function HospitalDetail({ hospital }: HospitalDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = hospital.reviews.filter(
      (review) => review.rating === rating
    ).length;
    const percentage =
      hospital.reviews.length > 0 ? (count / hospital.reviews.length) * 100 : 0;

    return { rating, count, percentage };
  });

  return (
    <div className="py-6 px-4">
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-primary">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/search?type=hospital" className="hover:text-primary">
            Hôpitaux
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{hospital.name}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            className="bg-white dark:bg-gray-950 rounded-xl border shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-primary/10 to-primary/5">
              {hospital.logoUrl ? (
                <Image
                  src={hospital.logoUrl || "/placeholder.svg"}
                  alt={hospital.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building className="h-24 w-24 text-primary/40" />
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {hospital.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={`star-${hospital.id}-${i}`}
                          className={`h-5 w-5 ${
                            i < Math.floor(hospital.avgRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : i < Math.ceil(hospital.avgRating)
                                ? "text-yellow-400 fill-yellow-400 opacity-50"
                                : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground">
                      {hospital.avgRating.toFixed(1)} ({hospital.reviews.length}{" "}
                      avis)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <MapPin className="h-3 w-3" /> {hospital.city},{" "}
                      {hospital.state}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Users className="h-3 w-3" /> {hospital.doctors.length}{" "}
                      Médecins
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Grid3X3 className="h-3 w-3" />{" "}
                      {hospital.departments.length} Départements
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Tabs
              defaultValue="overview"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="doctors">Médecins</TabsTrigger>
                <TabsTrigger value="departments">Départements</TabsTrigger>
                <TabsTrigger value="reviews">Avis</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="overview" className="mt-0">
                  <motion.div
                    key="overview"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={containerVariants}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>À propos de {hospital.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.p
                          variants={itemVariants}
                          className="text-muted-foreground"
                        >
                          {hospital.description ||
                            `${hospital.name} est un établissement de santé situé à ${hospital.city}, ${hospital.state}. L'hôpital propose une gamme complète de services médicaux et dispose d'une équipe de professionnels de la santé qualifiés.`}
                        </motion.p>

                        <motion.div
                          variants={itemVariants}
                          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
                        >
                          <div className="space-y-4">
                            <h3 className="font-medium">Coordonnées</h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {hospital.address}, {hospital.city},{" "}
                                  {hospital.state}, {hospital.zipCode}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{hospital.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{hospital.email}</span>
                              </div>
                              {hospital.website && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                  <a
                                    href={hospital.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {hospital.website.replace(
                                      /^https?:\/\//,
                                      ""
                                    )}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Départements populaires</CardTitle>
                        <CardDescription>
                          Découvrez les départements spécialisés de{" "}
                          {hospital.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <motion.div
                          variants={itemVariants}
                          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                        >
                          {hospital.departments
                            .slice(0, 6)
                            .map((department) => (
                              <Link
                                key={department.id}
                                href={`/departments/${department.id}`}
                                className="block"
                              >
                                <Card className="h-full hover:border-primary/50 transition-colors">
                                  <CardHeader className="p-4">
                                    <CardTitle className="text-base">
                                      {department.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                      {department.doctors.length} médecins
                                    </CardDescription>
                                  </CardHeader>
                                </Card>
                              </Link>
                            ))}
                        </motion.div>

                        {hospital.departments.length > 6 && (
                          <motion.div
                            variants={itemVariants}
                            className="mt-4 text-center"
                          >
                            <Button
                              variant="outline"
                              onClick={() => setActiveTab("departments")}
                            >
                              Voir tous les départements
                            </Button>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Médecins populaires</CardTitle>
                        <CardDescription>
                          Rencontrez les médecins de {hospital.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <motion.div
                          variants={itemVariants}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {hospital.doctors
                            .sort((a, b) => b.avgRating - a.avgRating)
                            .slice(0, 4)
                            .map((doctor) => (
                              <Link
                                key={doctor.id}
                                href={`/dashboard/patient/doctors/${doctor.id}`}
                                className="block"
                              >
                                <Card className="h-full hover:border-primary/50 transition-colors">
                                  <CardContent className="p-4 flex items-center gap-4">
                                    <Avatar className="h-16 w-16 border-2 border-primary/10">
                                      <AvatarImage
                                        src={
                                          doctor.user.profile?.avatarUrl ||
                                          "/placeholder.svg?height=64&width=64"
                                        }
                                        alt={doctor.user.name}
                                      />
                                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                        {getInitials(doctor.user.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="font-medium">
                                        {doctor.user.name}
                                      </h3>
                                      <p className="text-sm text-primary">
                                        {doctor.specialization}
                                      </p>
                                      <div className="flex items-center mt-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={`star-${doctor.id}-${i}`}
                                            className={`h-3 w-3 ${
                                              i < Math.floor(doctor.avgRating)
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-gray-300 dark:text-gray-600"
                                            }`}
                                          />
                                        ))}
                                        <span className="ml-1 text-xs text-muted-foreground">
                                          ({doctor?.reviews?.length})
                                        </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </Link>
                            ))}
                        </motion.div>

                        {hospital.doctors.length > 4 && (
                          <motion.div
                            variants={itemVariants}
                            className="mt-4 text-center"
                          >
                            <Button
                              variant="outline"
                              onClick={() => setActiveTab("doctors")}
                            >
                              Voir tous les médecins
                            </Button>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="doctors" className="mt-0">
                  <motion.div
                    key="doctors"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={containerVariants}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Médecins de {hospital.name}</CardTitle>
                        <CardDescription>
                          {hospital.doctors.length} médecins disponibles
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {hospital.doctors.map((doctor, index) => (
                            <motion.div
                              key={doctor.id}
                              variants={itemVariants}
                              custom={index}
                            >
                              <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                                <CardContent className="p-0">
                                  <div className="flex flex-col md:flex-row">
                                    <div className="p-4 flex flex-col md:flex-row items-center gap-4">
                                      <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-primary/10">
                                        <AvatarImage
                                          src={
                                            doctor.user.profile?.avatarUrl ||
                                            "/placeholder.svg?height=96&width=96"
                                          }
                                          alt={doctor.user.name}
                                        />
                                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                          {getInitials(doctor.user.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                          <Link
                                            href={`/dashboard/patient/doctors/${doctor.id}`}
                                            className="hover:underline"
                                          >
                                            <h3 className="text-xl font-semibold">
                                              {doctor.user.name}
                                            </h3>
                                          </Link>

                                          <div className="flex items-center justify-center md:justify-start space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={`star-${doctor.id}-${i}`}
                                                className={`h-4 w-4 ${
                                                  i <
                                                  Math.floor(doctor.avgRating)
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : i <
                                                        Math.ceil(
                                                          doctor.avgRating
                                                        )
                                                      ? "text-yellow-400 fill-yellow-400 opacity-50"
                                                      : "text-gray-300 dark:text-gray-600"
                                                }`}
                                              />
                                            ))}
                                            <span className="ml-1 text-sm">
                                              {doctor.avgRating.toFixed(1)} (
                                              {doctor?.reviews?.length})
                                            </span>
                                          </div>
                                        </div>

                                        <p className="text-primary font-medium mt-1">
                                          {doctor.specialization}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                          {doctor.department && (
                                            <Badge
                                              variant="outline"
                                              className="flex items-center gap-1"
                                            >
                                              <Grid3X3 className="h-3 w-3" />{" "}
                                              {doctor.department.name}
                                            </Badge>
                                          )}
                                          {doctor.user.profile?.city && (
                                            <Badge
                                              variant="outline"
                                              className="flex items-center gap-1"
                                            >
                                              <MapPin className="h-3 w-3" />{" "}
                                              {doctor.user.profile.city}
                                            </Badge>
                                          )}
                                          {doctor.experience && (
                                            <Badge
                                              variant="outline"
                                              className="flex items-center gap-1"
                                            >
                                              <Clock className="h-3 w-3" />{" "}
                                              {doctor.experience}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="md:ml-auto p-4 flex flex-col justify-center gap-3 bg-muted/30 border-t md:border-t-0 md:border-l">
                                      <Link
                                        href={`/dashboard/patient/doctors/${doctor.id}`}
                                      >
                                        <Button className="w-full">
                                          Voir le profil
                                        </Button>
                                      </Link>
                                      <Link
                                        href={`/dashboard/patient/appointments/book/${doctor.id}`}
                                      >
                                        <Button
                                          variant="outline"
                                          className="w-full"
                                        >
                                          <Calendar className="mr-2 h-4 w-4" />{" "}
                                          Prendre RDV
                                        </Button>
                                      </Link>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="departments" className="mt-0">
                  <motion.div
                    key="departments"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={containerVariants}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Départements de {hospital.name}</CardTitle>
                        <CardDescription>
                          {hospital.departments.length} départements spécialisés
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {hospital.departments.map((department, index) => (
                            <motion.div
                              key={department.id}
                              variants={itemVariants}
                              custom={index}
                            >
                              <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                                <CardContent className="p-0">
                                  <div className="flex flex-col md:flex-row">
                                    <div className="p-4 flex flex-col md:flex-row items-center gap-4">
                                      <div className="text-center md:text-left">
                                        <Link
                                          href={`/departments/${department.id}`}
                                          className="hover:underline"
                                        >
                                          <h3 className="text-lg font-semibold">
                                            {department.name}
                                          </h3>
                                        </Link>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                          {department.description ||
                                            `Le département ${department.name} offre des soins spécialisés aux patients de l'hôpital ${hospital.name}.`}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                          <Badge
                                            variant="outline"
                                            className="flex items-center gap-1"
                                          >
                                            <Users className="h-3 w-3" />{" "}
                                            {department.doctors.length} Médecins
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="md:ml-auto p-4 flex flex-col justify-center gap-3 bg-muted/30 border-t md:border-t-0 md:border-l">
                                      <Link
                                        href={`/departments/${department.id}`}
                                      >
                                        <Button className="w-full">Voir</Button>
                                      </Link>
                                      <Link
                                        href={`/departments/${department.id}/doctors`}
                                      >
                                        <Button
                                          variant="outline"
                                          className="w-full"
                                        >
                                          <Users className="mr-2 h-4 w-4" /> Les
                                          médecins
                                        </Button>
                                      </Link>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-0">
                  <motion.div
                    key="reviews"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={containerVariants}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Avis sur {hospital.name}</CardTitle>
                        <CardDescription>
                          {hospital.reviews.length} avis de patients
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-1 flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
                            <div className="text-5xl font-bold text-primary mb-2">
                              {hospital.avgRating.toFixed(1)}
                            </div>
                            <div className="flex items-center mb-4">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={`rating-block-${hospital.id}-${i}`}
                                  className={`h-6 w-6 ${
                                    i < Math.floor(hospital.avgRating)
                                      ? "text-yellow-400 fill-yellow-400"
                                      : i < Math.ceil(hospital.avgRating)
                                        ? "text-yellow-400 fill-yellow-400 opacity-50"
                                        : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              Basé sur {hospital.reviews.length} avis
                            </p>

                            <div className="w-full space-y-2">
                              {ratingDistribution.map((item) => (
                                <div
                                  key={item.rating}
                                  className="flex items-center gap-2"
                                >
                                  <div className="flex items-center w-12">
                                    <span className="text-sm">
                                      {item.rating}
                                    </span>
                                    <Star className="h-4 w-4 ml-1 text-yellow-400 fill-yellow-400" />
                                  </div>
                                  <Progress
                                    value={item.percentage}
                                    className="h-2 flex-1"
                                  />
                                  <span className="text-sm w-8 text-right">
                                    {item.count}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <div className="space-y-4">
                              {hospital.reviews.length > 0 ? (
                                hospital.reviews.map((review, index) => (
                                  <motion.div
                                    key={review.id}
                                    variants={itemVariants}
                                    custom={index}
                                  >
                                    <Card>
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center gap-2">
                                            <Avatar className="h-10 w-10">
                                              <AvatarImage
                                                src={
                                                  review.author.profile
                                                    ?.avatarUrl ||
                                                  "/placeholder.svg?height=40&width=40"
                                                }
                                                alt={
                                                  !review.author.name
                                                    ? "Utilisateur anonyme"
                                                    : review.author.name
                                                }
                                              />
                                              <AvatarFallback className="text-sm bg-primary/10 text-primary">
                                                {!review.author.name
                                                  ? "AN"
                                                  : getInitials(
                                                      review.author.name
                                                    )}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <h4 className="font-medium">
                                                {!review.author.name
                                                  ? "Utilisateur anonyme"
                                                  : review.author.name}
                                              </h4>
                                              <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                  review.createdAt
                                                ).toLocaleDateString("fr-FR", {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                                })}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={`star-${review.id}-${i}`}
                                                className={`h-4 w-4 ${
                                                  i < review.rating
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-gray-300 dark:text-gray-600"
                                                }`}
                                              />
                                            ))}
                                          </div>
                                        </div>

                                        <h3 className="font-medium mb-2">
                                          {review.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                          {review.content}
                                        </p>

                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <button className="flex items-center gap-1 hover:text-primary">
                                              <ThumbsUp className="h-4 w-4" />{" "}
                                              {review.likes}
                                            </button>
                                            <button className="flex items-center gap-1 hover:text-primary">
                                              <ThumbsDown className="h-4 w-4" />{" "}
                                              {review.dislikes}
                                            </button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                ))
                              ) : (
                                <div className="text-center py-8">
                                  <p className="text-muted-foreground">
                                    Aucun avis pour le moment
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Adresse</h3>
                      <p className="text-sm text-muted-foreground">
                        {hospital.address}, {hospital.city}, {hospital.state},{" "}
                        {hospital.zipCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Téléphone</h3>
                      <p className="text-sm text-muted-foreground">
                        {hospital.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-sm text-muted-foreground">
                        {hospital.email}
                      </p>
                    </div>
                  </div>

                  {hospital.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Site web</h3>
                        <a
                          href={hospital.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {hospital.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
