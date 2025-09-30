import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import RootSessionProvider from "@/components/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { UploadProvider } from "@/providers/UploadProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MiticCare - Plateforme de gestion médicale",
  description:
    "Optimisez la gestion de votre hôpital ou cabinet médical avec MiticCare, la solution tout-en-un.",
  keywords: [
    "SaaS médical",
    "gestion hospitalière",
    "MiticCare",
    "plateforme médicale",
    "gestion de rendez-vous",
    "gestion de patients",
  ],
  authors: [{ name: "MiticCare", url: "https://miticcare.com" }],
  openGraph: {
    type: "website",
    url: "https://miticcare.com",
    title: "MiticCare - Plateforme de gestion médicale",
    description:
      "Optimisez la gestion de votre hôpital ou cabinet médical avec MiticCare, la solution SaaS tout-en-un.",
    siteName: "MiticCare",
    images: [
      {
        url: "https://miticcare.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MiticCare - Plateforme de gestion médicale",
      },
    ],
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "MiticCare - Plateforme de gestion médicale",
    description:
      "Optimisez la gestion de votre hôpital ou cabinet médical avec MiticCare, la solution SaaS tout-en-un.",
    images: ["https://miticcare.com/og-image.jpg"],
    site: "@MiticCare",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true} className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RootSessionProvider>
            <EdgeStoreProvider>
              <UploadProvider>{children}</UploadProvider>
            </EdgeStoreProvider>
            <Toaster />
          </RootSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
