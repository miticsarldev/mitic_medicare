"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { type SearchFilters } from "../actions/ui-actions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Filter, Star, MapPin, Users, X, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FILTERS_BY_TYPE } from "@/config/filters.config";
import { getSpecializationLabel, labelForSort } from "@/utils/function";

interface FilterSidebarProps {
  initialFilters: SearchFilters;
  specializations: string[];
  cities: string[];
}

export function FilterSidebar({
  initialFilters,
  specializations,
  cities,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [activeAccordions, setActiveAccordions] = useState<string[]>([
    "specialization",
    "city",
    "rating",
  ]);
  const sortOptions = FILTERS_BY_TYPE[filters.type].sortBy as readonly string[];

  useEffect(() => {
    const allowed = new Set<keyof SearchFilters>(
      FILTERS_BY_TYPE[filters.type].fields as readonly (keyof SearchFilters)[]
    );
    const count = (
      Object.entries(filters) as [keyof SearchFilters, unknown][]
    ).filter(([k, v]) => v !== undefined && v !== "" && allowed.has(k)).length;
    setActiveFiltersCount(count);
  }, [filters]);

  useEffect(() => {
    if (filters.type === "doctor")
      setActiveAccordions(["specialization", "city", "rating"]);
    if (filters.type === "hospital")
      setActiveAccordions(["city", "rating", "sort"]);
    if (filters.type === "department") setActiveAccordions(["city", "sort"]);
  }, [filters.type]);

  useEffect(() => {
    setFilters(initialFilters); // <-- keep filters in sync with props (type, query, etc.)
  }, [initialFilters]);

  const handleFilterChange = (key: keyof SearchFilters, value: unknown) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value === "all" ? undefined : value };

      if (key === "type") {
        const nextType = value as SearchFilters["type"];
        const allowed = new Set<keyof SearchFilters>(
          FILTERS_BY_TYPE[nextType].fields as readonly (keyof SearchFilters)[]
        );
        (Object.keys(next) as Array<keyof SearchFilters>).forEach((k) => {
          if (!["type", "query"].includes(k as string) && !allowed.has(k)) {
            (next as Record<string, unknown>)[k as string] = undefined;
          }
        });
      }
      return next;
    });
  };

  const applyFilters = () => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    const allowedKeys = new Set<string>([
      "type",
      "query",
      ...FILTERS_BY_TYPE[filters.type].fields, // this is a readonly string[] union
    ]);

    // drop disallowed params
    Array.from(params.keys()).forEach((k) => {
      if (!allowedKeys.has(k)) params.delete(k);
    });

    // always set type
    params.set("type", filters.type);

    // apply allowed values
    (Object.entries(filters) as [keyof SearchFilters, unknown][]).forEach(
      ([key, value]) => {
        const k = String(key);
        if (!allowedKeys.has(k)) return;
        if (value !== undefined && value !== "") params.set(k, String(value));
        else params.delete(k);
      }
    );

    router.push(`/search?${params.toString()}`);
    setTimeout(() => setIsLoading(false), 500);
  };

  const resetFilters = () => {
    setFilters({
      type: initialFilters.type,
      query: initialFilters.query,
    });

    const params = new URLSearchParams();
    params.set("type", initialFilters.type);
    if (initialFilters.query) params.set("query", initialFilters.query);

    router.push(`/search?${params.toString()}`);
  };

  const removeFilter = (key: keyof SearchFilters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: undefined,
    }));

    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);

    router.push(`/search?${params.toString()}`);
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Filtres actifs</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2 text-xs"
            >
              Tout effacer
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.specialization && (
              <Badge
                variant="secondary"
                className="pl-2 pr-1 py-1 flex items-center gap-1"
              >
                {filters.specialization}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => removeFilter("specialization")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.city && (
              <Badge
                variant="secondary"
                className="pl-2 pr-1 py-1 flex items-center gap-1"
              >
                <MapPin className="h-3 w-3" /> {filters.city}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => removeFilter("city")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.minRating && (
              <Badge
                variant="secondary"
                className="pl-2 pr-1 py-1 flex items-center gap-1"
              >
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{" "}
                {filters.minRating}+
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => removeFilter("minRating")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.gender && (
              <Badge
                variant="secondary"
                className="pl-2 pr-1 py-1 flex items-center gap-1"
              >
                <Users className="h-3 w-3" />{" "}
                {filters.gender === "MALE" ? "Homme" : "Femme"}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => removeFilter("gender")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.experience && (
              <Badge
                variant="secondary"
                className="pl-2 pr-1 py-1 flex items-center gap-1"
              >
                Exp: {filters.experience} ans
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => removeFilter("experience")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
          <Separator />
        </motion.div>
      )}

      {/* Filter accordion */}
      <Accordion
        type="multiple"
        defaultValue={activeAccordions}
        value={activeAccordions}
        onValueChange={setActiveAccordions}
        className="w-full"
      >
        {/* Specialization filter */}
        {filters.type === "doctor" && (
          <AccordionItem value="specialization">
            <AccordionTrigger className="text-sm font-medium py-3">
              Spécialité
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-3">
              <div className="space-y-2">
                {(specializations?.length ?? 0) > 0 ? (
                  specializations?.map((spec) => (
                    <div key={spec} className="flex items-center space-x-2">
                      <Checkbox
                        id={`spec-${spec}`}
                        checked={filters.specialization === spec}
                        onCheckedChange={() =>
                          handleFilterChange(
                            "specialization",
                            filters.specialization === spec ? undefined : spec
                          )
                        }
                      />
                      <Label
                        htmlFor={`spec-${spec}`}
                        className="text-sm cursor-pointer"
                      >
                        {getSpecializationLabel(spec)}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Chargement des spécialités...
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* City filter */}
        <AccordionItem value="city">
          <AccordionTrigger className="text-sm font-medium py-3">
            Ville
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-3">
            <div className="space-y-2">
              {cities?.length > 0 ? (
                cities?.map((city) => (
                  <div key={city} className="flex items-center space-x-2">
                    <Checkbox
                      id={`city-${city}`}
                      checked={filters.city === city}
                      onCheckedChange={() =>
                        handleFilterChange(
                          "city",
                          filters.city === city ? undefined : city
                        )
                      }
                    />
                    <Label
                      htmlFor={`city-${city}`}
                      className="text-sm cursor-pointer"
                    >
                      {city}
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  Chargement des villes...
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating filter */}
        {filters.type === "doctor" && (
          <AccordionItem value="rating">
            <AccordionTrigger className="text-sm font-medium py-3">
              Évaluation minimale
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-3">
              <RadioGroup
                value={filters.minRating?.toString() || ""}
                onValueChange={(value) =>
                  handleFilterChange(
                    "minRating",
                    value ? Number(value) : undefined
                  )
                }
                className="space-y-2"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={rating.toString()}
                      id={`rating-${rating}`}
                    />
                    <Label
                      htmlFor={`rating-${rating}`}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      <span className="text-sm ml-1">et plus</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Gender filter */}
        {filters.type === "doctor" && (
          <AccordionItem value="gender">
            <AccordionTrigger className="text-sm font-medium py-3">
              Genre
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-3">
              <RadioGroup
                value={filters.gender || ""}
                onValueChange={(value) =>
                  handleFilterChange("gender", value || undefined)
                }
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MALE" id="gender-male" />
                  <Label
                    htmlFor="gender-male"
                    className="cursor-pointer text-sm"
                  >
                    Homme
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FEMALE" id="gender-female" />
                  <Label
                    htmlFor="gender-female"
                    className="cursor-pointer text-sm"
                  >
                    Femme
                  </Label>
                </div>
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Experience filter */}
        {filters.type === "doctor" && (
          <AccordionItem value="experience">
            <AccordionTrigger className="text-sm font-medium py-3">
              Expérience
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-3">
              <RadioGroup
                value={filters.experience || ""}
                onValueChange={(value) =>
                  handleFilterChange("experience", value || undefined)
                }
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1-5" id="exp-1-5" />
                  <Label htmlFor="exp-1-5" className="cursor-pointer text-sm">
                    1-5 ans
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5-10" id="exp-5-10" />
                  <Label htmlFor="exp-5-10" className="cursor-pointer text-sm">
                    5-10 ans
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10+" id="exp-10+" />
                  <Label htmlFor="exp-10+" className="cursor-pointer text-sm">
                    Plus de 10 ans
                  </Label>
                </div>
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Sort by */}
        <AccordionItem value="sort">
          <AccordionTrigger className="text-sm font-medium py-3">
            Trier par
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-3">
            <RadioGroup
              value={filters.sortBy || ""}
              onValueChange={(value) =>
                handleFilterChange("sortBy", value || undefined)
              }
              className="space-y-2"
            >
              {sortOptions.map((opt) => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`sort-${opt}`} />
                  <Label
                    htmlFor={`sort-${opt}`}
                    className="cursor-pointer text-sm"
                  >
                    {labelForSort(opt)} {/* implement your label mapping */}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-4 space-y-2">
        <Button className="w-full" onClick={applyFilters} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement...
            </>
          ) : (
            "Appliquer les filtres"
          )}
        </Button>
        <Button variant="outline" className="w-full" onClick={resetFilters}>
          Réinitialiser
        </Button>
      </div>
    </div>
  );

  const typeLabel: Record<SearchFilters["type"], string> = {
    doctor: "Médecins",
    department: "Départements",
    hospital: "Hôpitaux",
  };

  // Desktop view
  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden sticky top-20 z-40 flex justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filtres — {typeLabel[filters.type]}</span>
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] sm:w-[400px] overflow-y-auto"
          >
            <div className="py-6">
              <h2 className="text-lg font-semibold mb-6">
                Filtres — {typeLabel[filters.type]}
              </h2>
              {filterContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <span>Filtres — {typeLabel[filters.type]}</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>{filterContent}</CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
