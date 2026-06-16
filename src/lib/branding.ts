import type { CSSProperties } from "react";

/**
 * Dynamic branding.
 *
 * Each theme is just a set of CSS custom properties. We inject them as an inline
 * style on a wrapper element, which repaints the entire app (cards, glows,
 * gradients, decorative blobs) without touching a single component. Add a new
 * company by adding an entry here.
 */
export interface BrandTheme {
  key: string;
  /** Company display name shown in the header. */
  name: string;
  /** Short tagline shown under the name. */
  tagline: string;
  /** Optional logo shown in the header instead of the name (Fase 0). Path under /public. */
  logo?: string;
  /** HSL triples (no `hsl()` wrapper) mapped to CSS variables. */
  vars: Record<string, string>;
}

export const BRAND_THEMES: Record<string, BrandTheme> = {
  conecta: {
    key: "conecta",
    name: "Conec-ta",
    tagline: "Centro de Novedades",
    vars: {
      "--brand": "24 94% 53%",
      "--brand-soft": "32 95% 62%",
      "--brand-foreground": "0 0% 100%",
      "--blob-1": "24 94% 53%",
      "--blob-2": "32 95% 62%",
      "--blob-3": "14 90% 58%",
    },
  },
  arkode: {
    key: "arkode",
    name: "Arkode",
    tagline: "Centro de Novedades",
    logo: "/brand/arkode-white.png",
    vars: {
      // Real Arkode palette: coral accent (#FF6C5D) over deep navy.
      "--brand": "6 100% 68%",
      "--brand-soft": "12 100% 73%",
      "--brand-foreground": "36 50% 93%",
      "--blob-1": "6 100% 68%",
      "--blob-2": "12 100% 73%",
      "--blob-3": "215 70% 40%",
    },
  },
  emerald: {
    key: "emerald",
    name: "Verdana",
    tagline: "Centro de Novedades",
    vars: {
      "--brand": "160 84% 39%",
      "--brand-soft": "152 76% 50%",
      "--brand-foreground": "0 0% 100%",
      "--blob-1": "160 84% 39%",
      "--blob-2": "172 66% 50%",
      "--blob-3": "142 71% 45%",
    },
  },
};

export const DEFAULT_BRAND_KEY = "conecta";

export function getBrand(key?: string): BrandTheme {
  if (key && BRAND_THEMES[key]) return BRAND_THEMES[key];
  return BRAND_THEMES[DEFAULT_BRAND_KEY];
}

/** Resolve the active brand from the env (server + client safe). */
export function getActiveBrand(): BrandTheme {
  return getBrand(process.env.NEXT_PUBLIC_BRAND);
}

/** Turn a brand theme into an inline style object of CSS custom properties. */
export function brandStyle(theme: BrandTheme): CSSProperties {
  return theme.vars as CSSProperties;
}
