import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LiquidBackground } from "@/components/decor/liquid-background";
import { getActiveBrand, brandStyle } from "@/lib/branding";
import { activeDataSource } from "@/lib/data/repository";

/**
 * Portal shell. Carries the TENANT branding (color + logo via CSS variables),
 * the liquid-glass backdrop, header and footer. The login lives in (auth) and
 * deliberately does NOT inherit this chrome — it is 100% Arkode-branded.
 */
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = getActiveBrand();
  const dataSource = activeDataSource();

  return (
    <div
      id="top"
      style={brandStyle(brand)}
      className="relative flex min-h-screen flex-col"
    >
      <LiquidBackground />
      <SiteHeader brand={brand} />
      <main className="flex-1">{children}</main>
      <SiteFooter brand={brand} dataSource={dataSource} />
    </div>
  );
}
