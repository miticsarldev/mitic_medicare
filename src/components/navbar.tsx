"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { useSession } from "next-auth/react";
import { NavUserNavbar } from "./nav-user-navbar";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { Menu } from "lucide-react";

const Navbar = () => {
  //   const [isOpen, setIsOpen] = React.useState(false);
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-2xl w-full font-bold whitespace-nowrap">
          <span className="text-[#107ACA]">Medi</span>Care
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {session ? (
          <NavUserNavbar user={session.user} />
        ) : (
          <Link
            href="/auth"
            className="shadow text-white bg-[#107ACA] h-9 px-4 py-2 hover:bg-[#0A5A8A] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
          >
            Se Connecter
          </Link>
        )}
        <Button
          variant="outline"
          className="border-[#107ACA] text-[#107ACA] shadow h-9 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
        >
          Centre aide
        </Button>
        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
