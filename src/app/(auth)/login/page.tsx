"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock, Mail, TriangleAlert } from "lucide-react";

import { MDiv } from "@/components/motion/motion-safe";
import { scaleIn } from "@/components/motion/variants";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const HAS_SUPABASE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/**
 * Arkode-branded login, Mosaic system: warm light canvas, Arkode wordmark, a
 * single opaque Mosaic card form with one coral accent. Geist + Geist Mono.
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
      <MDiv
        className="w-full max-w-md"
        variants={scaleIn}
        initial="hidden"
        animate="visible"
      >
        {/* brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/brand/arkode-complete.png"
            alt="Arkode"
            width={150}
            height={20}
            priority
            className="h-[22px] w-auto"
          />
          <span className="mt-5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-mute">
            Centro de Novedades
          </span>
        </div>

        {/* the Mosaic card form */}
        <div className="card p-8 sm:p-10">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Ingresá a tu portal
          </h1>
          <p className="mt-2 text-sm text-mute">
            Las mejoras que implementamos para tu empresa, en un solo lugar.
          </p>
          <div className="mt-5 h-px w-14 bg-coral" />

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
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
                className="text-sm text-mute transition hover:text-coral-deep"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-md9 border border-crimson/40 bg-crimson/10 px-3 py-2 text-sm text-ink">
                <TriangleAlert className="h-4 w-4 shrink-0 text-crimson" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-coral group h-12 w-full disabled:opacity-70"
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

          <p className="mt-6 text-xs leading-relaxed text-faint">
            Demo:{" "}
            <span className="font-mono text-mute">admin@conecta.test</span> /{" "}
            <span className="font-mono text-mute">demo12345</span>. Cada usuario
            entra solo al portal de su empresa.
          </p>
        </div>
      </MDiv>
    </main>
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
        className="mb-1.5 block text-sm font-medium text-ink-soft"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute">
          {icon}
        </span>
        <input
          id={id}
          name={id}
          required
          className="h-12 w-full rounded-md9 border border-line-2 bg-canvas pl-10 pr-4 text-sm text-ink outline-none transition-shadow placeholder:text-faint focus-visible:border-coral focus-visible:shadow-[0_0_0_3px_rgba(255,108,93,0.14)]"
          {...props}
        />
      </div>
    </div>
  );
}
