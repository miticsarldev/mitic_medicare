import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import AboutPageComponent from "@/components/about-page";

export const metadata: Metadata = {
  title: "À propos de nous | MITICCARE",
  description:
    "Découvrez l'histoire, la mission et les valeurs de MITICCARE, votre plateforme de gestion hospitalière et de santé au Mali",
};

export default function AboutPage() {
  return (
    <div className="max-w-screen-xl mx-auto">
      <Navbar />
      <AboutPageComponent />
      <Footer />
    </div>
  );
}
