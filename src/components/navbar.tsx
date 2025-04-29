import Link from "next/link";
import { getServerSession } from "next-auth";
import { Menu } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { NavUserNavbar } from "./nav-user-navbar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between mx-auto px-4">
        {/* Logo and brand */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-0.5">
            <div className="h-6 w-auto rounded-full flex items-center justify-center">
              <Image
                src="/logos/logo_mitic_dark.png"
                alt="Logo"
                className="h-6 w-auto object-cover"
                width={40}
                height={40}
                priority
                unoptimized
              />
            </div>
            <span className="font-semibold text-4xl hidden sm:inline-block">
              <span className="text-foreground">care</span>
            </span>
          </Link>
        </div>

        {/* Actions section */}
        <div className="flex items-center gap-2">
          <Link href="/help">
            <Button
              variant="outline"
              className="border-[#107ACA] text-[#107ACA] hidden sm:flex"
              size="sm"
            >
              Centre d&apos;aide
            </Button>
          </Link>

          {/* User section */}
          {session ? (
            <NavUserNavbar user={session.user} />
          ) : (
            <Link href="/auth">
              <Button className="bg-[#107ACA] hover:bg-[#0A5A8A]" size="sm">
                Se connecter
              </Button>
            </Link>
          )}

          {/* Theme toggle */}
          <ModeToggle />

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <SheetHeader className="pb-6">
                <SheetTitle>
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="h-6 w-auto rounded-full flex items-center justify-center">
                      <Image
                        src="/logos/logo_mitic_dark.png"
                        alt="Logo"
                        className="h-6 w-auto object-cover"
                        width={40}
                        height={40}
                        priority
                      />
                    </div>
                    <span className="font-semibold text-4xl">
                      <span className="text-foreground">Care</span>
                    </span>
                  </Link>
                </SheetTitle>
                <SheetDescription />
              </SheetHeader>
              <nav className="flex flex-col space-y-4">
                <div className="h-px bg-border my-2" />
                <Link href="/help">
                  <Button
                    variant="outline"
                    className="border-[#107ACA] text-[#107ACA] w-full justify-start"
                    size="sm"
                  >
                    Centre d&apos;aide
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
