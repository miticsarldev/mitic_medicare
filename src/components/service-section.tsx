"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Heart,
  Hospital,
  ClipboardList,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    icon: Clock,
    value: "99.9%",
    label: "Disponibilité du système",
    description: "Plateforme fiable accessible 24/7",
  },
  {
    icon: Users,
    value: "500+",
    label: "Établissements",
    description: "Hôpitaux et cliniques utilisent notre solution",
  },
  {
    icon: Heart,
    value: "2M+",
    label: "Dossiers patients",
    description: "Gérés efficacement chaque mois",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      duration: 0.5,
    },
  },
};

const statsVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.2,
      delayChildren: 0.6,
    },
  },
};

const statItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const features = [
  {
    icon: Calendar,
    title: "Gestion des Rendez-vous",
    description:
      "Planification facile et rappels automatiques pour les patients et médecins.",
  },
  {
    icon: Users,
    title: "Profils Patients & Médecins",
    description:
      "Gestion centralisée des informations et historiques médicaux.",
  },
  {
    icon: Hospital,
    title: "Administration Hospitalière",
    description:
      "Outils de gestion pour les administrateurs d'hôpitaux et de cliniques.",
  },
  {
    icon: ClipboardList,
    title: "Dossiers Médicaux Électroniques",
    description: "Accès et mise à jour faciles des dossiers patients.",
  },
  {
    icon: Activity,
    title: "Suivi des Traitements",
    description:
      "Surveillance des progrès et adhésion aux traitements prescrits.",
  },
];

export function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="py-6 z-0 md:py-10 relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-background dark:via-background/95 dark:to-background/90">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 dark:bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-blue-300/10 dark:bg-blue-500/5 rounded-full blur-xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.03]" />
      </div>

      <div className="mx-auto px-4 relative z-10 py-10 md:py-0">
        <div className="text-center space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              Solution pour Hôpitaux
            </Badge>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Plateforme de Gestion Hospitalière et Patient
          </motion.h2>

          <motion.p
            className="text-muted-foreground text-lg max-w-[800px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            MITIC Care offre une suite complète d&apos;outils pour optimiser la
            gestion hospitalière, améliorer les soins aux patients et simplifier
            les opérations administratives
          </motion.p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="bg-white h-full flex flex-col dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-primary">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats section */}
        <motion.div
          className="mt-24 relative"
          variants={statsVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-2xl -z-10"></div>

          <div className="grid md:grid-cols-3 gap-8 p-8 rounded-2xl border border-primary/10 dark:border-primary/20 bg-white/50 dark:bg-background/50 backdrop-blur-sm">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={statItemVariants}
                className="flex flex-col items-center text-center space-y-2 p-4"
              >
                <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20 mb-2">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="font-medium text-foreground">{stat.label}</div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: linear-gradient(
              to right,
              rgba(0, 0, 0, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
        }

        @media (prefers-color-scheme: dark) {
          .bg-grid-pattern {
            background-image: linear-gradient(
                to right,
                rgba(255, 255, 255, 0.05) 1px,
                transparent 1px
              ),
              linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0.05) 1px,
                transparent 1px
              );
          }
        }
      `}</style>
    </section>
  );
}
