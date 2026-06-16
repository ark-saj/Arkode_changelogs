import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Newsreader } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";

// Geist = Arkode brand workhorse (display, headings, UI).
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
// Geist Mono = badges / codes / numeric labels.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
// Inter = kept on purpose for changelog DESCRIPTIONS (clean, high legibility).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Newsreader italic = Arkode editorial accent.
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["italic", "normal"],
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
  themeColor: "#001C43",
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
      className={`${geist.variable} ${geistMono.variable} ${inter.variable} ${newsreader.variable}`}
    >
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
