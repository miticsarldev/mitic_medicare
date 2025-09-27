"use client";

import { OrangeMoneyProvider } from "@/contexts/OrangeMoneyContext";
import { SessionProvider } from "next-auth/react";

export default function RootSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <OrangeMoneyProvider>{children}</OrangeMoneyProvider>
    </SessionProvider>
  );
}
