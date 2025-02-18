"use client";

import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import Navbar from "@/components/navbar";
import { ServicesSection } from "@/components/service-section";
import { QuestionsSection } from "@/components/questions-section";
import { NewsletterSection } from "@/components/newsletter-section";
import { CareGiver } from "@/components/care-giver";
import { LastItemSection } from "@/components/last-item-section";
import { MedSection } from "@/components/doctors-section";
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
        <QuestionsSection />

        {/*Question Section*/}
        <MedSection />

        {/*Question Section*/}
        <LastItemSection />

        {/*Question Section*/}
        <CareGiver />

        {/*Newsletter*/}
        <NewsletterSection />
        
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
