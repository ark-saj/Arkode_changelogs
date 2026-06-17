import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { LogoUploader } from "@/components/changelog/logo-uploader";
import { hasSupabaseCredentials } from "@/lib/data/repository";
import { isTenantAdmin, resolveTenant } from "@/lib/data/tenant-context";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;

  const tenant = await resolveTenant(slug);
  if (!tenant) notFound();

  // Members can't configure the company — only admins.
  if (hasSupabaseCredentials() && !(await isTenantAdmin(slug))) {
    redirect(`/${slug}`);
  }

  return (
    <div className="container max-w-2xl py-12 sm:py-16">
      <a
        href={`/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al portal
      </a>

      <header className="mb-8 mt-4">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Configuración
        </h1>
        <p className="mt-1 text-muted-foreground">
          Personalizá la marca de {tenant.name}.
        </p>
      </header>

      <section aria-labelledby="logo-title" className="space-y-4">
        <div>
          <h2 id="logo-title" className="font-display text-lg font-semibold">
            Logo de la empresa
          </h2>
          <p className="text-sm text-muted-foreground">
            Reemplazá el ícono por el logo de tu empresa. Lo verán todos los
            colaboradores en su portal.
          </p>
        </div>
        <LogoUploader
          tenantSlug={slug}
          tenantName={tenant.name}
          currentLogo={tenant.logo}
        />
      </section>
    </div>
  );
}
