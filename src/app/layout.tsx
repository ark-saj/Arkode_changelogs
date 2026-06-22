import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";

// Geist = Arkode brand workhorse (display, headings, UI, body).
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
// Geist Mono = eyebrows / labels / codes / numeric metrics.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arkode · Centro de Novedades",
  description:
    "Mantente al día con las mejoras que se implementan para facilitar tu trabajo.",
  openGraph: {
    title: "Arkode · Centro de Novedades",
    description:
      "Mantente al día con las mejoras que se implementan para facilitar tu trabajo.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body className="bg-canvas font-sans text-ink antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
