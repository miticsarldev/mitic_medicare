"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils"; // or use clsx if you prefer

type Breakpoint = "sm" | "md" | "lg" | "xl";
type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  href?: string;
  className?: string;
  logoSrc?: string;
  wordmark?: React.ReactNode;
  /** hide the wordmark below this breakpoint (e.g. "sm" -> hidden on xs) */
  collapseAt?: Breakpoint | false;
  /** choose a size that literally aligns logo&text heights */
  size?: Size;
  /** show wordmark text */
  withText?: boolean;
  /** pass through to next/image */
  priority?: boolean;
  unoptimized?: boolean;
  /** accessible label for the link */
  ariaLabel?: string;
};

const sizeMap: Record<Size, { logoPx: number; textClass: string }> = {
  // logoPx roughly equals the text cap-height for visual parity
  sm: { logoPx: 24, textClass: "text-2xl" }, // 24px
  md: { logoPx: 30, textClass: "text-3xl" }, // ~30px
  lg: { logoPx: 36, textClass: "text-4xl" }, // 36px ← perfect match for your current text
  xl: { logoPx: 40, textClass: "text-[40px]" }, // 40px exact match
};

export function BrandLink({
  href = "/",
  className,
  logoSrc = "/logos/logo_mitic_dark.png",
  wordmark = (
    <>
      <span className="text-foreground">care</span>
    </>
  ),
  collapseAt = "sm",
  size = "lg",
  withText = true,
  priority,
  unoptimized,
  ariaLabel = "Care — Accueil",
}: Props) {
  const { logoPx, textClass } = sizeMap[size];
  const collapseClass = collapseAt
    ? cn("hidden", `${collapseAt}:inline-block`)
    : "";

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-1", className)}
    >
      {/* Logo */}
      <div
        className="rounded-full inline-flex items-center justify-center"
        style={{ height: logoPx, width: logoPx }}
      >
        <Image
          src={logoSrc}
          alt="Logo"
          width={logoPx}
          height={logoPx}
          // keep it visually square; if your logo isn't square, remove width here and keep height via style
          style={{ height: logoPx, width: logoPx, objectFit: "contain" }}
          priority={priority}
          unoptimized={unoptimized}
        />
      </div>

      {/* Wordmark */}
      {withText && (
        <span
          className={cn(
            "font-semibold leading-none tracking-tight align-middle",
            textClass,
            collapseClass
          )}
          // micro-nudge if you want pixel-perfect optical centering:
          // style={{ position: "relative", top: "0.5px" }}
        >
          {wordmark}
        </span>
      )}
    </Link>
  );
}
