import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import Navbar from "@/components/navbar";
import { ServicesSection } from "@/components/service-section";
import { CareGiver } from "@/components/care-giver";
import { LastItemSection } from "@/components/last-item-section";
import { MedSection } from "@/components/doctors-section";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-screen-xl mx-auto">
        <Navbar />
        <HeroSection />
        <ServicesSection />
        <MedSection />
        <LastItemSection />
        <CareGiver />
        <Footer />
      </div>
    </div>
  );
}
