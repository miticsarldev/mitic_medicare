// // components/legal/legal-page-shell.tsx
// "use client";

// export default function LegalPageShell({
//   title,
//   subtitle,
//   toc,
//   children,
//   lastUpdated,
// }: {
//   title: string;
//   subtitle?: string;
//   toc?: React.ReactNode;
//   children: React.ReactNode;
//   lastUpdated?: string;
// }) {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
//       {/* décorations */}
//       <div className="pointer-events-none fixed inset-0 -z-10">
//         <div className="absolute left-[-8%] top-[-8%] h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
//         <div className="absolute right-[-5%] bottom-[-8%] h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
//       </div>

//       <div className="mx-auto max-w-screen-xl">
//         <main className="mx-auto grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[auto,1fr] md:gap-8 md:py-12">
//           {toc ?? <div className="hidden md:block" />}

//           <div>
//             <header className="mb-6 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 md:p-8">
//               <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-white dark:to-slate-300 md:text-4xl">
//                 {title}
//               </h1>
//               {subtitle ? (
//                 <p className="mt-2 text-slate-600 dark:text-slate-300">
//                   {subtitle}
//                 </p>
//               ) : null}
//               {lastUpdated ? (
//                 <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
//                   Dernière mise à jour : {lastUpdated}
//                 </p>
//               ) : null}
//             </header>

//             <div className="space-y-6 md:space-y-8">{children}</div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// components/legal/legal-page-shell.tsx
export default function LegalPageShell({
  title,
  subtitle,
  toc,
  children,
  lastUpdated,
}: {
  title: string;
  subtitle?: string;
  toc?: React.ReactNode;
  children: React.ReactNode;
  lastUpdated?: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-8%] top-[-8%] h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute right-[-5%] bottom-[-8%] h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-screen-xl">
        <main className="mx-auto grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[auto,1fr] md:gap-8 md:py-12">
          {toc ?? <div className="hidden md:block" />}

          <div>
            <header className="mb-6 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 md:p-8">
              <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-white dark:to-slate-300 md:text-4xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  {subtitle}
                </p>
              ) : null}
              {lastUpdated ? (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Dernière mise à jour : {lastUpdated}
                </p>
              ) : null}
            </header>

            <div className="space-y-6 md:space-y-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
