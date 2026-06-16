import { Hero } from "@/components/changelog/hero";
import { ChangelogExplorer } from "@/components/changelog/changelog-explorer";
import { getRepository } from "@/lib/data/repository";
import { resolveTenant } from "@/lib/data/tenant-context";

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

  return (
    <div className="container pb-10">
      <Hero brandName={tenant?.name ?? slug} />
      <div className="mt-16 sm:mt-20">
        <ChangelogExplorer data={data} />
      </div>
    </div>
  );
}
