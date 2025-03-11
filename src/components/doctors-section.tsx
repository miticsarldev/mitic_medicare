"use client";

import { useRef } from "react";
// import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Calendar, Star, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const doctors = [
  {
    id: "doc_1",
    name: "Dr. Sophie Martin",
    specialization: "Cardiologie",
    rating: 4.9,
    reviews: 127,
    avatarUrl: "/doctor-woman.webp",
    isVerified: true,
  },
  {
    id: "doc_2",
    name: "Dr. Thomas Dubois",
    specialization: "Neurologie",
    rating: 4.7,
    reviews: 98,
    avatarUrl: "/doctor-man-1.webp",
    isVerified: true,
  },
  {
    id: "doc_3",
    name: "Dr. Amina Benali",
    specialization: "Pédiatrie",
    rating: 4.8,
    reviews: 156,
    avatarUrl: "/doctor-woman.webp",
    isVerified: true,
  },
  {
    id: "doc_4",
    name: "Dr. Pierre Dupont",
    specialization: "Dentisterie",
    rating: 4.6,
    reviews: 94,
    avatarUrl: "/doctor-man-1.webp",
    isVerified: true,
  },
  {
    id: "doc_5",
    name: "Dr. Marie Dupont",
    specialization: "Dentisterie",
    rating: 4.6,
    reviews: 94,
    avatarUrl: "/doctor-woman.webp",
    isVerified: true,
  },
  {
    id: "doc_6",
    name: "Dr. Pierre Dupont",
    specialization: "Dentisterie",
    rating: 4.6,
    reviews: 94,
    avatarUrl: "/doctor-man-1.webp",
    isVerified: true,
  },
];

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

export function MedSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="py-16 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950"
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
              Notre Équipe Médicale d&apos;Excellence
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
            {doctors.map((doctor) => (
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
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 font-medium px-8 py-6 rounded-full"
            >
              Voir tous nos médecins
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DoctorCard({ doctor }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-gray-200 dark:border-gray-800 h-full flex flex-col">
        <div className="relative pt-[56.25%] bg-gray-100 dark:bg-gray-800">
          <Avatar className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-white dark:border-gray-800 shadow-lg">
            <AvatarImage
              className="object-cover"
              src={doctor.avatarUrl}
              alt={doctor.name}
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
            <Badge className="absolute top-4 right-4 bg-primary">
              <ThumbsUp className="h-3 w-3 mr-1" /> Vérifié
            </Badge>
          )}
        </div>

        <CardContent className="pt-6 flex-grow">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {doctor.name}
            </h3>
            <p className="text-primary font-medium">{doctor.specialization}</p>

            <div className="flex items-center justify-center mt-2 space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-gray-900 dark:text-white">
                {doctor.rating}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                ({doctor.reviews} avis)
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <Button className="flex-1 bg-primary hover:bg-primary/90">
            <Calendar className="mr-2 h-4 w-4" /> Prendre RDV
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
