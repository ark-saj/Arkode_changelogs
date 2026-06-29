// Origins allowed to embed the public changelog view in an iframe (Fase 4).
// Set ODOO_EMBED_ORIGIN to your Odoo origin, e.g. "https://erp.cliente.com".
const EMBED_ORIGIN = process.env.ODOO_EMBED_ORIGIN ?? "";
const FRAME_ANCESTORS = ["'self'", EMBED_ORIGIN].filter(Boolean).join(" ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tenant logos + screenshots are served from Supabase Storage.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      // Local Supabase (dev).
      { protocol: "http", hostname: "127.0.0.1", port: "54321" },
      { protocol: "http", hostname: "localhost", port: "54321" },
    ],
  },
  async headers() {
    // Allow ONLY the configured Odoo origin (and self) to frame the embed view.
    // Everything else keeps the default (no framing).
    return [
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${FRAME_ANCESTORS};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
