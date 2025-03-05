import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";

export default function ProfilePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* HEADER */}
        <header className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Profil</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Mon Profil</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* SECTION PROFIL */}
          <section className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
            <div className="bg-white dark:bg-gray-800 shadow-md sm:rounded-lg overflow-hidden p-8">
              
              {/* AVATAR */}
              <div className="flex flex-col items-center gap-4">
                <Image
                  className="h-24 w-24 rounded-full object-cover"
                  src="https://res.cloudinary.com/subframe/image/upload/v1711417513/shared/kwut7rhuyivweg8tmyzl.jpg"
                  alt="Avatar"
                />
                <Button variant="outline">Changer la photo</Button>
              </div>

              {/* INFORMATIONS PERSONNELLES */}
              <div className="w-full max-w-lg space-y-6 mt-6">
                <h2 className="text-xl font-bold dark:text-white">Informations Personnelles</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mettez à jour vos informations personnelles.
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="nom" className="text-sm font-medium text-gray-700 dark:text-white">Nom</label>
                    <Input id="nom" className="w-full" placeholder="Votre nom" />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-white">Email</label>
                    <Input id="email" className="w-full" placeholder="Votre email" />
                  </div>
                  <div>
                    <label htmlFor="telephone" className="text-sm font-medium text-gray-700 dark:text-white">Téléphone</label>
                    <Input id="telephone" className="w-full" placeholder="Votre téléphone" />
                  </div>
                  <div>
                    <label htmlFor="adresse" className="text-sm font-medium text-gray-700 dark:text-white">Adresse</label>
                    <Input id="adresse" className="w-full" placeholder="Votre adresse" />
                  </div>
                  <div>
                    <label htmlFor="date-naissance" className="text-sm font-medium text-gray-700 dark:text-white">Date de naissance</label>
                    <Input id="date-naissance" type="date" className="w-full" />
                  </div>
                </div>

                <Button className="w-full">Enregistrer les modifications</Button>
              </div>

              {/* MOT DE PASSE */}
              <div className="w-full max-w-lg space-y-6 mt-8">
                <h2 className="text-xl font-bold dark:text-white">Mot de Passe</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Changez votre mot de passe.</p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="old-password" className="text-sm font-medium text-gray-700 dark:text-white">
                      Ancien mot de passe
                    </label>
                    <Input id="old-password" type="password" className="w-full" placeholder="Entrez votre ancien mot de passe" />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="text-sm font-medium text-gray-700 dark:text-white">
                      Nouveau mot de passe
                    </label>
                    <Input id="new-password" type="password" className="w-full" placeholder="Entrez votre nouveau mot de passe" />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 dark:text-white">
                      Confirmez le nouveau mot de passe
                    </label>
                    <Input id="confirm-password" type="password" className="w-full" placeholder="Confirmez votre nouveau mot de passe" />
                  </div>
                </div>

                <Button className="w-full">Changer le mot de passe</Button>
              </div>

              {/* ZONE DE DANGER */}
              <div className="w-full max-w-lg space-y-6 mt-8">
                <h2 className="text-xl font-bold dark:text-white">Zone de Danger</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Actions irréversibles.</p>

                <Alert variant="destructive">
                  <AlertTitle>Supprimer le compte</AlertTitle>
                  <AlertDescription>
                      Cette action supprimera définitivement votre compte. Elle est irréversible.
                  </AlertDescription>
                  <Button variant="destructive" className="mt-2">Supprimer le compte</Button>
                </Alert>
              </div>

            </div>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
