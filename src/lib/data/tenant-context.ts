import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseCredentials } from "@/lib/data/repository";
import { DEFAULT_BRAND_KEY, getBrand } from "@/lib/branding";

/** Branding + identity for the tenant whose portal is being rendered. */
export interface ResolvedTenant {
  slug: string;
  name: string;
  tagline: string;
  logo?: string;
  /** CSS variable overrides applied to the portal wrapper. */
  vars: Record<string, string>;
}

/**
 * Resolve a tenant (and its branding) by slug.
 * - Supabase mode: from the `tenants` table (RLS-readable).
 * - Mock mode: from the static brand themes in branding.ts.
 */
export async function resolveTenant(
  slug: string,
): Promise<ResolvedTenant | null> {
  if (!hasSupabaseCredentials()) {
    const brand = getBrand(slug);
    return {
      slug,
      name: brand.name,
      tagline: brand.tagline,
      logo: brand.logo,
      vars: brand.vars,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("tenants")
    .select("slug,name,tagline,logo,brand")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;

  const brand = data.brand as Record<string, string> | null;
  const vars = brand && Object.keys(brand).length ? brand : getBrand(slug).vars;
  return {
    slug: data.slug,
    name: data.name,
    tagline: data.tagline,
    logo: data.logo ?? undefined,
    vars,
  };
}

/** The slug of the tenant the logged-in user belongs to (first membership). */
export async function getUserTenantSlug(): Promise<string | null> {
  if (!hasSupabaseCredentials()) return DEFAULT_BRAND_KEY;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("tenant_users")
    .select("tenant_id")
    .limit(1)
    .maybeSingle();
  if (!membership) return null;

  const { data: tenant } = await supabase
    .from("tenants")
    .select("slug")
    .eq("id", membership.tenant_id)
    .maybeSingle();
  return tenant?.slug ?? null;
}

/** Is the logged-in user a member of the tenant identified by `slug`? */
export async function isMemberOf(slug: string): Promise<boolean> {
  if (!hasSupabaseCredentials()) return true;

  const supabase = await createSupabaseServerClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!tenant) return false;

  const { data: membership } = await supabase
    .from("tenant_users")
    .select("tenant_id")
    .eq("tenant_id", tenant.id)
    .maybeSingle();
  return Boolean(membership);
}

/** Is the logged-in user an ADMIN of the tenant identified by `slug`? */
export async function isTenantAdmin(slug: string): Promise<boolean> {
  if (!hasSupabaseCredentials()) return true; // mock: open

  const supabase = await createSupabaseServerClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!tenant) return false;

  const { data: membership } = await supabase
    .from("tenant_users")
    .select("role")
    .eq("tenant_id", tenant.id)
    .eq("role", "admin")
    .maybeSingle();
  return Boolean(membership);
}
