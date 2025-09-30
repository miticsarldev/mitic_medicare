"use client";

import { useEdgeStore } from "@/lib/edgestore";
import React, { createContext, useContext, useMemo, useState } from "react";

type UploadCtx = {
  edgestore: ReturnType<typeof useEdgeStore>["edgestore"];
  // global dashboard of active uploads (optional)
  active: number;
  setActive: React.Dispatch<React.SetStateAction<number>>;
};

const UploadContext = createContext<UploadCtx | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const { edgestore } = useEdgeStore();
  const [active, setActive] = useState(0);

  const value = useMemo(
    () => ({ edgestore, active, setActive }),
    [edgestore, active]
  );
  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
}

export function useUploadContext() {
  const ctx = useContext(UploadContext);
  if (!ctx)
    throw new Error("useUploadContext must be used within <UploadProvider>");
  return ctx;
}
