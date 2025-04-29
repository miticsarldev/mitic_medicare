import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import HelpCenterComponent from "@/components/help-page";

export default function AboutPage() {
  return (
    <div className="max-w-screen-xl mx-auto">
      <Navbar />
      <HelpCenterComponent />
      <Footer />
    </div>
  );
}
