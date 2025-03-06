import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/navbar";
import Image from "next/image";
import LoginForm from "@/components/login-form";
import RegisterForm from "@/components/register-form";

export default function AuthPage() {
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
          <div className="w-full md:w-1/2 max-w-md mx-auto space-y-6">
            <h1 className="text-xl md:text-2xl font-semibold text-center px-4">
              Vous avez déjà utilisé{" "}
              <span className="text-primary">
                Medi<span className="text-[#107ACA]">Care</span>
              </span>{" "}
              ?
            </h1>

            <div className="bg-card dark:bg-card/50 rounded-lg shadow-lg p-6 backdrop-blur-sm">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="register">Inscription</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
