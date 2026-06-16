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
    vars: {
      "--brand": "221 83% 60%",
      "--brand-soft": "199 89% 60%",
      "--brand-foreground": "0 0% 100%",
      "--blob-1": "221 83% 60%",
      "--blob-2": "199 89% 60%",
      "--blob-3": "262 83% 66%",
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
