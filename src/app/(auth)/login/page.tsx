"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Lock, Mail, TriangleAlert } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const HAS_SUPABASE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/**
 * Arkode-branded login: a frosted "browser window" over chrome orbs, adapted to
 * the Arkode brand (near-black navy, one coral accent, Geist + Newsreader).
 *
 * Authenticates against Supabase Auth — the session carries the tenant
 * membership RLS uses, and the user lands on their own tenant portal.
 */
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Demo mode (no Supabase configured): skip auth, go to the default portal.
    if (!HAS_SUPABASE) {
      router.push("/");
      return;
    }

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }
    // Session cookie set → root routes to the user's tenant.
    router.push("/");
    router.refresh();
  }

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-5xl">
        {/* ---- Chrome orbs BEHIND the panel (frosted through the glass) ---- */}
        <ChromeOrb className="absolute -top-24 right-16 h-72 w-72 animate-float-slow" />
        <ChromeRing className="absolute -bottom-28 left-6 h-72 w-72 animate-float" />
        <ChromeOrb className="absolute top-1/3 -left-20 h-44 w-44" />

        {/* ---- The frosted browser-window panel ---- */}
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.055] shadow-[0_40px_120px_-25px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
        >
          {/* top highlight line — sells the glass */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* window chrome bar */}
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <span className="h-3 w-3 rounded-full bg-ark-coral/90" />
            <span className="h-3 w-3 rounded-full bg-ark-bone/60" />
            <span className="h-3 w-3 rounded-full bg-white/25" />
            <span className="mx-auto -translate-x-6 font-mono text-xs tracking-wide text-white/40">
              novedades.arkode.io
            </span>
          </div>

          {/* body — editorial left, form right */}
          <div className="grid gap-10 p-8 sm:p-12 md:grid-cols-[1.05fr_1fr] md:gap-14">
            {/* left: brand / editorial */}
            <div className="flex flex-col justify-center">
              <Image
                src="/brand/arkode-white.png"
                alt="Arkode"
                width={150}
                height={18}
                priority
                className="h-5 w-auto"
              />
              <p className="mt-8 font-editorial text-xl italic text-ark-bone/70">
                Bienvenido
              </p>
              <h1 className="mt-1 font-display text-5xl font-semibold leading-[1.04] tracking-tight">
                <span className="text-white/35">Centro de</span>
                <br />
                <span className="text-white">Novedades.</span>
              </h1>
              <p className="mt-5 max-w-xs font-description text-sm leading-relaxed text-ark-bone/55">
                Las mejoras que implementamos para tu empresa, en un solo lugar.
                Claras, visuales, al día.
              </p>
            </div>

            {/* right: login form */}
            <div className="flex flex-col justify-center">
              <h2 className="font-display text-xl font-semibold tracking-tight text-white">
                Ingresá a tu portal
              </h2>
              <div className="mt-4 h-px w-14 bg-ark-coral" />

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <Field
                  id="email"
                  type="email"
                  label="Correo"
                  placeholder="vos@empresa.com"
                  icon={<Mail className="h-4 w-4" />}
                  autoComplete="email"
                />
                <Field
                  id="password"
                  type="password"
                  label="Contraseña"
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  autoComplete="current-password"
                />

                <div className="flex justify-end">
                  <a
                    href="#"
                    className="text-sm text-ark-bone/55 transition hover:text-ark-coral"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {error && (
                  <p className="flex items-center gap-2 rounded-xl border border-ark-coral/40 bg-ark-coral/10 px-3 py-2 text-sm text-ark-bone">
                    <TriangleAlert className="h-4 w-4 shrink-0 text-ark-coral" />
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ark-coral font-medium text-ark-bone transition hover:opacity-90 active:scale-[0.99] disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Ingresar
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-xs leading-relaxed text-ark-bone/40">
                Demo:{" "}
                <span className="font-mono text-ark-bone/60">
                  admin@conecta.test
                </span>{" "}
                /{" "}
                <span className="font-mono text-ark-bone/60">demo12345</span>.
                Cada usuario entra solo al portal de su empresa.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ---- Chrome orbs IN FRONT — sitting on the panel edges (sharp) ---- */}
        <ChromeOrb className="absolute top-[44%] -right-10 z-30 h-28 w-28" />
        <ChromeOrb className="absolute -bottom-7 right-1/3 z-30 h-16 w-16" />
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative chrome elements (CSS-only metallic look + coral kiss)   */
/* ------------------------------------------------------------------ */
const ORB_BG = [
  // bright top-left highlight
  "radial-gradient(115% 115% at 32% 26%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 33%)",
  // coral reflection (the Arkode accent)
  "radial-gradient(80% 80% at 72% 80%, rgba(255,108,93,0.5) 0%, rgba(255,108,93,0) 55%)",
  // metal body
  "radial-gradient(120% 120% at 50% 42%, #dfe4ec 0%, #9097a8 40%, #2b3140 78%, #0f131b 100%)",
].join(",");

function ChromeOrb({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        borderRadius: "9999px",
        background: ORB_BG,
        boxShadow:
          "inset 0 3px 10px rgba(255,255,255,0.45), inset 0 -8px 18px rgba(0,0,0,0.5), 0 30px 60px -20px rgba(0,0,0,0.75)",
      }}
    />
  );
}

function ChromeRing({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        borderRadius: "9999px",
        background:
          "conic-gradient(from 210deg, #eef1f6, #767d8e, #d4d9e2, #3b4250, #b7bdca, #2b3140, #eef1f6)",
        WebkitMaskImage:
          "radial-gradient(closest-side, transparent 55%, #000 57%)",
        maskImage: "radial-gradient(closest-side, transparent 55%, #000 57%)",
        boxShadow: "0 30px 70px -20px rgba(0,0,0,0.7)",
      }}
    />
  );
}

function Field({
  id,
  label,
  icon,
  ...props
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-ark-bone/80"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ark-bone/50">
          {icon}
        </span>
        <input
          id={id}
          name={id}
          required
          className="h-12 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-ark-bone/35 focus:border-ark-coral/70 focus:ring-2 focus:ring-ark-coral/25"
          {...props}
        />
      </div>
    </div>
  );
}
