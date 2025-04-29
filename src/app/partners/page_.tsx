import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import PartnersPageComponent from "@/components/partners-page";

export default function PartnersPage() {
  return (
    <div className="max-w-screen-xl mx-auto">
      <Navbar />
      <PartnersPageComponent />
      <Footer />
    </div>
  );
}
