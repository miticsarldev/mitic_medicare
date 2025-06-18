"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Phone,
  Mail,
  MessageSquare,
  FileQuestion,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function HelpCenterComponent() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/patient/general-contact-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast({
          title: "Message envoyé avec succès !",
          description:
            "Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.",
          variant: "default",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
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

        <div className="max-w-screen-xl mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-10 md:mb-16"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                Centre d&apos;aide
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400"
            >
              Comment pouvons-nous vous aider ?
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground mb-8"
            >
              Trouvez rapidement des réponses à vos questions et obtenez
              l&apos;assistance dont vous avez besoin
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {[
              {
                icon: <FileQuestion className="h-8 w-8 text-primary" />,
                title: "FAQ",
                description:
                  "Consultez nos réponses aux questions fréquemment posées",
                link: "#faq",
              },
              {
                icon: <MessageSquare className="h-8 w-8 text-primary" />,
                title: "Support en ligne",
                description:
                  "Discutez avec notre équipe de support en temps réel",
                link: "#contact",
              },
            ].map((item, index) => (
              <motion.div key={index} custom={index} variants={cardVariants}>
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow h-full">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <motion.div
                      className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      {item.icon}
                    </motion.div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-300 min-h-[60px]">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Link href={item.link}>
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
                          En savoir plus <ChevronRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="py-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 scroll-mt-16"
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl font-bold mb-4"
              >
                Questions fréquemment posées
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground">
                Trouvez rapidement des réponses aux questions les plus courantes
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="general">Général</TabsTrigger>
                  <TabsTrigger value="account">Compte</TabsTrigger>
                  <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                  <Accordion type="single" collapsible className="w-full">
                    {[
                      {
                        question: "Qu'est-ce que MITIC Care ?",
                        answer:
                          "MITIC Care est une plateforme de gestion hospitalière et de santé qui connecte les patients, médecins et établissements de santé. Elle permet de prendre rendez-vous en ligne, de gérer les dossiers médicaux et d'optimiser le parcours de soins.",
                      },
                      {
                        question: "Comment fonctionne la plateforme ?",
                        answer:
                          "La plateforme permet aux patients de rechercher des médecins ou des hôpitaux, de prendre rendez-vous en ligne, et d'accéder à leur dossier médical. Les professionnels de santé peuvent gérer leurs rendez-vous, accéder aux dossiers des patients et optimiser leur pratique quotidienne.",
                      },
                      {
                        question: "La plateforme est-elle sécurisée ?",
                        answer:
                          "Oui, MITIC Care respecte les normes les plus strictes en matière de sécurité des données de santé. Nous sommes conformes au RGPD et nos serveurs sont certifiés pour l'hébergement de données de santé (HDS). Toutes les données sont chiffrées et protégées.",
                      },
                      {
                        question: "Quels sont les frais d'utilisation ?",
                        answer:
                          "Pour les patients, l'utilisation de base de la plateforme est gratuite. Pour les professionnels de santé et les établissements, nous proposons différentes formules d'abonnement adaptées à leurs besoins. Consultez notre page de tarification pour plus de détails.",
                      },
                      {
                        question:
                          "Dans quelles régions le service est-il disponible ?",
                        answer:
                          "Actuellement, MITIC Care est disponible au Mali et prévoit de s'étendre à d'autres pays d'Afrique de l'Ouest dans les prochains mois.",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <AccordionItem value={`item-${index}`}>
                          <AccordionTrigger className="text-left text-base font-medium">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    ))}
                  </Accordion>
                </TabsContent>

                <TabsContent value="account">
                  <Accordion type="single" collapsible className="w-full">
                    {[
                      {
                        question: "Comment créer un compte ?",
                        answer:
                          "Pour créer un compte, cliquez sur 'Se connecter' en haut à droite de la page d'accueil, puis sur 'Créer un compte'. Remplissez le formulaire avec vos informations personnelles et suivez les instructions pour vérifier votre adresse email et votre numéro de téléphone.",
                      },
                      {
                        question:
                          "Comment modifier mes informations personnelles ?",
                        answer:
                          "Connectez-vous à votre compte, accédez à votre profil en cliquant sur votre nom en haut à droite, puis sélectionnez 'Paramètres du compte'. Vous pourrez y modifier vos informations personnelles, votre mot de passe et vos préférences de notification.",
                      },
                      {
                        question: "J'ai oublié mon mot de passe, que faire ?",
                        answer:
                          "Sur la page de connexion, cliquez sur 'Mot de passe oublié'. Entrez l'adresse email associée à votre compte et suivez les instructions envoyées par email pour réinitialiser votre mot de passe.",
                      },
                      {
                        question: "Comment supprimer mon compte ?",
                        answer:
                          "Pour supprimer votre compte, accédez aux paramètres de votre compte, faites défiler jusqu'à la section 'Supprimer le compte' et suivez les instructions. Notez que cette action est irréversible et que toutes vos données seront supprimées.",
                      },
                      {
                        question: "Comment changer mon type de compte ?",
                        answer:
                          "Si vous souhaitez passer d'un compte patient à un compte professionnel de santé (ou vice versa), veuillez contacter notre service client. Un changement de type de compte nécessite une vérification supplémentaire de vos informations.",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <AccordionItem value={`item-${index}`}>
                          <AccordionTrigger className="text-left text-base font-medium">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    ))}
                  </Accordion>
                </TabsContent>

                <TabsContent value="appointments">
                  <Accordion type="single" collapsible className="w-full">
                    {[
                      {
                        question:
                          "Comment prendre rendez-vous avec un médecin ?",
                        answer:
                          "Recherchez un médecin en utilisant la barre de recherche ou en parcourant les spécialités. Sélectionnez le médecin de votre choix, consultez ses disponibilités et cliquez sur un créneau horaire qui vous convient. Confirmez votre rendez-vous en fournissant les informations demandées.",
                      },
                      {
                        question:
                          "Comment annuler ou reporter un rendez-vous ?",
                        answer:
                          "Connectez-vous à votre compte, accédez à la section 'Mes rendez-vous'. Trouvez le rendez-vous que vous souhaitez modifier et cliquez sur 'Annuler' ou 'Reporter'. Pour un report, vous devrez sélectionner un nouveau créneau horaire disponible.",
                      },
                      {
                        question:
                          "Puis-je prendre rendez-vous pour quelqu'un d'autre ?",
                        answer:
                          "Oui, lors de la prise de rendez-vous, vous pouvez indiquer que le rendez-vous est pour une autre personne et fournir ses informations. Notez que pour des raisons de confidentialité, certaines fonctionnalités peuvent être limitées.",
                      },
                      {
                        question:
                          "Comment recevoir des rappels de rendez-vous ?",
                        answer:
                          "Les rappels de rendez-vous sont activés par défaut. Vous recevrez des notifications par email et SMS. Vous pouvez personnaliser vos préférences de rappel dans les paramètres de votre compte, section 'Notifications'.",
                      },
                      {
                        question:
                          "Que faire en cas de retard à mon rendez-vous ?",
                        answer:
                          "Si vous prévoyez d'être en retard, contactez directement le cabinet médical ou l'établissement de santé dès que possible. Selon la politique du médecin, votre rendez-vous pourra être maintenu, reporté ou annulé.",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <AccordionItem value={`item-${index}`}>
                          <AccordionTrigger className="text-left text-base font-medium">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    ))}
                  </Accordion>
                </TabsContent>
              </Tabs>
            </motion.div>

            <motion.div
              className="text-center mt-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-muted-foreground mb-4">
                Vous ne trouvez pas la réponse à votre question ?
              </p>
              <Link href="#contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-primary hover:bg-primary/90">
                    Contacter le support
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section
        id="contact"
        className="py-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 scroll-mt-16"
      >
        <div className="container px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl font-bold mb-4"
              >
                Contactez-nous
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-muted-foreground max-w-2xl mx-auto"
              >
                Notre équipe de support est disponible pour vous aider avec
                toutes vos questions
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {[
                {
                  icon: <Phone className="h-6 w-6 text-primary" />,
                  title: "Par téléphone",
                  description:
                    "Notre équipe de support est disponible du lundi au vendredi, de 8h à 18h",
                  info: "+223 77 77 77 77",
                },
                {
                  icon: <Mail className="h-6 w-6 text-primary" />,
                  title: "Par email",
                  description:
                    "Envoyez-nous un email et nous vous répondrons dans les 24 heures",
                  info: "support@miticsarlml.com",
                },
              ].map((contact, index) => (
                <motion.div key={index} custom={index} variants={cardVariants}>
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-full">
                    <CardHeader className="flex flex-col items-center text-center">
                      <motion.div
                        className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                        }}
                      >
                        {contact.icon}
                      </motion.div>
                      <CardTitle>{contact.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground mb-4">
                        {contact.description}
                      </p>
                      {contact.info && (
                        <p className="text-lg font-medium text-primary">
                          {contact.info}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mt-16 bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h3 className="text-2xl font-bold mb-4">
                    Envoyez-nous un message
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Remplissez le formulaire ci-dessous et nous vous répondrons
                    dans les plus brefs délais
                  </p>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="name" className="text-sm font-medium">
                          Nom complet
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Votre nom"
                          className="border-gray-300 dark:border-gray-700"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="votre@email.com"
                          className="border-gray-300 dark:border-gray-700"
                        />
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="subject" className="text-sm font-medium">
                        Sujet
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Comment pouvons-nous vous aider ?"
                        className="border-gray-300 dark:border-gray-700"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="space-y-2"
                    >
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Décrivez votre problème en détail..."
                      ></Textarea>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        {loading ? "Envoi en cours..." : "Envoyer le message"}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>

                <motion.div
                  className="flex flex-col justify-center"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <motion.div
                    className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="text-xl font-semibold mb-4">
                      Heures de support
                    </h4>

                    <motion.div
                      className="space-y-3"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={staggerContainer}
                    >
                      {[
                        { day: "Lundi - Vendredi", hours: "8h - 18h" },
                        { day: "Samedi", hours: "9h - 15h" },
                        { day: "Dimanche", hours: "Fermé" },
                      ].map((schedule, index) => (
                        <motion.div
                          key={index}
                          variants={fadeInUp}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="font-medium">{schedule.day}</span>
                          </div>
                          <span>{schedule.hours}</span>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <h4 className="text-xl font-semibold mb-4">
                        Support d&apos;urgence
                      </h4>
                      <p className="text-muted-foreground mb-4">
                        Pour les urgences techniques en dehors des heures de
                        bureau :
                      </p>
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        <Phone className="h-5 w-5 text-primary" />
                        <span className="font-medium">+223 70 00 00 00</span>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
