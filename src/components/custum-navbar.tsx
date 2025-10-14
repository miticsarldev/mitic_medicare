import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-4 border-b border-[#107ACA]">
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-2">
              <Menu className="w-6 h-6 text-[#107ACA]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/services">Nos Services</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/about">À Propos</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/help">Contact</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/" className="text-2xl font-bold whitespace-nowrap">
          <span className="text-[#107ACA]">Medi</span>Care
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/auth"
          className="shadow text-white bg-[#107ACA] h-9 px-4 py-2 hover:bg-[#0A5A8A] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
        >
          Se Connecter
        </Link>
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
