import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import Navbar from "@/components/navbar";
import { ServicesSection } from "@/components/service-section";
import { CareGiver } from "@/components/care-giver";
import { MedSection } from "@/components/doctors-section";
import {
  getCities,
  getSpecializations,
  getTopDoctors,
} from "./actions/ui-actions";

export default async function Home() {
  const specializations = await getSpecializations();
  const cities = await getCities();
  const topDoctors = await getTopDoctors();

  return (
    <div className="min-h-screen">
      <div className="max-w-screen-xl mx-auto">
        <Navbar />
        <HeroSection specializations={specializations} cities={cities} />
        <ServicesSection />
        <MedSection doctors={topDoctors} />
        <CareGiver />
        <Footer />
      </div>
    </div>
  );
}
