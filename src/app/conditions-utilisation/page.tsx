import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import LegalPageShell from "@/components/legal/legal-page-shell";
import LegalSection from "@/components/legal/section";
import LegalTOC from "@/components/legal/toc";
import { LegalList } from "@/components/legal/list";

export const metadata: Metadata = {
  title: "Conditions d’utilisation | MITICCARE",
  description:
    "CGU MITICCARE : accès au service, obligations des utilisateurs, responsabilités, propriété intellectuelle, suspension, loi applicable et contact.",
};

const tocItems = [
  { id: "objet", label: "1. Objet" },
  { id: "acceptation", label: "2. Acceptation" },
  { id: "acces", label: "3. Accès à la plateforme" },
  { id: "obligations", label: "4. Obligations de l’utilisateur" },
  { id: "responsabilites", label: "5. Responsabilités" },
  { id: "propriete", label: "6. Propriété intellectuelle" },
  { id: "suspension", label: "7. Suspension / résiliation" },
  { id: "loi", label: "8. Loi applicable & juridiction" },
  { id: "contact", label: "9. Contact" },
];

export default function Page() {
  return (
    <div className="max-w-screen-xl mx-auto">
      <Navbar />

      <LegalPageShell
        title="Conditions d’utilisation"
        subtitle="Règles d’accès et d’usage de la plateforme MITICCARE"
        lastUpdated="06/10/2025"
        toc={<LegalTOC items={tocItems} />}
      >
        <LegalSection id="objet" title="1. Objet">
          <p>
            Les présentes Conditions Générales d’Utilisation (CGU) encadrent
            l’accès et l’utilisation de la plateforme <strong>MITICCARE</strong>{" "}
            par l’ensemble des utilisateurs (patients, médecins, établissements,
            administrateurs).
          </p>
        </LegalSection>

        <LegalSection id="acceptation" title="2. Acceptation">
          <p>
            En créant un compte ou en utilisant la plateforme, vous reconnaissez
            avoir lu, compris et accepté sans réserve les présentes CGU.
          </p>
        </LegalSection>

        <LegalSection id="acces" title="3. Accès à la plateforme">
          <LegalList>
            <li>
              Certaines fonctionnalités nécessitent la création d’un compte et
              une authentification.
            </li>
            <li>
              Vous vous engagez à fournir des informations exactes, à garder vos
              identifiants confidentiels et à signaler tout usage frauduleux.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="obligations" title="4. Obligations de l’utilisateur">
          <LegalList>
            <li>
              Respecter les lois applicables et l’éthique médicale en vigueur.
            </li>
            <li>
              Ne pas publier de contenu illégal, diffamatoire, discriminatoire
              ou contraire à la déontologie.
            </li>
            <li>
              Respecter la confidentialité des données de santé accessibles sur
              la plateforme.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="responsabilites" title="5. Responsabilités">
          <h3 className="text-lg font-semibold mt-2">MITIC&nbsp;SARL</h3>
          <LegalList>
            <li>
              Fournit la plateforme dans des conditions optimales de sécurité et
              de disponibilité.
            </li>
            <li>
              Ne garantit pas l’absence d’interruptions, mais s’efforce de
              corriger promptement les incidents.
            </li>
            <li>
              N’est pas responsable du contenu médical saisi par les
              professionnels de santé.
            </li>
          </LegalList>

          <h3 className="text-lg font-semibold mt-5">Utilisateur</h3>
          <LegalList>
            <li>Est responsable des informations qu’il saisit et transmet.</li>
            <li>Doit s’assurer de la véracité des données communiquées.</li>
            <li>
              S’engage à ne pas porter atteinte à la plateforme, aux autres
              utilisateurs ou aux droits de tiers.
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="propriete" title="6. Propriété intellectuelle">
          <p>
            L’ensemble des éléments de la plateforme (code, charte graphique,
            bases de données, logo MITICCARE, contenus) est protégé par le droit
            d’auteur et demeure la propriété exclusive de{" "}
            <strong>MITIC&nbsp;SARL</strong>. Toute reproduction, représentation
            ou réutilisation non autorisée est interdite.
          </p>
        </LegalSection>

        <LegalSection id="suspension" title="7. Suspension ou résiliation">
          <p>
            MITIC&nbsp;SARL peut suspendre ou supprimer un compte en cas de
            violation des CGU, d’usage frauduleux/abusif ou de non-respect de la
            confidentialité médicale. Vous serez informé dans la mesure du
            possible des motifs et des voies de recours.
          </p>
        </LegalSection>

        <LegalSection id="loi" title="8. Loi applicable et juridiction">
          <p>
            Les présentes CGU sont régies par le droit malien. Tout différend
            sera soumis aux juridictions compétentes de Bamako, après tentative
            de règlement amiable.
          </p>
        </LegalSection>

        <LegalSection id="contact" title="9. Contact">
          <p>
            <strong>MITIC&nbsp;SARL – MITICCARE</strong>
            <br />
            Hamdallaye ACI 2000 – Bamako
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
