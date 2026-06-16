import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LiquidBackground } from "@/components/decor/liquid-background";
import { getActiveBrand, brandStyle } from "@/lib/branding";
import { activeDataSource } from "@/lib/data/repository";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const brand = getActiveBrand();

export const metadata: Metadata = {
  title: `${brand.name} · Novedades del Sistema`,
  description:
    "Mantente al día con las mejoras que se implementan para facilitar tu trabajo.",
  openGraph: {
    title: `${brand.name} · Novedades del Sistema`,
    description:
      "Mantente al día con las mejoras que se implementan para facilitar tu trabajo.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dataSource = activeDataSource();

  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
