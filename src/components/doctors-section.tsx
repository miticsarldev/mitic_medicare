"use client";

import { useRef } from "react";
// import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { MapPin, Star, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TopDoctor } from "@/types/ui-actions.types";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
    },
  },
};

export function MedSection({ doctors }: { doctors: TopDoctor[] }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      id="findoctors"
      className="py-16 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 scroll-mt-5"
    >
      <div className="mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="outline"
              className="mb-3 px-4 py-1 text-sm font-medium bg-primary/10 text-primary border-primary/20"
            >
              Expertise Médicale
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              L&apos;Équipe Médicale d&apos;Excellence
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Des médecins hautement qualifiés et dévoués, prêts à vous offrir
              les meilleurs soins personnalisés
            </p>
          </motion.div>
        </div>

        <div className="mb-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {doctors?.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </motion.div>
        </div>

        <div className="text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link href="/search">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 font-medium px-8 py-6 rounded-full"
              >
                Voir tous nos médecins
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function DoctorCard({ doctor }: { doctor: TopDoctor }) {
  const router = useRouter();
  const handleSelect = () => {
    const params = new URLSearchParams();
    params.append("type", "doctor");
    params.append("query", doctor.name);
    params.append("specialization", doctor.specialization);
    params.append("city", doctor.city ?? "");

    router.push(`/search?${params.toString()}`);
  };

  return (
    <motion.div variants={itemVariants}>
      <Card
        className="overflow-hidden flex flex-col h-full transition-shadow hover:shadow-2xl border cursor-pointer duration-300"
        onClick={handleSelect}
      >
        <div className="relative pt-[56.25%] bg-gray-100 dark:bg-gray-800">
          <Avatar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-white dark:border-gray-800 shadow-md">
            <AvatarImage
              src={
                doctor.avatarUrl ??
                (doctor.genre === "MALE"
                  ? "/placeholder.svg"
                  : "/doctor-woman.webp")
              }
              alt={doctor.name}
              className="object-cover"
              loading="lazy"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {doctor.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          {doctor.isVerified && (
            <Badge className="absolute top-4 right-4 bg-primary text-xs">
              <ThumbsUp className="h-3 w-3 mr-1" /> Vérifié
            </Badge>
          )}
        </div>

        <CardContent className="flex flex-col items-center text-center mt-6 flex-grow px-4">
          <h3 className="text-xl font-bold">{doctor.name}</h3>
          <p className="text-primary text-sm mt-1">{doctor.specialization}</p>

          {doctor.city && (
            <div className="flex items-center gap-1 mt-2 text-gray-500 dark:text-gray-400 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{doctor.city}</span>
            </div>
          )}

          {doctor.experience && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {doctor.experience}
            </p>
          )}

          <div className="flex items-center justify-center gap-1 mt-3 text-sm">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold">{doctor.rating}</span>
            <span className="text-gray-500 dark:text-gray-400">
              ({doctor.reviews} avis)
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default DoctorCard;
