"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Home, Mail, Sparkles, Compass, Search } from "lucide-react";

import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";

export default function NotFoundPage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="relative min-h-screen overflow-hidden">
        {/* Navbar slot (uncomment if you want your existing navbar) */}
        <div className="max-w-7xl mx-auto relative">
          <Navbar />
        </div>

        {/* Animated layers */}
        <Starfield className="pointer-events-none absolute inset-0 z-0" />
        <FloatingBlobs />

        {/* Content */}
        <main className="relative z-10">
          <section className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 md:pt-12 lg:pt-16 lg:pb-28">
            {/* Breadcrumb / hint */}
            <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground/70">
              <Sparkles className="h-4 w-4" />
              <span>Oops — la page demandée n’existe pas (erreur 404)</span>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
              {/* LEFT: Glitchy “404” + text + actions */}
              <div>
                <Glitch404 />

                <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-600 dark:text-slate-300">
                  On dirait que vous avez pris un détour cosmique. Pas de
                  panique — revenez à l’accueil, explorez la plateforme, ou
                  contactez-nous.
                </p>

                {/* Quick search (cosmetic) */}
                <div className="mt-6 max-w-lg">
                  <div className="group relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-500" />
                    <input
                      placeholder="Rechercher un médecin, hôpital, spécialité…"
                      className="w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-3 py-3 text-sm shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-200/50 dark:border-slate-700 dark:bg-slate-900/80 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Astuce : utilisez la barre de navigation pour retrouver
                    votre chemin.
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                  >
                    <Home className="h-4 w-4" />
                    Retour à l’accueil
                  </Link>

                  <Link
                    href="mailto:contact@miticsarlml.com"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/60 px-4 py-2 text-sm font-medium backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-900"
                  >
                    <Mail className="h-4 w-4" />
                    Contacter le support
                  </Link>
                </div>

                {/* Secondary links */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <Link
                    href="/legal/conditions-utilisation"
                    className="hover:underline"
                  >
                    Conditions d’utilisation
                  </Link>
                  <span aria-hidden>•</span>
                  <Link
                    href="/legal/politique-confidentialite"
                    className="hover:underline"
                  >
                    Politique de confidentialité
                  </Link>
                </div>
              </div>

              {/* RIGHT: 3D Tilt card with logo */}
              <TiltCard>
                <div className="relative z-10 flex flex-col items-center justify-center p-8">
                  <div className="relative">
                    {/* Glow behind logo */}
                    <div className="absolute inset-0 blur-2xl rounded-full bg-blue-500/30 dark:bg-blue-400/20" />
                    <Image
                      src="/logos/logo_mitic_dark.png"
                      alt="MITICCARE"
                      width={120}
                      height={120}
                      className="relative h-24 w-auto object-cover"
                      priority
                      unoptimized
                    />
                  </div>
                  <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
                    Votre santé, notre priorité — même quand vous êtes perdu
                    dans la galaxie.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 dark:border-slate-700">
                    <Compass className="h-3.5 w-3.5" />
                    <span>Navigation intelligente</span>
                  </div>
                </div>

                {/* Shimmer border */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl [mask-image:linear-gradient(transparent,black,transparent)]">
                  <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 opacity-60 blur-sm" />
                </div>
              </TiltCard>
            </div>
          </section>
        </main>

        {/* Bottom gradient flare */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[-12rem] h-[24rem] bg-gradient-radial from-blue-400/30 via-purple-400/10 to-transparent blur-3xl dark:from-blue-600/20 dark:via-purple-700/10" />
      </div>
    </ThemeProvider>
  );
}

function Glitch404() {
  const layers = [0, 1, 2];
  const jitter = {
    x: [0, 0.8, -0.6, 0.5, 0],
    y: [0, -0.4, 0.6, -0.5, 0],
    transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
  };

  return (
    <div className="relative">
      <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-slate-600 bg-white/70 backdrop-blur dark:text-slate-300 dark:bg-slate-900/70 dark:border-slate-700">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Erreur 404</span>
      </div>

      <div className="relative mt-4">
        {layers.map((i) => (
          <motion.h2
            key={i}
            aria-hidden={i !== 0}
            className={`select-none text-[64px] leading-[0.9] font-extrabold tracking-tight sm:text-[88px] md:text-[110px] lg:text-[130px]
              ${i === 0 ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-cyan-500 to-indigo-600 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400" : "text-blue-500/20 dark:text-blue-400/20"} 
              ${i !== 0 ? "absolute inset-0 blur-[1px]" : ""}`}
            style={{
              textShadow:
                i === 0 ? "0 2px 24px rgba(59,130,246,0.35)" : undefined,
            }}
            animate={
              i === 0
                ? jitter
                : {
                    x: [0, i === 1 ? 2 : -2, 0],
                    y: [0, i === 1 ? -1 : 1, 0],
                    transition: {
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "linear",
                    },
                  }
            }
          >
            404
          </motion.h2>
        ))}
        <p className="mt-3 text-2xl font-semibold">Page introuvable</p>
      </div>
    </div>
  );
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [10, -10]);
  const rotateY = useTransform(x, [0, 1], [-10, 10]);
  const translateZ = useTransform(x, [0, 1], [10, 10]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const onMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, translateZ }}
      className="relative h-full w-full"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70">
        {/* subtle noise overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,.35)_3px,transparent_4px)]" />
        {children}
      </div>
    </motion.div>
  );
}

function FloatingBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      {/* soft lights */}
      <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-blue-400/25 blur-3xl dark:bg-blue-600/20" />
      <div className="absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-600/20" />

      {/* gooey blobs (svg filter) */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="18"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
        <g filter="url(#goo)">
          <motion.circle
            cx="20%"
            cy="30%"
            r="110"
            fill="url(#grad1)"
            animate={{
              cx: ["18%", "22%", "19%", "20%"],
              cy: ["28%", "32%", "31%", "30%"],
            }}
            transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.circle
            cx="75%"
            cy="25%"
            r="130"
            fill="url(#grad2)"
            animate={{
              cx: ["73%", "77%", "74%", "75%"],
              cy: ["23%", "28%", "24%", "25%"],
            }}
            transition={{ duration: 11, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.circle
            cx="60%"
            cy="70%"
            r="160"
            fill="url(#grad3)"
            animate={{
              cx: ["58%", "62%", "59%", "60%"],
              cy: ["68%", "72%", "70%", "70%"],
            }}
            transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
          />
          <defs>
            <radialGradient id="grad1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="grad2">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="grad3">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </radialGradient>
          </defs>
        </g>
      </svg>
    </div>
  );
}

function Starfield({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const device = Math.min(window.devicePixelRatio || 1, 2);
    setDpr(device);

    let raf = 0;
    let W = 0;
    let H = 0;
    const stars: { x: number; y: number; z: number; s: number }[] = [];
    const STAR_COUNT = 180;
    const motion = { x: 0, y: 0 };

    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.floor(W * device);
      canvas.height = Math.floor(H * device);
      ctx.setTransform(device, 0, 0, device, 0, 0);
    };

    const init = () => {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          z: Math.random() * 0.8 + 0.2,
          s: Math.random() * 1.2 + 0.2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      const grd = ctx.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        Math.max(W, H) / 1.2
      );
      grd.addColorStop(0, "rgba(0,0,0,0)");
      grd.addColorStop(1, "rgba(2,6,23,0.12)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      for (const star of stars) {
        star.x += (motion.x * star.z) / 12;
        star.y += (motion.y * star.z) / 12;

        if (star.x < 0) star.x = W;
        if (star.x > W) star.x = 0;
        if (star.y < 0) star.y = H;
        if (star.y > H) star.y = 0;

        ctx.globalAlpha = 0.4 + star.z * 0.6;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      motion.x = (e.clientX - cx) / (rect.width / 2);
      motion.y = (e.clientY - cy) / (rect.height / 2);
    };

    const onLeave = () => {
      motion.x = 0;
      motion.y = 0;
    };

    resize();
    init();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [dpr]);

  return <canvas ref={canvasRef} className={className} />;
}
