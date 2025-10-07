// "use client";

// import { type ReactNode } from "react";
// import { Link as LinkIcon } from "lucide-react";

// type Props = {
//   id: string;
//   title: string;
//   subtitle?: string;
//   children: ReactNode;
// };

// export default function LegalSection({ id, title, subtitle, children }: Props) {
//   return (
//     <section
//       id={id}
//       className="group relative scroll-mt-28 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 md:p-8"
//     >
//       {/* Accent top bar */}
//       <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600 opacity-80" />

//       {/* Anchor on hover */}
//       <a
//         href={`#${id}`}
//         className="absolute right-4 top-4 hidden items-center gap-1 rounded-md border border-transparent bg-slate-100/60 px-2 py-1 text-xs text-slate-600 opacity-0 ring-1 ring-slate-200 transition group-hover:opacity-100 dark:bg-slate-800/50 dark:text-slate-300 dark:ring-slate-700 md:flex"
//         aria-label={`Lien direct vers ${title}`}
//       >
//         <LinkIcon className="h-3.5 w-3.5" />
//         Lien
//       </a>

//       <header className="mb-5">
//         <h2 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-slate-300 md:text-3xl">
//           {title}
//         </h2>
//         {subtitle ? (
//           <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
//             {subtitle}
//           </p>
//         ) : null}
//       </header>

//       <div className="prose max-w-none prose-slate prose-headings:scroll-mt-28 dark:prose-invert">
//         {children}
//       </div>
//     </section>
//   );
// }

// components/legal/section.tsx
import { type ReactNode } from "react";
import { Link as LinkIcon } from "lucide-react";

export default function LegalSection({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="group relative scroll-mt-28 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 md:p-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600 opacity-80" />

      <a
        href={`#${id}`}
        className="absolute right-4 top-4 hidden items-center gap-1 rounded-md border border-transparent bg-slate-100/60 px-2 py-1 text-xs text-slate-600 opacity-0 ring-1 ring-slate-200 transition group-hover:opacity-100 dark:bg-slate-800/50 dark:text-slate-300 dark:ring-slate-700 md:flex"
        aria-label={`Lien direct vers ${title}`}
      >
        <LinkIcon className="h-3.5 w-3.5" />
        Lien
      </a>

      <header className="mb-5">
        <h2 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-slate-300 md:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {subtitle}
          </p>
        ) : null}
      </header>

      <div className="prose max-w-none prose-slate prose-headings:scroll-mt-28 dark:prose-invert">
        {children}
      </div>
    </section>
  );
}
