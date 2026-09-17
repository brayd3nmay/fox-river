import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexable } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: isIndexable
      ? { userAgent: "*", allow: "/", disallow: ["/admin", "/auth"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
