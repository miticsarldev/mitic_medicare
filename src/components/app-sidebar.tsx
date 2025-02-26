"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  // teams: [
  //   {
  //     name: "Acme Inc",
  //     logo: GalleryVerticalEnd,
  //     plan: "Enterprise",
  //   },
  //   {
  //     name: "Acme Corp.",
  //     logo: AudioWaveform,
  //     plan: "Startup",
  //   },
  //   {
  //     name: "Evil Corp.",
  //     logo: Command,
  //     plan: "Free",
  //   },
  // ],
  navMain: [
    {
      title: "Tableau de Bord",
      url: "#",
      icon: PieChart,
      isActive: true,
      items: [
        {
          title: "Vue d'ensemble",
          url: "#",
        },
        {
          title: "Statistiques",
          url: "#",
        },
      ],
    },
    {
      title: "Patients",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Rendez-vous",
          url: "#",
        },
        {
          title: "Paramètres",
          url: "#",
        },
      ],
    },
    {
      title: "Médecins",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Liste des Médecins",
          url: "#",
        },
        {
          title: "Disponibilités",
          url: "#",
        },
        {
          title: "Rendez-vous",
          url: "#",
        },
      ],
    },
    {
      title: "Administrateur",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Gestion des Utilisateurs",
          url: "admin/manage-users",
        },
        {
          title: "Rendez-vous",
          url: "#",
        },
        {
          title: "Paramètres",
          url: "#",
        },
        
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
