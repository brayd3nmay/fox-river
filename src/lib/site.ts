export const siteName = "Fox River Recreation";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const homeTitle = `${siteName} | Camping & Cabins in Antioch, IL`;
export const absoluteUrl = (path: string) => new URL(path, siteUrl).href;
// Read by the page metadata, robots.txt, and the X-Robots-Tag header.
export const isIndexable = process.env.SITE_INDEXABLE === "true";
