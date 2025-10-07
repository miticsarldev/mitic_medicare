import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import LegalPageShell from "@/components/legal/legal-page-shell";
import LegalSection from "@/components/legal/section";
import LegalTOC from "@/components/legal/toc";
import { LegalList } from "@/components/legal/list";

export const metadata: Metadata = {
  title: "Politique de confidentialité | MITICCARE",
  description:
    "Politique de confidentialité MITICCARE : données collectées, base légale, finalités, hébergement, partage, conservation, droits et cookies.",
};

const tocItems = [
  { id: "intro", label: "1. Introduction" },
  { id: "donnees", label: "2. Données collectées" },
  { id: "finalites", label: "3. Finalités & bases légales" },
  { id: "conservation", label: "4. Durées de conservation" },
  { id: "partage", label: "5. Partage & sous-traitance" },
  { id: "transferts", label: "6. Transferts internationaux" },
  { id: "securite", label: "7. Sécurité" },
  { id: "droits", label: "8. Vos droits" },
  { id: "cookies", label: "9. Cookies" },
  { id: "contact-dpo", label: "10. Contact / DPO" },
];

export default function Page() {
  return (
    <div className="max-w-screen-xl mx-auto">
      <Navbar />

      <LegalPageShell
        title="Politique de confidentialité"
        subtitle="Protection des données personnelles sur MITICCARE"
        lastUpdated="06/10/2025"
        toc={<LegalTOC items={tocItems} />}
      >
        <LegalSection id="intro" title="1. Introduction">
          <p>
            Cette politique explique comment MITIC SARL collecte, utilise,
            protège et partage vos données personnelles dans le cadre de
            l’utilisation de la plateforme MITICCARE, conformément aux exigences
            applicables (incluant RGPD et législation locale).
          </p>
        </LegalSection>

        <LegalSection id="donnees" title="2. Données collectées">
          <LegalList>
            <li>
              <strong>Données d’identification :</strong> nom, email, téléphone,
              rôle…
            </li>
            <li>
              <strong>Données de santé :</strong> informations nécessaires
              (consultations, prescriptions, rendez-vous…)
            </li>
            <li>
              <strong>Données techniques :</strong> logs, IP, device, stats
              d’usage (anonymisées si possible).
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="finalites" title="3. Finalités & bases légales">
          <p className="mb-3">
            Nous traitons vos données pour les finalités suivantes :
          </p>
          <LegalList>
            <li>
              <strong>Fourniture du service</strong> (contrat) : compte,
              rendez-vous, dossiers médicaux.
            </li>
            <li>
              <strong>Sécurité & anti-fraude</strong> (intérêt légitime).
            </li>
            <li>
              <strong>Obligations légales</strong> (conformité).
            </li>
            <li>
              <strong>Amélioration produit & analytics</strong> (intérêt
              légitime / consentement).
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="conservation" title="4. Durées de conservation">
          <p>
            Conservation le temps nécessaire aux finalités, puis archivage ou
            anonymisation conformément à la loi et aux bonnes pratiques.
          </p>
        </LegalSection>

        <LegalSection id="partage" title="5. Partage & sous-traitance">
          <LegalList>
            <li>
              <strong>Soignants & établissements</strong> : partage minimum
              nécessaire.
            </li>
            <li>
              <strong>Sous-traitants</strong> (hébergeur, e-mailing, paiements)
              sous DPA.
            </li>
            <li>
              <strong>Autorités</strong> lorsque requis par la loi.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="transferts" title="6. Transferts internationaux">
          <p>
            Garanties appropriées (CCT, mesures supplémentaires) pour un niveau
            de protection adéquat.
          </p>
        </LegalSection>

        <LegalSection id="securite" title="7. Sécurité">
          <LegalList>
            <li>Chiffrement en transit, contrôle d’accès, journalisation.</li>
            <li>Hébergement conforme & audité.</li>
            <li>Politiques internes, sensibilisation, gestion d’incidents.</li>
          </LegalList>
        </LegalSection>

        <LegalSection id="droits" title="8. Vos droits">
          <LegalList>
            <li>Accès, rectification, effacement.</li>
            <li>Limitation, opposition, portabilité.</li>
            <li>
              Retrait du consentement (le cas échéant) sans effet rétroactif.
            </li>
            <li>Réclamation auprès de l’autorité compétente.</li>
          </LegalList>
        </LegalSection>

        <LegalSection id="cookies" title="9. Cookies">
          <p>
            Cookies nécessaires + (avec consentement) mesure d’audience. Gérez
            vos préférences à tout moment.
          </p>
        </LegalSection>

        <LegalSection id="contact-dpo" title="10. Contact / DPO">
          <p>
            <strong>MITIC SARL – MITICCARE</strong>, Hamdallaye ACI 2000 –
            Bamako
            <br />
            <a
              className="text-blue-600 underline hover:no-underline dark:text-blue-400"
              href="mailto:contact@miticsarlml.com"
            >
              contact@miticsarlml.com
            </a>{" "}
            · +223 73 81 00 23 / +33 7 53 92 77 21
          </p>
        </LegalSection>
      </LegalPageShell>

      <Footer />
    </div>
  );
}
