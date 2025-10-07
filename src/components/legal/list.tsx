// "use client";

// import { type ReactNode } from "react";
// import { CheckCircle2 } from "lucide-react";

// export function LegalList({ children }: { children: ReactNode }) {
//   // Utilisation : <LegalList><li>…</li><li>…</li></LegalList>
//   return (
//     <ul className="space-y-2">
//       {/* On remplace visuellement les puces via before */}
//       {Array.isArray(children)
//         ? children.map((child, i) => (
//             <li
//               key={i}
//               className="relative flex gap-3 rounded-lg border border-slate-200 bg-white/50 p-3 text-[15px] leading-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
//             >
//               <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
//               <div className="text-slate-700 dark:text-slate-200">{child}</div>
//             </li>
//           ))
//         : null}
//     </ul>
//   );
// }

// components/legal/list.tsx
import { type ReactNode, Children } from "react";
import { CheckCircle2 } from "lucide-react";

export function LegalList({ children }: { children: ReactNode }) {
  return (
    <ul className="space-y-2">
      {Children.map(children, (child, i) => (
        <li
          key={i}
          className="relative flex gap-3 rounded-lg border border-slate-200 bg-white/50 p-3 text-[15px] leading-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
        >
          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-slate-700 dark:text-slate-200">{child}</div>
        </li>
      ))}
    </ul>
  );
}
