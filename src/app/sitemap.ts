import type { MetadataRoute } from "next";
import { getPublishedAt } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = await getPublishedAt();
  return ["/", "/rates", "/rules", "/privacy"].map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
