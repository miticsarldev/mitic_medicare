"use client";

import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { getNavItems } from "@/lib/nav-links";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export function NavMain() {
  const session = useSession();
  const user = session.data?.user;

  const navItems = getNavItems(user?.role ?? UserRole.PATIENT).map((item) => ({
    ...item,
    url: item.url ?? "#",
  }));

  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {navItems?.map((item) => {
          const isActive =
            pathname === item.url ||
            item.items.some((subItem) => pathname === subItem.url);

          const isDefaultOpen = item.items.some((subItem) =>
            pathname.startsWith(subItem.url)
          );

          return (
            <Collapsible
              key={item.title}
              asChild
              className="group/collapsible"
              defaultOpen={isActive}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isDefaultOpen}
                  >
                    {item?.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubActive = pathname === subItem.url;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isSubActive}>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
