"use client";

import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import Navbar from "@/components/navbar";
import { ServicesSection } from "@/components/service-section";

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
