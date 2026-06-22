import type { CSSProperties } from "react";

/**
 * Tenant identity.
 *
 * Mosaic is one fixed palette: every client portal uses the same Arkode coral.
 * Only NAME, TAGLINE and LOGO vary per client — color never does. There is no
 * per-tenant CSS variable injection anymore.
 *
 * `vars` is retained as an always-empty map so the frozen tenant resolver
 * (src/lib/data/tenant-context.ts) keeps compiling; it carries no colors.
 */
export interface BrandTheme {
  key: string;
  /** Company display name shown in the header. */
  name: string;
  /** Short tagline shown under the name. */
  tagline: string;
  /** Optional logo shown in the header instead of the name. Path under /public. */
  logo?: string;
  /** Retained for the frozen tenant resolver. Always empty: no color theming. */
  vars: Record<string, string>;
}

export const BRAND_THEMES: Record<string, BrandTheme> = {
  conecta: {
    key: "conecta",
    name: "Conec-ta",
    tagline: "Centro de Novedades",
    vars: {},
  },
  arkode: {
    key: "arkode",
    name: "Arkode",
    tagline: "Centro de Novedades",
    logo: "/brand/arkode-white.png",
    vars: {},
  },
  emerald: {
    key: "emerald",
    name: "Verdana",
    tagline: "Centro de Novedades",
    vars: {},
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

/** No-op: Mosaic has no per-tenant color injection. Kept so callers don't break. */
export function brandStyle(_theme: BrandTheme): CSSProperties {
  return {};
}
