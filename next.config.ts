import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // API responses are either user-specific, payment-related or computed
        // on demand. Never let a browser or intermediary reuse them.
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0, must-revalidate",
          },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        // The account area loads personal data after authentication. Keeping
        // its shell out of shared caches prevents future server-rendered
        // account data from being cached accidentally.
        source: "/perfil/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0, must-revalidate",
          },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/restablecer-contrasena",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0, must-revalidate",
          },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        // These generated public resources change only on deploy. Browsers
        // revalidate frequently while Vercel may serve them from its CDN.
        source: "/:asset(robots.txt|sitemap.xml|opengraph-image)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600" },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
