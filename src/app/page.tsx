import { redirect } from "next/navigation";

import { hasSupabaseCredentials } from "@/lib/data/repository";
import { getUserTenantSlug } from "@/lib/data/tenant-context";
import { DEFAULT_BRAND_KEY } from "@/lib/branding";

export const dynamic = "force-dynamic";

/**
 * Entry point. Routes the visitor to the right place:
 *  - mock/demo mode → the default tenant portal (no login).
 *  - logged in       → their tenant's portal.
 *  - logged out      → the Arkode login.
 */
export default async function RootPage() {
  if (!hasSupabaseCredentials()) {
    redirect(`/${DEFAULT_BRAND_KEY}`);
  }

  const slug = await getUserTenantSlug();
  redirect(slug ? `/${slug}` : "/login");
}
