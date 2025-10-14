"use client";

import { useState } from "react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { getNavItems } from "@/lib/nav-links";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export function NavMain() {
  const session = useSession();
  const user = session.data?.user;
  const { setOpenMobile, isMobile } = useSidebar();
  const pathname = usePathname();

  const navItems = getNavItems(user?.role ?? UserRole.PATIENT).map((item) => ({
    ...item,
    url: item.url ?? "#",
  }));

  // Persist manual opens; current route's parent is always forced open.
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {navItems?.map((item) => {
          // parent is "active" if path matches the parent url or any child url by prefix
          const inParentByItemUrl =
            !!item.url &&
            (pathname === item.url || pathname.startsWith(item.url + "/"));
          const inParentByChildren =
            item.items?.some((sub) => pathname.startsWith(sub.url)) ?? false;

          const isParentActive = inParentByItemUrl || inParentByChildren;

          // Parent open state: force-open if parent active OR if user toggled it open
          const isOpen = isParentActive || openMap[item.title] === true;

          return (
            <Collapsible
              key={item.title}
              className="group/collapsible"
              open={isOpen}
              onOpenChange={(v) =>
                setOpenMap((prev) => ({ ...prev, [item.title]: v }))
              }
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isParentActive}
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
                            <Link
                              href={subItem.url}
                              onClick={() => {
                                if (isMobile) setOpenMobile(false);
                              }}
                            >
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
