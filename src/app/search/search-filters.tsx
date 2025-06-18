"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Star,
  MapPin,
  Building,
  Calendar,
  User,
  Users,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Phone,
  Mail,
} from "lucide-react";
import type {
  SearchResults as SearchResultsType,
  SearchFilters,
} from "@/app/actions/ui-actions";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface SearchResultsProps {
  results: SearchResultsType;
  type: "doctor" | "hospital" | "department";
  filters: SearchFilters;
}

export function SearchResults({ results, type, filters }: SearchResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { status } = useSession();

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  // Calculate pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(results.totalCount / itemsPerPage);

  if (
    (type === "doctor" && results?.doctors?.length === 0) ||
    (type === "hospital" && results?.hospitals?.length === 0) ||
    (type === "department" && results?.departments?.length === 0)
  ) {
    return (
      <motion.div
        className="text-center py-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-2">Aucun résultat trouvé</h2>
          <p className="text-muted-foreground mb-6">
            Essayez de modifier vos critères de recherche pour obtenir plus de
            résultats.
          </p>
          <Link href="/">
            <Button>Retour à l&apos;accueil</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {results.totalCount} résultat{results.totalCount > 1 ? "s" : ""}
        </h2>

        <div className="text-sm text-muted-foreground">
          Page {currentPage} sur {totalPages || 1}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={type + (filters.query || "") + (filters.specialization || "")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {type === "doctor" &&
            results.doctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.05 },
                }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-2 flex flex-col md:flex-row items-center gap-4">
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
                                {doctor.doctorReviews} avis)
                              </span>
                            </div>
                          </div>

                          <p className="text-primary font-medium mt-1">
                            {doctor.specialization}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                            {doctor.hospital && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                <Building className="h-3 w-3" />{" "}
                                {doctor.hospital.name}
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

                          {status === "authenticated" && (
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
                          )}
                        </div>
                      </div>

                      <div className="md:ml-auto p-6 flex flex-col justify-center gap-3 bg-muted/30 border-t md:border-t-0 md:border-l">
                        <Link href={`/dashboard/patient/doctors/${doctor.id}`}>
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
            ))}

          {type === "hospital" &&
            results.hospitals.map((hospital, index) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.05 },
                }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-2 flex flex-col md:flex-row items-center gap-4">
                        <div className="h-20 w-20 md:h-24 md:w-24 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building className="h-12 w-12 text-primary" />
                        </div>
                        <div className="text-center md:text-left">
                          <Link
                            href={`/hospitals/${hospital.id}`}
                            className="hover:underline"
                          >
                            <h3 className="text-xl font-semibold">
                              {hospital.name}
                            </h3>
                          </Link>
                          <p className="text-muted-foreground">
                            {hospital.city}, {hospital.state}
                          </p>
                          {status === "authenticated" && (
                            <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 justify-center md:justify-start">
                              {hospital.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {hospital.phone}
                                </span>
                              )}
                              {hospital.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" /> {hospital.email}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Users className="h-3 w-3" />{" "}
                              {hospital.doctors?.length} Médecins
                            </Badge>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Building className="h-3 w-3" />{" "}
                              {hospital.departments?.length} Départements
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="md:ml-auto p-6 flex flex-col justify-center gap-3 bg-muted/30 border-t md:border-t-0 md:border-l">
                        <Link href={`/hospitals/${hospital.id}`}>
                          <Button className="w-full">
                            Voir l&apos;hôpital
                          </Button>
                        </Link>
                        <Link href={`/hospitals/${hospital.id}/doctors`}>
                          <Button variant="outline" className="w-full">
                            <User className="mr-2 h-4 w-4" /> Voir les médecins
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

          {type === "department" &&
            results.departments.map((department, index) => (
              <motion.div
                key={department.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.05 },
                }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-2 flex flex-col md:flex-row items-center gap-4">
                        <div className="h-20 w-20 md:h-24 md:w-24 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building className="h-12 w-12 text-primary" />
                        </div>
                        <div className="text-center md:text-left">
                          <Link
                            href={`/departments/${department.id}`}
                            className="hover:underline"
                          >
                            <h3 className="text-xl font-semibold">
                              {department.name}
                            </h3>
                          </Link>
                          <p className="text-primary">
                            {department.hospital.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {department.hospital.city},{" "}
                            {department.hospital.state}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Users className="h-3 w-3" />{" "}
                              {department?.doctors?.length} Médecins
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="md:ml-auto p-6 flex flex-col justify-center gap-3 bg-muted/30 border-t md:border-t-0 md:border-l">
                        <Link href={`/departments/${department.id}`}>
                          <Button className="w-full">
                            Voir le département
                          </Button>
                        </Link>
                        <Link href={`/departments/${department.id}/doctors`}>
                          <Button variant="outline" className="w-full">
                            <User className="mr-2 h-4 w-4" /> Voir les médecins
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                size="default"
                className={cn(
                  "bg-secondary",
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                )}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Précédent
              </PaginationLink>
            </PaginationItem>

            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              // Show pages around current page
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
                size="default"
                // disabled={currentPage === totalPages}
                className={cn(
                  "bg-secondary",
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                )}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
