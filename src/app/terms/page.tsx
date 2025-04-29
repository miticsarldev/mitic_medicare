import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Conditions d'utilisation | MITIC Care",
  description: "Conditions générales d'utilisation de la plateforme MITIC Care",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container px-4 md:px-6 py-12">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              Conditions d&apos;utilisation
            </h1>
          </div>

          <p className="text-muted-foreground mb-6">
            Dernière mise à jour :{" "}
            {new Date().toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <Separator className="mb-8" />

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Bienvenue sur MITIC Care. Les présentes Conditions
              d&apos;utilisation régissent votre utilisation de notre
              plateforme, accessible via notre site web et notre application
              mobile. En utilisant notre service, vous acceptez d&apos;être lié
              par ces conditions. Si vous n&apos;acceptez pas ces conditions,
              veuillez ne pas utiliser notre service.
            </p>

            <h2>2. Définitions</h2>
            <p>
              <strong>&quot;Service&quot;</strong> désigne la plateforme MITIC
              Care, y compris le site web et l&apos;application mobile.
            </p>
            <p>
              <strong>&quot;Utilisateur&quot;</strong> désigne toute personne
              qui accède ou utilise le Service, y compris les patients, les
              médecins et les administrateurs d&apos;établissements de santé.
            </p>
            <p>
              <strong>&quot;Contenu&quot;</strong> désigne toutes les
              informations, textes, images, vidéos, données ou autres matériels
              que les utilisateurs soumettent, téléchargent, publient ou
              transmettent sur le Service.
            </p>

            <h2>3. Inscription et comptes</h2>
            <p>
              Pour utiliser certaines fonctionnalités du Service, vous devez
              créer un compte. Vous êtes responsable de maintenir la
              confidentialité de vos informations de compte et de toutes les
              activités qui se produisent sous votre compte. Vous devez nous
              informer immédiatement de toute utilisation non autorisée de votre
              compte.
            </p>
            <p>
              Lors de l&apos;inscription, vous devez fournir des informations
              exactes, complètes et à jour. Si nous avons des raisons de croire
              que les informations fournies sont inexactes, incomplètes ou
              obsolètes, nous nous réservons le droit de suspendre ou de
              résilier votre compte.
            </p>

            <h2>4. Utilisation du service</h2>
            <h3>4.1 Règles générales</h3>
            <p>Vous acceptez de ne pas utiliser le Service pour :</p>
            <ul>
              <li>Violer les lois ou réglementations applicables</li>
              <li>Enfreindre les droits d&apos;autrui</li>
              <li>
                Publier du contenu illégal, offensant, diffamatoire ou autrement
                répréhensible
              </li>
              <li>Usurper l&apos;identité d&apos;une autre personne</li>
              <li>
                Collecter ou stocker des données personnelles d&apos;autres
                utilisateurs sans leur consentement
              </li>
              <li>Interférer avec le fonctionnement normal du Service</li>
            </ul>

            <h3>4.2 Règles spécifiques pour les professionnels de santé</h3>
            <p>
              Si vous êtes un professionnel de santé utilisant notre Service,
              vous acceptez de :
            </p>
            <ul>
              <li>
                Fournir des informations exactes sur vos qualifications et votre
                expérience
              </li>
              <li>
                Respecter les normes professionnelles et éthiques de votre
                profession
              </li>
              <li>
                Maintenir la confidentialité des informations des patients
                conformément aux lois applicables
              </li>
              <li>
                Ne pas utiliser le Service pour fournir des conseils médicaux
                d&apos;urgence
              </li>
            </ul>

            <h2>5. Contenu</h2>
            <h3>5.1 Contenu de l&apos;utilisateur</h3>
            <p>
              Vous conservez tous les droits sur le contenu que vous soumettez,
              publiez ou affichez sur le Service. En soumettant du contenu, vous
              nous accordez une licence mondiale, non exclusive, libre de
              redevances pour utiliser, reproduire, modifier, adapter, publier,
              traduire et distribuer ce contenu dans le cadre du Service.
            </p>

            <h3>5.2 Contenu interdit</h3>
            <p>
              Vous ne pouvez pas soumettre, publier ou afficher du contenu qui :
            </p>
            <ul>
              <li>
                Est illégal, diffamatoire, obscène, pornographique, menaçant ou
                harcelant
              </li>
              <li>
                Enfreint les droits de propriété intellectuelle d&apos;autrui
              </li>
              <li>
                Contient des virus, des logiciels malveillants ou d&apos;autres
                codes nuisibles
              </li>
              <li>Constitue une publicité non sollicitée ou non autorisée</li>
            </ul>

            <h2>6. Confidentialité et données personnelles</h2>
            <p>
              Notre Politique de confidentialité décrit comment nous collectons,
              utilisons et partageons vos données personnelles. En utilisant
              notre Service, vous consentez à la collecte et à
              l&apos;utilisation de vos données conformément à notre Politique
              de confidentialité.
            </p>

            <h2>7. Propriété intellectuelle</h2>
            <p>
              Le Service et son contenu original, ses fonctionnalités et sa
              fonctionnalité sont la propriété de MITIC et sont protégés par les
              lois internationales sur le droit d&apos;auteur, les marques, les
              brevets, les secrets commerciaux et autres lois sur la propriété
              intellectuelle.
            </p>

            <h2>8. Limitation de responsabilité</h2>
            <p>
              Dans toute la mesure permise par la loi, MITIC ne sera pas
              responsable des dommages indirects, accessoires, spéciaux,
              consécutifs ou punitifs, ou de toute perte de profits ou de
              revenus, que ces dommages soient prévisibles ou non, et même si
              MITIC a été informé de la possibilité de tels dommages.
            </p>

            <h2>9. Indemnisation</h2>
            <p>
              Vous acceptez de défendre, d&apos;indemniser et de tenir MITIC et
              ses dirigeants, administrateurs, employés et agents indemnes de
              toute réclamation, responsabilité, dommage, perte et dépense, y
              compris, sans limitation, les frais juridiques et comptables
              raisonnables, découlant de ou liés de quelque manière que ce soit
              à votre accès ou utilisation du Service, à votre violation des
              présentes Conditions, ou à votre violation des droits d&apos;un
              tiers.
            </p>

            <h2>10. Modifications des conditions</h2>
            <p>
              Nous nous réservons le droit de modifier ces Conditions à tout
              moment. Si nous apportons des modifications importantes, nous vous
              en informerons par email ou en affichant un avis sur notre
              Service. Votre utilisation continue du Service après la
              publication des modifications constitue votre acceptation de ces
              modifications.
            </p>

            <h2>11. Résiliation</h2>
            <p>
              Nous pouvons résilier ou suspendre votre compte et votre accès au
              Service immédiatement, sans préavis ni responsabilité, pour
              quelque raison que ce soit, y compris, sans limitation, si vous
              violez les présentes Conditions.
            </p>

            <h2>12. Loi applicable</h2>
            <p>
              Les présentes Conditions sont régies et interprétées conformément
              aux lois du Mali, sans égard aux principes de conflits de lois.
            </p>

            <h2>13. Contact</h2>
            <p>
              Si vous avez des questions concernant ces Conditions, veuillez
              nous contacter à l&apos;adresse suivante :{" "}
              <a
                href="mailto:legal@miticsarlml.com"
                className="text-primary hover:underline"
              >
                legal@miticsarlml.com
              </a>
            </p>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Link href="/privacy">
              <Button variant="outline">Politique de confidentialité</Button>
            </Link>
            <Link href="/help">
              <Button variant="outline">Centre d&apos;aide</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
