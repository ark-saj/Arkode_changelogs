"use client";

import { usePathname } from "next/navigation";

import { PageTransition } from "@/components/motion/page-transition";

/* Arkode Mosaic — route enter transition for the tenant area. A Next.js
   template re-mounts on every navigation, so keying PageTransition by pathname
   gives each route (portal ↔ configuración) a fade + 8px slide entrance.
   Reduced-motion-safe via PageTransition. */
export default function TenantTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return <PageTransition transitionKey={pathname}>{children}</PageTransition>;
}
