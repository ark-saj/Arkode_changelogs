import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ingresar · Arkode",
  description: "Accedé al Centro de Novedades de tu empresa.",
};

/**
 * Auth shell. Near-black canvas with a faint navy undertone — the dark stage on
 * which the frosted "glass window" login (and its chrome orbs) floats. The whole
 * composition lives in login/page.tsx; this just owns the background.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07090f] text-ark-bone">
      {/* ambient brand glows behind everything */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[40rem] w-[40rem] rounded-full bg-ark-coral/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-0 h-[40rem] w-[40rem] rounded-full bg-[#2165AF]/15 blur-[120px]"
      />
      {children}
    </div>
  );
}
