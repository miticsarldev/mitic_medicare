"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Building, Calendar, User, Users } from "lucide-react";
import type { SearchResults as SearchResultsType } from "@/app/actions/ui-actions";

interface SearchResultsProps {
  results: SearchResultsType;
  type: "doctor" | "hospital" | "department";
}

export function SearchResults({ results, type }: SearchResultsProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (
    (type === "doctor" && results.doctors?.length === 0) ||
    (type === "hospital" && results.hospitals?.length === 0) ||
    (type === "department" && results.departments?.length === 0)
  ) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Aucun résultat trouvé</h2>
        <p className="text-muted-foreground">
          Essayez de modifier vos critères de recherche pour obtenir plus de
          résultats.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {type === "doctor" &&
        results.doctors.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex flex-col md:flex-row items-center gap-4">
                  <Avatar className="h-20 w-20 md:h-24 md:w-24">
                    <AvatarImage
                      src={
                        doctor.user.profile?.avatarUrl ||
                        "/placeholder.svg?height=96&width=96"
                      }
                      alt={doctor.user.name}
                      className="object-contain"
                    />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {getInitials(doctor.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center md:text-left">
                    <Link
                      href={`/doctors/${doctor.id}`}
                      className="hover:underline"
                    >
                      <h3 className="text-xl font-semibold">
                        {doctor.user.name}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground">
                      {doctor.specialization}
                    </p>

                    <div className="flex items-center justify-center md:justify-start mt-2 space-x-1">
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
                        {doctor.doctorReviews?.length})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
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
                    </div>
                  </div>
                </div>

                <div className="md:ml-auto p-6 flex flex-col justify-center gap-3 bg-muted/30">
                  <Link href={`/doctors/${doctor.id}`}>
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
        ))}

      {type === "hospital" &&
        results.hospitals.map((hospital) => (
          <Card key={hospital.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex flex-col md:flex-row items-center gap-4">
                  <div className="h-20 w-20 md:h-24 md:w-24 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center md:text-left">
                    <Link
                      href={`/dashboard/patient/doctor/hospitals/${hospital.id}`}
                      className="hover:underline"
                    >
                      <h3 className="text-xl font-semibold">{hospital.name}</h3>
                    </Link>
                    <p className="text-muted-foreground">
                      {hospital.city}, {hospital.state}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
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
                        <Building className="h-3 w-3" />{" "}
                        {hospital.departments?.length} Départements
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="md:ml-auto p-6 flex flex-col justify-center gap-3 bg-muted/30">
                  <Link href={`/hospitals/${hospital.id}`}>
                    <Button className="w-full">Voir l&apos;hôpital</Button>
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
        ))}

      {type === "department" &&
        results.departments.map((department) => (
          <Card key={department.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex flex-col md:flex-row items-center gap-4">
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
                    <p className="text-muted-foreground">
                      {department.hospital.name}
                    </p>
                    <p className="text-sm">
                      {department.hospital.city}, {department.hospital.state}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
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

                <div className="md:ml-auto p-6 flex flex-col justify-center gap-3 bg-muted/30">
                  <Link href={`/departments/${department.id}`}>
                    <Button className="w-full">Voir le département</Button>
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
        ))}
    </div>
  );
}
