"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Award,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AboutPageComponent() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const partenires = [
    {
      name: "CANAM",
      img: "/partenaires/canam.png",
    },
    {
      name: "INPS",
      img: "/partenaires/logo_insp_mali.png",
    },
    {
      name: "OMM",
      img: "/partenaires/OMM.png",
    },
    {
      name: "OMS",
      img: "/partenaires/OMS.webp",
    },
    {
      name: "ARCAD",
      img: "/partenaires/true_logo_Arcad.jpg",
    },
    {
      name: "UNICEF",
      img: "/partenaires/UNICEF.jpg",
    },
    {
      name: "UTM",
      img: "/partenaires/utm.jpg",
    },
    {
      name: "CNIECS",
      img: "/partenaires/logo-cniecs.jpg",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 dark:bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-screen-xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  À propos de nous
                </Badge>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400"
              >
                Transformer les soins de santé au Mali
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-xl text-muted-foreground mb-6"
              >
                MITICCARE est une plateforme innovante qui connecte patients,
                médecins et établissements de santé pour un parcours de soins
                optimisé et personnalisé.
              </motion.p>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-2xl -z-10 transform rotate-3" />
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/african-healthcare-unity.png"
                  alt="L'équipe MITICCARE"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section
        id="mission"
        className="py-16 bg-white dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 scroll-mt-10"
      >
        <div className="container px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                Notre mission
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-4">
              Améliorer l&apos;accès aux soins de santé de qualité
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground"
            >
              Nous nous engageons à rendre les soins de santé plus accessibles,
              efficaces et personnalisés pour tous les Maliens.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              <motion.h3
                variants={slideInLeft}
                className="text-2xl font-bold mb-4"
              >
                Notre mission
              </motion.h3>
              <motion.p
                variants={slideInLeft}
                className="text-muted-foreground mb-6"
              >
                MITICCARE a pour mission de transformer le système de santé au
                Mali en connectant patients, médecins et établissements de santé
                sur une plateforme numérique innovante. Nous visons à améliorer
                l&apos;accès aux soins, optimiser la gestion des établissements
                de santé et offrir une expérience patient exceptionnelle.
              </motion.p>

              <motion.h3
                variants={slideInLeft}
                className="text-2xl font-bold mb-4"
              >
                Notre vision
              </motion.h3>
              <motion.p
                variants={slideInLeft}
                className="text-muted-foreground mb-6"
              >
                Nous aspirons à devenir la référence en matière de solutions
                numériques de santé en Afrique de l&apos;Ouest, en contribuant à
                un système de santé plus accessible, efficace et centré sur le
                patient.
              </motion.p>

              <motion.div variants={staggerContainer} className="space-y-4">
                {[
                  {
                    title: "Accessibilité",
                    description:
                      "Rendre les soins de santé accessibles à tous, partout au Mali",
                  },
                  {
                    title: "Innovation",
                    description:
                      "Développer des solutions technologiques adaptées aux réalités locales",
                  },
                  {
                    title: "Excellence",
                    description:
                      "Offrir des services de la plus haute qualité à nos utilisateurs",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
              className="grid grid-cols-2 gap-6"
            >
              {[
                {
                  icon: <Users className="h-6 w-6 text-primary" />,
                  value: "500+",
                  label: "Établissements partenaires",
                },
                {
                  icon: <Heart className="h-6 w-6 text-primary" />,
                  value: "2M+",
                  label: "Patients satisfaits",
                },
                {
                  icon: <Clock className="h-6 w-6 text-primary" />,
                  value: "99.9%",
                  label: "Disponibilité du système",
                },
                {
                  icon: <Award className="h-6 w-6 text-primary" />,
                  value: "5+",
                  label: "Prix d'innovation",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{ y: -5 }}
                >
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        {stat.icon}
                      </div>
                      <h4 className="text-xl font-bold mb-2">{stat.value}</h4>
                      <p className="text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="container px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                Nos valeurs
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-4">
              Les principes qui nous guident
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground"
            >
              Nos valeurs fondamentales définissent notre culture et orientent
              nos décisions au quotidien
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {[
              {
                icon: <Heart className="h-8 w-8 text-primary" />,
                title: "Compassion",
                description:
                  "Nous plaçons l'humain au centre de toutes nos actions et décisions, avec empathie et bienveillance.",
              },
              {
                icon: <Shield className="h-8 w-8 text-primary" />,
                title: "Intégrité",
                description:
                  "Nous agissons avec honnêteté, transparence et respect des normes éthiques les plus élevées.",
              },
              {
                icon: <Target className="h-8 w-8 text-primary" />,
                title: "Excellence",
                description:
                  "Nous visons l'excellence dans tous nos services et nous nous améliorons continuellement.",
              },
              {
                icon: <Users className="h-8 w-8 text-primary" />,
                title: "Collaboration",
                description:
                  "Nous travaillons en partenariat avec tous les acteurs du système de santé pour maximiser notre impact.",
              },
              {
                icon: <Award className="h-8 w-8 text-primary" />,
                title: "Innovation",
                description:
                  "Nous développons des solutions créatives adaptées aux défis spécifiques du système de santé malien.",
              },
              {
                icon: <Clock className="h-8 w-8 text-primary" />,
                title: "Accessibilité",
                description:
                  "Nous nous engageons à rendre les soins de santé accessibles à tous, partout et à tout moment.",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -8 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="container px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                Nos partenaires
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-4">
              Ils nous font confiance
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground"
            >
              Nous collaborons avec des organisations de premier plan pour
              améliorer les soins de santé au Mali.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {partenires.map((partner, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ scale: 1.05 }}
                className="rounded-lg flex items-center justify-center relative overflow-hidden h-20"
              >
                <Image
                  src={partner.img}
                  alt={`Partenaire ${partner}`}
                  fill
                  className="object-contain"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container px-4 md:px-6">
          <motion.div
            className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl p-8 md:p-12 border border-primary/20"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl font-bold mb-4"
              >
                Rejoignez la révolution des soins de santé au Mali
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-xl text-muted-foreground"
              >
                Que vous soyez patient, médecin ou établissement de santé, MITIC
                Care est là pour vous
              </motion.p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={slideInLeft}>
                <Link href="/auth">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="bg-primary hover:bg-primary/90 px-8">
                      Créer un compte
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div variants={slideInRight}>
                <Link href="/help#contact">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button variant="outline" className="px-8">
                      Nous contacter
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
