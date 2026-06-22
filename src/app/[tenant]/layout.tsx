import { notFound, redirect } from "next/navigation";

import { hasSupabaseCredentials } from "@/lib/data/repository";
import {
  getUserTenantSlug,
  isMemberOf,
  resolveTenant,
} from "@/lib/data/tenant-context";

/**
 * Tenant shell. Keeps ONLY the auth/membership guard: a user can only open
 * their own tenant's portal. The portal (rendered by the page) owns its own
 * chrome (top bar, sidebar, footer), so this layout is just the guard + a
 * canvas wrapper. The Mosaic palette is fixed — no per-tenant color injection.
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

  return (
    <div id="top" className="min-h-screen bg-canvas">
      {children}
    </div>
  );
}
