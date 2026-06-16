/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mock-first: no external images required. When you wire real screenshots
  // (e.g. Supabase Storage), add the host here.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
