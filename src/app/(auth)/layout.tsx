import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ingresar · Arkode",
  description: "Accedé al Centro de Novedades de tu empresa.",
};

/**
 * Auth shell. Light Mosaic canvas — the same warm background as the portal.
 * The whole composition lives in login/page.tsx; this just owns the background.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-ink">
      {children}
    </div>
  );
}
