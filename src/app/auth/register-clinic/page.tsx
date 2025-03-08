import Navbar from "@/components/navbar";
import Image from "next/image";
import RegisterClinicForm from "@/components/register-clinic";

export default function RegisterClinic() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-200 dark:from-background dark:to-blue-950/50">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <Navbar />
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 md:py-6 flex flex-col md:flex-row items-stretch">
          {/* Image Section */}
          <div className="hidden md:flex relative">
            <Image
              src="/doctors.png"
              alt="Doctors"
              width={400}
              height={200}
              priority
              className="rounded-l-lg h-auto relative w-full object-cover"
            />
          </div>

          {/* Form Section */}
          <div className="bg-card dark:bg-card/50 rounded-lg shadow-lg backdrop-blur-sm">
            <RegisterClinicForm />
          </div>
        </main>
      </div>
    </div>
  );
}
