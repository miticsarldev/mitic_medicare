"use client";

import {
  superAdminNavItems,
  doctorNavItems,
  hospitalAdminNavItems,
  patientNavItems,
  hospitalDoctorNavItems,
} from "@/lib/nav-links";
import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

type NavItem = {
  title: string;
  url: string;
  items?: NavItem[];
};

function findBreadcrumbs(items: NavItem[], pathname: string): NavItem[] {
  for (const item of items) {
    if (item.url === pathname) {
      return [item];
    }
    if (item.items) {
      const childBreadcrumbs = findBreadcrumbs(item.items, pathname);
      if (childBreadcrumbs.length) {
        return [item, ...childBreadcrumbs];
      }
    }
  }
  return [];
}

export function useBreadcrumbs() {
  const pathname = usePathname();
  const session = useSession();
  const user = useMemo(
    () => session?.data?.user ?? { role: UserRole.super_admin },
    [session]
  );

  const breadcrumbs = useMemo(() => {
    let navItems: NavItem[];
    if (user?.role === "super_admin") {
      navItems = superAdminNavItems;
    } else if (user?.role === "hospital_admin") {
      navItems = hospitalAdminNavItems;
    } else if (user?.role === "independent_doctor") {
      navItems = doctorNavItems;
    } else if (user?.role === "hospital_doctor") {
      navItems = hospitalDoctorNavItems;
    } else {
      navItems = patientNavItems;
    }

    const breadcrumbItems = findBreadcrumbs(navItems, pathname);
    return breadcrumbItems.map((item) => ({
      href: item.url,
      label: item.title,
    }));
  }, [pathname, user]);

  return breadcrumbs;
}
