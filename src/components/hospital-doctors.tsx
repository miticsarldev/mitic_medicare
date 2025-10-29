"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  ChevronRight,
  Briefcase,
  Search,
  Filter,
  ChevronLeft,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { getSpecializationLabel } from "@/utils/function";

interface HospitalDoctorsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hospital: any;
}

export default function HospitalDoctors({ hospital }: HospitalDoctorsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 5;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  // Get unique specializations
  const specializations: string[] = [
    ...Array.from(
      new Set(hospital.doctors.map((doctor) => doctor.specialization))
    ),
  ] as string[];

  // Filter doctors
  const filteredDoctors = hospital.doctors.filter((doctor) => {
    const matchesSearch =
      doctor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" ||
      (doctor.department && doctor.department.id === selectedDepartment);

    const matchesSpecialization =
      selectedSpecialization === "all" ||
      doctor.specialization === selectedSpecialization;

    return matchesSearch && matchesDepartment && matchesSpecialization;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );

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
            href={`/hospitals/${hospital.id}`}
            className="hover:text-primary"
          >
            {hospital.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Médecins</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Médecins de {hospital.name}
        </h1>
        <p className="text-muted-foreground">
          Découvrez les {hospital.doctors.length} médecins de l&apos;hôpital{" "}
          {hospital.name} et prenez rendez-vous en ligne.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filtres
              </h2>

              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Rechercher
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Nom ou spécialité..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-medium">
                  Département
                </label>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Tous les départements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les départements</SelectItem>
                    {hospital.departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="specialization" className="text-sm font-medium">
                  Spécialité
                </label>
                <Select
                  value={selectedSpecialization}
                  onValueChange={setSelectedSpecialization}
                >
                  <SelectTrigger id="specialization">
                    <SelectValue placeholder="Toutes les spécialités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les spécialités</SelectItem>
                    {specializations.map((specialization) => (
                      <SelectItem key={specialization} value={specialization}>
                        {getSpecializationLabel(specialization)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartment("all");
                  setSelectedSpecialization("all");
                  setCurrentPage(1);
                }}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" /> Informations sur l&apos;hôpital
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>
                    {hospital.address}, {hospital.city}, {hospital.state}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{hospital.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{hospital.email}</span>
                </div>
              </div>

              <Link href={`/hospitals/${hospital.id}`}>
                <Button variant="outline" className="w-full">
                  Voir l&apos;hôpital
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Doctors list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredDoctors.length} médecins trouvés
            </p>
            <Select defaultValue="rating">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Trier par évaluation</SelectItem>
                <SelectItem value="name">Trier par nom</SelectItem>
                <SelectItem value="specialization">
                  Trier par spécialité
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {currentDoctors.length > 0 ? (
              currentDoctors.map((doctor, index) => (
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
                                      i < Math.floor(doctor.avgRating)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : i < Math.ceil(doctor.avgRating)
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
                              {getSpecializationLabel(doctor.specialization)}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                              {doctor.department && (
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <Building className="h-3 w-3" />{" "}
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
                                  <Briefcase className="h-3 w-3" />{" "}
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
                            <Button className="w-full">Voir le profil</Button>
                          </Link>
                          <Link
                            href={`/dashboard/patient/appointments/book/${doctor.id}`}
                          >
                            <Button variant="outline" className="w-full">
                              <Calendar className="mr-2 h-4 w-4" /> Prendre RDV
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Aucun médecin ne correspond à vos critères de recherche.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDepartment("all");
                    setSelectedSpecialization("all");
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </Card>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </PaginationLink>
                </PaginationItem>

                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                    }
                    if (currentPage > totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    }
                  }

                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationLink
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </motion.div>
      </div>
    </div>
  );
}
