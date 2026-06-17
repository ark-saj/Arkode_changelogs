import type { CSSProperties } from "react";
import { notFound, redirect } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LiquidBackground } from "@/components/decor/liquid-background";
import { activeDataSource, hasSupabaseCredentials } from "@/lib/data/repository";
import {
  getUserTenantSlug,
  isMemberOf,
  isTenantAdmin,
  resolveTenant,
} from "@/lib/data/tenant-context";

/**
 * Portal shell for a single tenant. Branding (colors, logo, name) is resolved
 * from the tenant — no more NEXT_PUBLIC_BRAND. Membership is enforced server-side:
 * a user can only open their own tenant's portal.
 */
export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;

  const tenant = await resolveTenant(slug);
  if (!tenant) notFound();

  // Auth guard (Supabase mode). Middleware already ensured a session exists;
  // here we ensure the session belongs to THIS tenant.
  if (hasSupabaseCredentials()) {
    const member = await isMemberOf(slug);
    if (!member) {
      const own = await getUserTenantSlug();
      redirect(own ? `/${own}` : "/login");
    }
  }

  // Admins get the settings link (edit company logo, etc.).
  const isAdmin = await isTenantAdmin(slug);

  return (
    <div
      id="top"
      style={tenant.vars as CSSProperties}
      className="relative flex min-h-screen flex-col"
    >
      <LiquidBackground />
      <SiteHeader
        brand={tenant}
        showLogout={hasSupabaseCredentials()}
        settingsHref={isAdmin ? `/${slug}/configuracion` : undefined}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter brand={tenant} dataSource={activeDataSource()} />
    </div>
  );
}
