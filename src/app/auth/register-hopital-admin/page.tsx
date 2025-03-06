import Navbar from "@/components/navbar";
import Image from "next/image";
import HospitalAdminRegisterForm from "@/components/hospital-admin-register";

export default function HospitalAdminRegister() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-200 dark:from-background dark:to-blue-950/50">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <Navbar />
        {/* Main Content */}
        <main className="container px-4 py-8 md:py-6 flex flex-col md:flex-row items-stretch">
          {/* Image Section */}
          <div className="hidden md:flex w-1/2 relative">
            <Image
              src="/doctors.png"
              alt="Doctors"
              width={400}
              height={200}
              objectFit="cover"
              className="rounded-l-lg absolute top-[-60px]"
            />
          </div>

          {/* Form Section */}
          <div className="bg-card dark:bg-card/50 rounded-lg shadow-lg p-6 backdrop-blur-sm space-y-6">
            <HospitalAdminRegisterForm />
          </div>
        </main>
      </div>
    </div>
  );
}
