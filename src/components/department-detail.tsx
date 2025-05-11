"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Users,
  Grid3X3,
  ChevronRight,
  Briefcase,
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
import { DepartmentWithDetails } from "@/types/ui-actions.types";

interface DepartmentDetailProps {
  department: DepartmentWithDetails;
}

export default function DepartmentDetail({
  department,
}: DepartmentDetailProps) {
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
          <Link
            href={`/hospitals/${department.hospital.id}`}
            className="hover:text-primary"
          >
            {department.hospital.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{department.name}</span>
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
              <div className="absolute inset-0 flex items-center justify-center">
                <Grid3X3 className="h-24 w-24 text-primary/40" />
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {department.name}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Département de {department.hospital.name}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <MapPin className="h-3 w-3" /> {department.hospital.city},{" "}
                      {department.hospital.state}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Users className="h-3 w-3" /> {department.doctors.length}{" "}
                      Médecins
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Building className="h-3 w-3" />{" "}
                      {department.hospital.name}
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
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="doctors">Médecins</TabsTrigger>
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
                        <CardTitle>
                          À propos du département {department.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.p
                          variants={itemVariants}
                          className="text-muted-foreground"
                        >
                          {department.description ||
                            `Le département ${department.name} de l'hôpital ${department.hospital.name} est spécialisé dans le diagnostic, le traitement et la prise en charge des patients nécessitant des soins spécifiques dans ce domaine. Notre équipe de médecins expérimentés s'engage à fournir des soins de qualité et personnalisés à chaque patient.`}
                        </motion.p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Médecins du département</CardTitle>
                        <CardDescription>
                          Rencontrez nos spécialistes en {department.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <motion.div
                          variants={itemVariants}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {department.doctors
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
                                            key={i}
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

                        {department.doctors.length > 4 && (
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
                        <CardTitle>
                          Médecins du département {department.name}
                        </CardTitle>
                        <CardDescription>
                          {department.doctors.length} médecins spécialisés
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {department.doctors.map((doctor, index) => (
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
                                                key={i}
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
                                              <Briefcase className="h-3 w-3" />{" "}
                                              {doctor.experience}
                                            </Badge>
                                          )}
                                        </div>

                                        <div className="mt-3 text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 justify-center md:justify-start">
                                          {doctor.user.phone && (
                                            <span className="flex items-center gap-1">
                                              <Phone className="h-3 w-3" />{" "}
                                              {doctor.user.phone}
                                            </span>
                                          )}
                                          {doctor.user.email && (
                                            <span className="flex items-center gap-1">
                                              <Mail className="h-3 w-3" />{" "}
                                              {doctor.user.email}
                                            </span>
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
                <CardTitle>Informations sur l&apos;hôpital</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">
                        {department.hospital.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {department.hospital.address},{" "}
                        {department.hospital.city}, {department.hospital.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Téléphone</h3>
                      <p className="text-sm text-muted-foreground">
                        {department.hospital.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-sm text-muted-foreground">
                        {department.hospital.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/hospitals/${department.hospital.id}`}
                    className="block mt-4"
                  >
                    <Button variant="outline" className="w-full">
                      <Building className="mr-2 h-4 w-4" /> Voir l&apos;hôpital
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
