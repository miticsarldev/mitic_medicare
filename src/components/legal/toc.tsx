"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = { id: string; label: string };
export default function LegalTOC({ items }: { items: Item[] }) {
  const [active, setActive] = useState<string>(items[0]?.id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 1] }
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items]);

  return (
    <aside className="sticky top-24 hidden h-fit max-h-[80vh] w-64 shrink-0 overflow-auto rounded-2xl border border-slate-200 bg-white/60 p-4 text-sm shadow-sm backdrop-blur md:block dark:border-slate-800 dark:bg-slate-900/60">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Sommaire
      </p>
      <nav className="space-y-1.5">
        {items.map((i) => {
          const isActive = active === i.id;
          return (
            <Link
              key={i.id}
              href={`#${i.id}`}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
                isActive
                  ? "bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isActive ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
              {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
