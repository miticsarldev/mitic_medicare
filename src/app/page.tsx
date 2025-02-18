"use client";

import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import Navbar from "@/components/navbar";
import { ServicesSection } from "@/components/service-section";
import { Questions } from "@/components/Question";
import { Newsletter } from "@/components/Newleter";
import { Caregiver } from "@/components/Caregiver";
import { LastItemSection } from "@/components/LastItemSection";
import { MedSection } from "@/components/MedSection";
export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-screen-xl mx-auto">
        {/* Navigation */}
        <Navbar />

        {/* Hero Section */}
        <HeroSection />

        {/* Services Section */}
        <ServicesSection />

        {/*Question Section*/}
        <Questions />

        {/*Question Section*/}
        <MedSection />

        {/*Question Section*/}
        <LastItemSection />

        {/*Question Section*/}
        <Caregiver />

        {/*Newsletter*/}
        <Newsletter />
        
        {/* Doctors Section */}

        {/* Articles Section */}

        {/* Healthcare Professional Section */}

        {/* Newsletter Section */}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
