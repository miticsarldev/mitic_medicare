"use client";

import { motion } from "framer-motion";
import { Microscope, Ambulance, Calendar, Phone, Clock, User, Heart } from "lucide-react";

const services = [
  {
    icon: Microscope,
    title: "Laboratoire bien équipé",
    description:
      "Accédez à nos installations de laboratoire modernes pour des diagnostics précis",
    color: "bg-white dark:bg-secondary/50",
  },
  {
    icon: Ambulance,
    title: "Ambulance d'urgence",
    description:
      "Service d'ambulance disponible 24/7 pour les urgences médicales",
    color: "bg-[#107ACA] text-primary-foreground",
  },
  {
    icon: Calendar,
    title: "Rendez-vous en ligne",
    description:
      "Prenez rendez-vous facilement avec nos professionnels de santé",
    color: "bg-white dark:bg-secondary/50",
  },
  {
    icon: Phone,
    title: "Centre d'appel",
    description: "Une équipe dédiée pour répondre à toutes vos questions",
    color: "bg-[#107ACA] text-primary-foreground",
  },
];

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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export function ServicesSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50/50 to-white dark:from-background dark:to-background/80">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Nos Services Médicaux
          </h2>
          <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
            Nous nous engageons à vous offrir les meilleurs services médicaux
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              <div
                className={`${service.color} rounded-2xl p-6 h-full shadow-lg backdrop-blur-sm 
                transition-transform duration-300 group-hover:scale-105`}
              >
                <div className="space-y-4">
                  <div className="inline-block p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                    <service.icon
                      className={`w-6 h-6 ${
                        index % 2 === 0 ? "text-[#107ACA]" : "text-white"
                      }`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                  <p className="text-sm opacity-90">{service.description}</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 inset-0 bg-gradient-to-r from-primary/30 to-primary/0 rounded-2xl blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features */}
        <div className="mt-16 grid gap-8 md:grid-cols-3 text-center">
          <div className="space-y-2">
            <div className="flex justify-center items-center gap-2">
              <Clock className="w-8 h-8 text-primary" />
              <div className="text-3xl font-bold text-primary">24/7</div>
            </div>
            <p className="text-muted-foreground">Service d&apos;urgence</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-center items-center gap-2">
              <User className="w-8 h-8 text-primary" />
              <div className="text-3xl font-bold text-primary">100+</div>
            </div>
            <p className="text-muted-foreground">Médecins spécialistes</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-center items-center gap-2">
              <Heart className="w-8 h-8 text-primary" />
              <div className="text-3xl font-bold text-primary">50k+</div>
            </div>
            <p className="text-muted-foreground">Patients satisfaits</p>
          </div>
        </div>
      </div>
    </section>
  );
}