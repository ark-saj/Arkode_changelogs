import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { LogoUploader } from "@/components/changelog/logo-uploader";
import {
  ScreenshotUploader,
  type TicketOption,
} from "@/components/changelog/screenshot-uploader";
import { Eyebrow } from "@/components/mosaic/eyebrow";
import { getRepository, hasSupabaseCredentials } from "@/lib/data/repository";
import { isTenantAdmin, resolveTenant } from "@/lib/data/tenant-context";
import { SettingsChrome } from "./settings-chrome";

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

  // Tickets for the screenshot picker (Supabase mode only; RLS scopes them).
  let tickets: TicketOption[] = [];
  if (hasSupabaseCredentials()) {
    const data = await getRepository().getChangelog(slug);
    tickets = data.entries.flatMap((entry) =>
      entry.tickets.map((t) => ({ code: t.code, title: t.title })),
    );
  }

  return (
    <>
      <SettingsChrome
        brandName={tenant.name}
        brandLogo={tenant.logo}
        portalHref={`/${slug}`}
        showLogout={hasSupabaseCredentials()}
      />
      <div className="container max-w-2xl pb-24 pt-[88px] sm:pt-24">
        <a
          href={`/${slug}`}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-mute transition hover:text-coral-deep"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al portal
        </a>

      <header className="mb-10 mt-6">
        <Eyebrow num="00">Configuración</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          Marca de la empresa
        </h1>
        <p className="mt-2 text-mute">
          Personalizá la marca de {tenant.name}.
        </p>
      </header>

      <section aria-labelledby="logo-title" className="space-y-5">
        <div className="sub-h" id="logo-title">
          Logo de la empresa
        </div>
        <p className="text-sm text-mute">
          Reemplazá el ícono por el logo de tu empresa. Lo verán todos los
          colaboradores en su portal.
        </p>
        <LogoUploader
          tenantSlug={slug}
          tenantName={tenant.name}
          currentLogo={tenant.logo}
        />
      </section>

      {hasSupabaseCredentials() && (
        <section aria-labelledby="shots-title" className="mt-12 space-y-5">
          <div className="sub-h" id="shots-title">
            Capturas de los cambios
          </div>
          <p className="text-sm text-mute">
            Sumá una imagen o un video real a cualquier cambio. Aparece en su
            tarjeta dentro del portal.
          </p>
          <ScreenshotUploader tenantSlug={slug} tickets={tickets} />
        </section>
      )}
      </div>
    </>
  );
}
