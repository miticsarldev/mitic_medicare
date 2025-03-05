import { AppSidebar } from "@/components/app-sidebar"
import { Chart } from "@/components/chart"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {stats} from "@/components/stats"
import { usersData } from "@/components/user-data";

export default function Page() {
  const recentAppointments = usersData.slice(0, 6);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Sections avec icônes et chiffres */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="aspect-video rounded-xl bg-muted/50 p-6 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{stat.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>


        <Chart/>
         {/* Section "Rendez-vous Récents" */}
         <div className="rounded-xl bg-muted/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Rendez-vous Récents</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-background rounded-lg">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-5">Nom</th>
                    <th className="p-4">Médecin</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b">
                      <td className="p-3">{appointment.name}</td>
                      <td className="p-3">{appointment.doctor}</td>
                      <td className="p-3">{appointment.appointmentDate}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            appointment.status === "Confirmé"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "En attente"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
