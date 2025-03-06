import type React from "react";
import { cn } from "@/lib/utils";

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "accent";
}

export function Loader({
  size = "md",
  variant = "primary",
  className,
  ...props
}: LoaderProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        role="status"
        aria-label="Loading"
        className={cn(
          "inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
          {
            "h-4 w-4": size === "sm",
            "h-8 w-8": size === "md",
            "h-12 w-12": size === "lg",
            "text-primary": variant === "primary",
            "text-secondary": variant === "secondary",
            "text-accent": variant === "accent",
          },
          className
        )}
        {...props}
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    </div>
  );
}
