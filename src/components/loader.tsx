// components/ui/Loader.tsx
import { Loader2 } from "lucide-react";

export function Loader({ className = "" }: { className?: string }) {
  return (
    <Loader2 className={`animate-spin ${className}`} />
  );
}