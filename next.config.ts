import type { NextConfig } from "next";
import { isIndexable } from "./src/lib/site";
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;
const config: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/site-media/**",
          },
        ]
      : [],
  },
  async redirects() {
    return [
      { source: "/foxriverrecreation", destination: "/", permanent: true },
      { source: "/parkamenities", destination: "/#amenities", permanent: true },
      { source: "/memories", destination: "/#gallery", permanent: true },
      { source: "/7", destination: "/#visit", permanent: true },
      { source: "/events", destination: "/#happenings", permanent: true },
      { source: "/4523867/:path*", destination: "/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          ...(!isIndexable
            ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
            : []),
        ],
      },
    ];
  },
};
export default config;
