import { Hero } from "@/components/changelog/hero";
import { ChangelogExplorer } from "@/components/changelog/changelog-explorer";
import { getRepository } from "@/lib/data/repository";
import { getActiveBrand } from "@/lib/branding";

// Mock data is static; for a real Supabase backend you may switch this to
// `force-dynamic` or add revalidation.
export const dynamic = "force-static";

export default async function HomePage() {
  const brand = getActiveBrand();
  const data = await getRepository().getChangelog();

  return (
    <div className="container pb-10">
      <Hero brandName={brand.name} />
      <div className="mt-16 sm:mt-20">
        <ChangelogExplorer data={data} />
      </div>
    </div>
  );
}
