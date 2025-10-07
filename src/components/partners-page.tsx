"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building,
  CheckCircle,
  Globe,
  Hospital,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PartnersPageComponent() {
  // Animation variants
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
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: i * 0.1,
      },
    }),
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 dark:bg-primary/5 rounded-full blur-3xl"
          />
        </motion.div>

        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                Nos partenaires
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400"
            >
              Ensemble pour transformer les soins de santé
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground"
            >
              MITICCARE collabore avec des partenaires de premier plan pour
              améliorer l&apos;accès aux soins de santé au Mali
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {[
              {
                icon: <Hospital className="h-8 w-8 text-primary" />,
                title: "Établissements de santé",
                description:
                  "Hôpitaux, cliniques et centres de santé partenaires",
                count: "500+",
              },
              {
                icon: <Users className="h-8 w-8 text-primary" />,
                title: "Professionnels de santé",
                description: "Médecins, spécialistes et autres professionnels",
                count: "2000+",
              },
              {
                icon: <Building className="h-8 w-8 text-primary" />,
                title: "Organisations",
                description: "ONG, institutions et entreprises partenaires",
                count: "50+",
              },
            ].map((item, index) => (
              <motion.div key={index} custom={index} variants={cardVariants}>
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-full">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <motion.div
                      className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      }}
                    >
                      {item.icon}
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <motion.p
                      className="text-4xl font-bold text-primary"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.5 + index * 0.2,
                        duration: 0.5,
                        type: "spring",
                      }}
                    >
                      {item.count}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Partners Categories Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container px-4 md:px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-4">
              Nos partenaires par catégorie
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground"
            >
              Découvrez les différents types d&apos;organisations avec
              lesquelles nous collaborons
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <Tabs defaultValue="healthcare" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="healthcare">
                  Établissements de santé
                </TabsTrigger>
                <TabsTrigger value="organizations">Organisations</TabsTrigger>
                <TabsTrigger value="tech">
                  Partenaires technologiques
                </TabsTrigger>
              </TabsList>

              <TabsContent value="healthcare">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={staggerContainer}
                >
                  {[
                    {
                      name: "Hôpital du Mali",
                      logo: "/stylized-hospital-cross.png",
                      description:
                        "L'un des principaux hôpitaux publics de Bamako, offrant une gamme complète de services médicaux.",
                      type: "Hôpital public",
                    },
                    {
                      name: "Clinique Pasteur",
                      logo: "/abstract-medical-symbol.png",
                      description:
                        "Clinique privée de premier plan spécialisée dans les soins chirurgicaux et la médecine interne.",
                      type: "Clinique privée",
                    },
                    {
                      name: "Centre de Santé de Référence de Kati",
                      logo: "/interconnected-health.png",
                      description:
                        "Centre de santé offrant des services de soins primaires et de référence pour la région de Kati.",
                      type: "Centre de santé",
                    },
                    {
                      name: "Hôpital Gabriel Touré",
                      logo: "/abstract-medical-symbol.png",
                      description:
                        "Hôpital universitaire de référence offrant des soins spécialisés et de la formation médicale.",
                      type: "Hôpital universitaire",
                    },
                    {
                      name: "Polyclinique Internationale Bamako",
                      logo: "/abstract-polyclinic-logo.png",
                      description:
                        "Établissement médical moderne offrant des soins de qualité internationale.",
                      type: "Polyclinique",
                    },
                    {
                      name: "Centre Médical Mère-Enfant",
                      logo: "/interconnected-health-network.png",
                      description:
                        "Centre spécialisé dans les soins maternels et pédiatriques.",
                      type: "Centre spécialisé",
                    },
                  ].map((partner, index) => (
                    <motion.div
                      key={index}
                      custom={index}
                      variants={cardVariants}
                      whileHover={{ y: -10, transition: { duration: 0.2 } }}
                    >
                      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-full">
                        <CardHeader className="flex flex-col items-center text-center pb-2">
                          <motion.div
                            className="h-16 flex items-center justify-center mb-4"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={partner.logo || "/placeholder.svg"}
                              alt={partner.name}
                              width={160}
                              height={80}
                              className="max-h-16 w-auto"
                            />
                          </motion.div>
                          <CardTitle className="text-xl">
                            {partner.name}
                          </CardTitle>
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.2 + index * 0.1,
                              duration: 0.3,
                              type: "spring",
                            }}
                          >
                            <Badge variant="outline" className="mt-2">
                              {partner.type}
                            </Badge>
                          </motion.div>
                        </CardHeader>
                        <CardContent className="text-center">
                          <CardDescription className="text-sm">
                            {partner.description}
                          </CardDescription>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                          <motion.div
                            whileHover={{ x: 5 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            <Button
                              variant="ghost"
                              className="text-primary hover:text-primary/80 p-0 flex items-center gap-2"
                            >
                              En savoir plus <ArrowRight className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="text-center mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline">
                      Voir tous les établissements partenaires
                    </Button>
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="organizations">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={staggerContainer}
                >
                  {[
                    {
                      name: "Organisation Mondiale de la Santé",
                      logo: "/abstract-geometric-logo.png",
                      description:
                        "Agence spécialisée de l'ONU pour la santé publique internationale.",
                      type: "Organisation internationale",
                    },
                    {
                      name: "Ministère de la Santé du Mali",
                      logo: "/health-ministry-mali-symbol.png",
                      description:
                        "Ministère responsable des politiques de santé publique au Mali.",
                      type: "Institution gouvernementale",
                    },
                    {
                      name: "Fondation Bill & Melinda Gates",
                      logo: "/placeholder.svg?height=80&width=160&query=gates%20foundation%20logo",
                      description:
                        "Fondation privée soutenant des initiatives de santé mondiale.",
                      type: "Fondation",
                    },
                    {
                      name: "UNICEF Mali",
                      logo: "/placeholder.svg?height=80&width=160&query=unicef%20logo",
                      description:
                        "Organisation travaillant pour améliorer la santé des enfants au Mali.",
                      type: "Organisation internationale",
                    },
                    {
                      name: "Médecins Sans Frontières",
                      logo: "/placeholder.svg?height=80&width=160&query=msf%20logo",
                      description: "ONG médicale humanitaire internationale.",
                      type: "ONG",
                    },
                    {
                      name: "Agence Française de Développement",
                      logo: "/placeholder.svg?height=80&width=160&query=afd%20logo",
                      description:
                        "Institution financière publique française soutenant des projets de développement.",
                      type: "Agence de développement",
                    },
                  ].map((partner, index) => (
                    <motion.div
                      key={index}
                      custom={index}
                      variants={cardVariants}
                      whileHover={{ y: -10, transition: { duration: 0.2 } }}
                    >
                      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-full">
                        <CardHeader className="flex flex-col items-center text-center pb-2">
                          <motion.div
                            className="h-16 flex items-center justify-center mb-4"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={partner.logo || "/placeholder.svg"}
                              alt={partner.name}
                              width={160}
                              height={80}
                              className="max-h-16 w-auto"
                            />
                          </motion.div>
                          <CardTitle className="text-xl">
                            {partner.name}
                          </CardTitle>
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.2 + index * 0.1,
                              duration: 0.3,
                              type: "spring",
                            }}
                          >
                            <Badge variant="outline" className="mt-2">
                              {partner.type}
                            </Badge>
                          </motion.div>
                        </CardHeader>
                        <CardContent className="text-center">
                          <CardDescription className="text-sm">
                            {partner.description}
                          </CardDescription>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                          <motion.div
                            whileHover={{ x: 5 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            <Button
                              variant="ghost"
                              className="text-primary hover:text-primary/80 p-0 flex items-center gap-2"
                            >
                              En savoir plus <ArrowRight className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="text-center mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline">
                      Voir toutes les organisations partenaires
                    </Button>
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="tech">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={staggerContainer}
                >
                  {[
                    {
                      name: "Orange Mali",
                      logo: "/placeholder.svg?height=80&width=160&query=orange%20logo",
                      description:
                        "Opérateur de télécommunications fournissant des solutions de connectivité.",
                      type: "Télécommunications",
                    },
                    {
                      name: "Microsoft",
                      logo: "/placeholder.svg?height=80&width=160&query=microsoft%20logo",
                      description:
                        "Entreprise technologique fournissant des solutions cloud et d'intelligence artificielle.",
                      type: "Technologie",
                    },
                    {
                      name: "Doctolib",
                      logo: "/placeholder.svg?height=80&width=160&query=doctolib%20logo",
                      description:
                        "Plateforme de prise de rendez-vous médicaux en ligne.",
                      type: "Santé numérique",
                    },
                    {
                      name: "IBM",
                      logo: "/placeholder.svg?height=80&width=160&query=ibm%20logo",
                      description:
                        "Entreprise technologique spécialisée dans l'IA et les solutions de santé.",
                      type: "Technologie",
                    },
                    {
                      name: "Moov Africa",
                      logo: "/placeholder.svg?height=80&width=160&query=moov%20africa%20logo",
                      description:
                        "Opérateur de télécommunications offrant des services de paiement mobile.",
                      type: "Télécommunications",
                    },
                    {
                      name: "Babylon Health",
                      logo: "/placeholder.svg?height=80&width=160&query=babylon%20health%20logo",
                      description:
                        "Entreprise de télémédecine utilisant l'intelligence artificielle.",
                      type: "Santé numérique",
                    },
                  ].map((partner, index) => (
                    <motion.div
                      key={index}
                      custom={index}
                      variants={cardVariants}
                      whileHover={{ y: -10, transition: { duration: 0.2 } }}
                    >
                      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-full">
                        <CardHeader className="flex flex-col items-center text-center pb-2">
                          <motion.div
                            className="h-16 flex items-center justify-center mb-4"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={partner.logo || "/placeholder.svg"}
                              alt={partner.name}
                              width={160}
                              height={80}
                              className="max-h-16 w-auto"
                            />
                          </motion.div>
                          <CardTitle className="text-xl">
                            {partner.name}
                          </CardTitle>
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.2 + index * 0.1,
                              duration: 0.3,
                              type: "spring",
                            }}
                          >
                            <Badge variant="outline" className="mt-2">
                              {partner.type}
                            </Badge>
                          </motion.div>
                        </CardHeader>
                        <CardContent className="text-center">
                          <CardDescription className="text-sm">
                            {partner.description}
                          </CardDescription>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                          <motion.div
                            whileHover={{ x: 5 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            <Button
                              variant="ghost"
                              className="text-primary hover:text-primary/80 p-0 flex items-center gap-2"
                            >
                              En savoir plus <ArrowRight className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="text-center mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline">
                      Voir tous les partenaires technologiques
                    </Button>
                  </motion.div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Partnership Benefits Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="container px-4 md:px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                Avantages
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-4">
              Pourquoi devenir partenaire ?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground"
            >
              Découvrez les avantages de rejoindre l&apos;écosystème MITICCARE
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInLeft}
            >
              <div className="space-y-6">
                {[
                  {
                    title: "Visibilité accrue",
                    description:
                      "Augmentez votre visibilité auprès des patients et des professionnels de santé sur notre plateforme.",
                    icon: <Globe className="h-6 w-6 text-primary" />,
                  },
                  {
                    title: "Gestion optimisée",
                    description:
                      "Bénéficiez d'outils de gestion avancés pour optimiser vos opérations et améliorer l'expérience patient.",
                    icon: <Building className="h-6 w-6 text-primary" />,
                  },
                  {
                    title: "Réseau étendu",
                    description:
                      "Rejoignez un réseau de professionnels et d'établissements de santé pour faciliter les références et la collaboration.",
                    icon: <Users className="h-6 w-6 text-primary" />,
                  },
                  {
                    title: "Innovation technologique",
                    description:
                      "Accédez à des technologies de pointe pour moderniser vos services et améliorer la qualité des soins.",
                    icon: <Hospital className="h-6 w-6 text-primary" />,
                  },
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <motion.div
                      className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      }}
                    >
                      {benefit.icon}
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInRight}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-2xl -z-10 transform -rotate-3"
                animate={{
                  rotate: [-3, 0, -3],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/placeholder.svg?height=600&width=800&query=healthcare%20partnership"
                  alt="Partenariat dans le domaine de la santé"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container px-4 md:px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                Témoignages
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-4">
              Ce que disent nos partenaires
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground"
            >
              Découvrez les expériences de nos partenaires qui collaborent avec
              nous pour transformer les soins de santé
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
                quote:
                  "Grâce à MITICCARE, nous avons pu optimiser la gestion de nos rendez-vous et améliorer considérablement l'expérience de nos patients. La plateforme est intuitive et le support technique est excellent.",
                author: "Dr. Aminata Diallo",
                role: "Directrice, Hôpital du Mali",
                avatar:
                  "/placeholder.svg?height=100&width=100&query=african%20woman%20doctor",
              },
              {
                quote:
                  "Notre partenariat avec MITICCARE nous a permis d'étendre notre portée et d'offrir des soins de qualité à davantage de patients. La technologie qu'ils proposent est vraiment adaptée aux réalités du terrain.",
                author: "Ibrahim Coulibaly",
                role: "Directeur Général, Clinique Pasteur",
                avatar:
                  "/placeholder.svg?height=100&width=100&query=african%20man%20executive",
              },
              {
                quote:
                  "En tant qu'ONG, nous cherchions une solution pour suivre efficacement nos programmes de santé. MITICCARE nous a fourni les outils nécessaires pour collecter des données précises et améliorer nos interventions.",
                author: "Sophie Martin",
                role: "Coordinatrice, Médecins Sans Frontières",
                avatar:
                  "/placeholder.svg?height=100&width=100&query=woman%20ngo%20worker",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col h-full">
                      <motion.div
                        className="mb-6 flex-grow"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        <p className="italic text-muted-foreground">
                          &quot;{testimonial.quote}&quot;
                        </p>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Image
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.author}
                            width={50}
                            height={50}
                            className="rounded-full"
                          />
                        </motion.div>
                        <div>
                          <p className="font-bold">{testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Become a Partner Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="container px-4 md:px-6">
          <motion.div
            className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <motion.div
                className="md:w-1/2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideInLeft}
              >
                <motion.div variants={fadeInUp}>
                  <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    Rejoignez-nous
                  </Badge>
                </motion.div>
                <motion.h2
                  variants={fadeInUp}
                  className="text-3xl font-bold mb-4"
                >
                  Devenez partenaire
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  className="text-muted-foreground mb-6"
                >
                  Vous souhaitez rejoindre notre réseau de partenaires ?
                  Contactez-nous dès aujourd&apos;hui pour discuter des
                  opportunités de collaboration.
                </motion.p>
                <motion.div variants={staggerContainer} className="space-y-4">
                  {[
                    "Accès à une plateforme innovante",
                    "Support technique dédié",
                    "Formation pour votre équipe",
                    "Visibilité auprès de notre communauté",
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className="flex items-center gap-2"
                      whileHover={{ x: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>{benefit}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
              <motion.div
                className="md:w-1/2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideInRight}
              >
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Contactez-nous</CardTitle>
                    <CardDescription>
                      Remplissez le formulaire ci-dessous et notre équipe vous
                      contactera dans les plus brefs délais.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1, duration: 0.4 }}
                        >
                          <label htmlFor="name" className="text-sm font-medium">
                            Nom
                          </label>
                          <input
                            id="name"
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Votre nom"
                          />
                        </motion.div>
                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2, duration: 0.4 }}
                        >
                          <label
                            htmlFor="organization"
                            className="text-sm font-medium"
                          >
                            Organisation
                          </label>
                          <input
                            id="organization"
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Nom de l'organisation"
                          />
                        </motion.div>
                      </div>
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="votre@email.com"
                        />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                      >
                        <label
                          htmlFor="message"
                          className="text-sm font-medium"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          rows={4}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Comment pouvons-nous collaborer ?"
                        ></textarea>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          Envoyer
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
