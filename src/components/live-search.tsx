"use client";

import type React from "react";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, User, Building, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, debounce } from "@/lib/utils";
import {
  searchHealthcareItems,
  type SearchFilters,
} from "@/app/actions/ui-actions";
import type {
  DepartmentResult,
  DoctorResult,
  HospitalResult,
} from "@/types/ui-actions.types";
import Image from "next/image";

type SearchResult = {
  doctors: DoctorResult[];
  hospitals: HospitalResult[];
  departments: DepartmentResult[];
  loading: boolean;
};

interface LiveSearchProps {
  type: SearchFilters["type"];
  placeholder?: string;
  onResultSelect?: (
    result: DoctorResult | HospitalResult | DepartmentResult,
    type: SearchFilters["type"]
  ) => void;
  className?: string;
  initialValue?: string;
  specialization?: string;
  city?: string;
}

export function LiveSearch({
  type = "doctor",
  placeholder = "Rechercher...",
  onResultSelect,
  className,
  initialValue = "",
  specialization,
  city,
}: LiveSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [showResults, setShowResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [results, setResults] = useState<SearchResult>({
    doctors: [],
    hospitals: [],
    departments: [],
    loading: false,
  });

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 2) {
        setResults({
          doctors: [],
          hospitals: [],
          departments: [],
          loading: false,
        });
        return;
      }

      setResults((prev) => ({ ...prev, loading: true }));

      try {
        const data = await searchHealthcareItems({
          query: searchTerm,
          type,
          specialization,
          city,
        });

        setResults({
          doctors: type === "doctor" ? (data.results as DoctorResult[]) : [],
          hospitals:
            type === "hospital" ? (data.results as HospitalResult[]) : [],
          departments:
            type === "department" ? (data.results as DepartmentResult[]) : [],
          loading: false,
        });
      } catch (error) {
        console.error("Error searching:", error);
        setResults({
          doctors: [],
          hospitals: [],
          departments: [],
          loading: false,
        });
      }
    }, 300),
    [type, specialization, city]
  );

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        resultsRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update search when type changes
  useEffect(() => {
    if (value && value.length >= 2) {
      debouncedSearch(value);
    }
  }, [type, debouncedSearch, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setActiveIndex(-1);

    if (newValue.length >= 2) {
      setShowResults(true);
      debouncedSearch(newValue);
    } else {
      setResults({
        doctors: [],
        hospitals: [],
        departments: [],
        loading: false,
      });
    }
  };

  const handleClear = () => {
    setValue("");
    setResults({
      doctors: [],
      hospitals: [],
      departments: [],
      loading: false,
    });
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelect = (result: any) => {
    setValue(result.name);
    setShowResults(false);

    if (onResultSelect) {
      onResultSelect(result, type);
    } else {
      // Navigate to search page with prefilled values
      const params = new URLSearchParams();
      params.append("type", type);
      params.append("query", result.name);

      if (type === "doctor") {
        if (result.specialization)
          params.append("specialization", result.specialization);
        if (result.city) params.append("city", result.city);
      } else if (type === "hospital") {
        if (result.city) params.append("city", result.city);
      }

      router.push(`/search?${params.toString()}`);
    }
  };

  const getCurrentResults = () => {
    if (type === "doctor") return results.doctors;
    if (type === "hospital") return results.hospitals;
    return results.departments;
  };

  const renderResults = () => {
    if (results.loading) {
      return (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      );
    }

    const items = getCurrentResults();
    if (items.length === 0) {
      return (
        <CommandEmpty className="py-6 text-center">
          Aucun résultat trouvé
        </CommandEmpty>
      );
    }

    return (
      <CommandGroup
        heading={
          type === "doctor"
            ? "Médecins"
            : type === "hospital"
              ? "Hôpitaux"
              : "Départements"
        }
      >
        {items.map((item, index) => (
          <CommandItem
            key={item.id}
            onSelect={() => handleSelect(item)}
            className={cn(
              "flex items-center gap-2 py-3 cursor-pointer",
              index === activeIndex && "bg-accent text-accent-foreground"
            )}
          >
            {type !== "department" && (
              <Avatar className="h-8 w-8 border flex items-center justify-center">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    width={32} // Adjust width as needed
                    height={32} // Adjust height as needed
                    priority={true}
                  />
                ) : type === "doctor" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Building className="h-4 w-4" />
                )}
              </Avatar>
            )}
            <div className="flex flex-col">
              <span className="font-medium">{item.name}</span>
              {type !== "department" ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {item.specialization && <span>{item.specialization}</span>}
                  {item.city && (
                    <>
                      <span>•</span>
                      <span className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {item.city}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {item.hospitalName}
                </span>
              )}
            </div>
            {item.rating && type !== "department" && (
              <Badge variant="outline" className="ml-auto">
                {item.rating.toFixed(1)} ★
              </Badge>
            )}
          </CommandItem>
        ))}
      </CommandGroup>
    );
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (value.length >= 2) {
              setShowResults(true);
            }
          }}
          onKeyDown={(e) => {
            const items = getCurrentResults();
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((prev) =>
                prev < items.length - 1 ? prev + 1 : 0
              );
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((prev) =>
                prev > 0 ? prev - 1 : items.length - 1
              );
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (activeIndex >= 0 && items[activeIndex]) {
                handleSelect(items[activeIndex]);
              }
            } else if (e.key === "Escape") {
              setShowResults(false);
            }
          }}
          placeholder={placeholder}
          className="pl-9 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-0 hover:bg-transparent"
            onClick={handleClear}
          >
            <X className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Effacer</span>
          </Button>
        )}
      </div>

      {showResults && (
        <div
          ref={resultsRef}
          className="absolute !z-[9999] w-full mt-1 rounded-md border shadow-md bg-background"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 99999,
          }}
        >
          <Command>
            <CommandList className="max-h-[300px] overflow-auto">
              {renderResults()}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
