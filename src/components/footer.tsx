import type React from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="container px-4 md:px-6 py-16">
        <div className="grid gap-8 md:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">MITIC</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Card desription. Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Sit rhoncus imperdiet nisi.
            </p>
          </div>

          {/* Find Specialist Column */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Trouvez votre spécialiste</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Chirurgien-dentiste
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Ophtalmologue
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Infirmier à domicile
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Médecin généraliste
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Infirmier
              </Link>
            </nav>
          </div>

          {/* Our Company Column */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Notre Entreprise</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                À Propos de nous
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cariéres
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Bésoin d&apos;aide ?
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Santé
              </Link>
            </nav>
          </div>

          {/* Follow Us Column */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Suivez-nous</h3>
            <div className="flex space-x-4">
              <Link
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hover:text-primary"
                )}
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hover:text-primary"
                )}
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hover:text-primary"
                )}
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 MITIC. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
