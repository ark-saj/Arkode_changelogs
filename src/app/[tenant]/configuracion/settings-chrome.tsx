"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { TopBar } from "@/components/portal/top-bar";

/* Client chrome for the settings page: mounts the shared portal <TopBar> with
   no in-page sections (settings is a single view). The ⌘K trigger and the
   hamburger both return the admin to their portal, where search and the
   sidebar live. Keeps the settings page itself a server component. */
export function SettingsChrome({
  brandName,
  brandLogo,
  portalHref,
  showLogout,
}: {
  brandName: string;
  brandLogo?: string;
  portalHref: string;
  showLogout?: boolean;
}) {
  const router = useRouter();
  const toPortal = React.useCallback(() => {
    router.push(portalHref);
  }, [router, portalHref]);

  return (
    <TopBar
      brandName={brandName}
      brandLogo={brandLogo}
      sections={[]}
      activeSection={null}
      onJump={toPortal}
      onOpenPalette={toPortal}
      onToggleSidebar={toPortal}
      showLogout={showLogout}
    />
  );
}
