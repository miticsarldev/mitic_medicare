"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/navbar";
import Image from "next/image";
import LoginForm from "@/components/login-form";
import RegisterForm from "@/components/register-form";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/dashboard");
    }
  }, [session, router]);

  // Function to reset everything (clear form & switch tab)
  const resetPage = () => {
    setActiveTab("login"); // Reset tab to login
    router.replace("/auth"); // Refresh page
  };

  return (
    <div className="h-screen bg-gradient-to-b from-background to-blue-200 dark:from-background dark:to-blue-950/50">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <Navbar />
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 md:py-6 flex flex-col md:flex-row items-stretch">
          {/* Image Section */}
          <div className="hidden md:flex w-1/2 relative">
            <Image
              src="/doctors.png"
              alt="Doctors"
              width={400}
              height={200}
              priority
              className="rounded-l-lg relative h-fit w-full object-cover"
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
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                defaultValue="login"
                className="w-full"
              >
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
                  <RegisterForm resetPage={resetPage} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
