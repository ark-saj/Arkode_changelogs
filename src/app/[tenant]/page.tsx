import { ChangelogPortal } from "@/components/portal/changelog-portal";
import {
  activeDataSource,
  getRepository,
  hasSupabaseCredentials,
} from "@/lib/data/repository";
import { isTenantAdmin, resolveTenant } from "@/lib/data/tenant-context";

// Per-tenant, session-scoped: always rendered dynamically.
export const dynamic = "force-dynamic";

export default async function TenantPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const data = await getRepository().getChangelog(slug);
  const tenant = data.tenant ?? (await resolveTenant(slug));
  const isAdmin = await isTenantAdmin(slug);

  return (
    <ChangelogPortal
      data={data}
      tenant={tenant?.name ?? slug}
      brandLogo={tenant?.logo}
      isAdmin={isAdmin}
      dataSource={activeDataSource()}
      showLogout={hasSupabaseCredentials()}
      settingsHref={isAdmin ? `/${slug}/configuracion` : undefined}
    />
  );
}
