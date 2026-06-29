import { notFound } from "next/navigation";

import { ChangelogPortal } from "@/components/portal/changelog-portal";
import { readChangelogData } from "@/lib/data/changelog-read";
import { verifyEmbedToken } from "@/lib/auth/embed-token";
import { getServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

/**
 * Public, read-only embed of a tenant's changelog (Fase 4 — Odoo PoC).
 *
 * Lives OUTSIDE the guarded `[tenant]` layout: there is no Supabase session
 * here. Authorization is the signed embed token in the URL, which names exactly
 * one tenant. Data is read via the service client scoped to that tenant.
 *
 * Renders the SAME portal shell as `/[tenant]` (sidebar, dark mode, search,
 * timeline…) so the embed matches the real portal — minus the session-only bits
 * (no logout, no Configuración link), which simply aren't passed.
 */
export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { tenant: slug } = await params;
  const { token } = await searchParams;

  // The token must be valid AND name this exact tenant.
  if (verifyEmbedToken(token) !== slug) notFound();

  const data = await readChangelogData(getServiceClient(), slug);
  if (!data.tenant) notFound();

  return (
    <ChangelogPortal
      data={data}
      tenant={data.tenant.name}
      brandLogo={data.tenant.logo ?? undefined}
      isAdmin={false}
      dataSource="supabase"
      showLogout={false}
    />
  );
}
