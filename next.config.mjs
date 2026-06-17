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
};

export default nextConfig;
