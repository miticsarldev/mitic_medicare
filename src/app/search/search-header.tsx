"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SearchFilters } from "../actions/ui-actions";
import { LiveSearch } from "@/components/live-search";
import { Building, Grid3X3, User } from "lucide-react";

interface SearchHeaderProps {
  initialQuery: string;
  activeType: SearchFilters["type"];
}

export function SearchHeader({ initialQuery, activeType }: SearchHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [type, setType] = useState<SearchFilters["type"]>(activeType);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTypeChange = (value: string) => {
    setType(value as SearchFilters["type"]);

    const params = new URLSearchParams(searchParams.toString());
    params.set("type", value);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <motion.div
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-md pt-3"
          : "bg-gradient-to-b from-background to-background/95 pt-3 sm:pt-4 md:pt-6"
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full px-4 mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full order-2 sm:order-1">
            <LiveSearch
              type={type}
              initialValue={initialQuery}
              placeholder="Rechercher un médecin, hôpital, ou département..."
            />
          </div>

          <Tabs
            defaultValue={type}
            value={type}
            onValueChange={handleTypeChange}
            className="w-full md:w-auto order-1 sm:order-2"
          >
            <TabsList className="grid grid-cols-3 w-full md:w-auto">
              <TabsTrigger value="doctor" className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Médecins</span>
              </TabsTrigger>
              <TabsTrigger
                value="hospital"
                className="flex items-center gap-1.5"
              >
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Hôpitaux</span>
              </TabsTrigger>
              <TabsTrigger
                value="department"
                className="flex items-center gap-1.5"
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Départements</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
