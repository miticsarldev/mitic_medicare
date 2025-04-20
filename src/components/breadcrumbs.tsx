"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

export function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs();
  const last = breadcrumbs[breadcrumbs.length - 1];

  if (!last) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList className="hidden sm:flex">
        {breadcrumbs.map((breadcrumb, index) => (
          <div key={breadcrumb.href} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : index === 0 ? (
                <BreadcrumbPage className="cursor-default">
                  {breadcrumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={breadcrumb.href}>
                  {breadcrumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>

      {/* Mobile: only show the current page */}
      <BreadcrumbList className="flex sm:hidden">
        <BreadcrumbItem>
          <BreadcrumbPage className="truncate max-w-[90vw]">
            {last?.label}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
