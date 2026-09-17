import { describe, expect, it } from "vitest";
import { contentSchema } from "../src/lib/content-schema";
import { defaultContent } from "../src/lib/default-content";
import { formatAddress } from "../src/lib/format";
import { structuredData } from "../src/lib/seo";

type Node = Record<string, unknown>;
function graph(content = defaultContent, path = "/", breadcrumb?: string) {
  return structuredData(content, {
    path,
    name: "Page",
    description: "Description",
    breadcrumb,
  })["@graph"] as Node[];
}
function node(type: string, nodes = graph()) {
  return nodes.find((entry) => entry["@type"] === type) as Node;
}

describe("structured data", () => {
  it("publishes the address in the parts Google matches a listing on", () => {
    expect(node("Campground").address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "27884 W. Route 173",
      addressLocality: "Antioch",
      addressRegion: "IL",
      postalCode: "60002",
      addressCountry: "US",
    });
    expect(formatAddress(defaultContent.contact.address)).toBe(
      "27884 W. Route 173, Antioch, IL 60002",
    );
  });

  it("omits coordinates until someone enters both", () => {
    expect(node("Campground").geo).toBeUndefined();
    const content = structuredClone(defaultContent);
    content.contact.geo.latitude = 42.4795;
    expect(contentSchema.safeParse(content).success).toBe(false);
    content.contact.geo.longitude = -88.0787;
    expect(contentSchema.safeParse(content).success).toBe(true);
    expect(node("Campground", graph(content)).geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: 42.4795,
      longitude: -88.0787,
    });
  });

  it("links the profiles that carry the campground's reviews", () => {
    const content = structuredClone(defaultContent);
    content.contact.googleProfileUrl = "https://maps.app.goo.gl/example";
    expect(node("Campground", graph(content)).sameAs).toEqual([
      "https://www.facebook.com/FoxRiverRecreation/",
      "https://maps.app.goo.gl/example",
    ]);
    // A profile that has not been set yet leaves no empty entry behind.
    expect(node("Campground").sameAs).toEqual([
      "https://www.facebook.com/FoxRiverRecreation/",
    ]);
    content.contact.googleProfileUrl = "maps.app.goo.gl/example";
    expect(contentSchema.safeParse(content).success).toBe(false);
  });

  it("derives the price range and amenities from the published content", () => {
    const business = node("Campground");
    expect(business.priceRange).toMatch(/^\$\d+(\.\d+)?-\$\d+(\.\d+)?$/);
    expect(business.amenityFeature).toHaveLength(
      defaultContent.amenities.length,
    );
    expect(business.knowsLanguage).toContain("Russian");
  });

  it("uses absolute URLs and one identity across every page", () => {
    const home = graph();
    const rates = graph(defaultContent, "/rates", "Rates");
    expect(node("Campground", home)["@id"]).toBe(
      node("Campground", rates)["@id"],
    );
    for (const image of node("Campground").image as string[])
      expect(image).toMatch(/^https?:\/\//);
    expect(node("WebSite").publisher).toEqual({
      "@id": node("Campground")["@id"],
    });
    expect(node("WebPage", home).breadcrumb).toBeUndefined();
    expect(node("BreadcrumbList", home)).toBeUndefined();
    expect(node("BreadcrumbList", rates).itemListElement).toHaveLength(2);
    expect(node("WebPage", rates).breadcrumb).toEqual({
      "@id": node("BreadcrumbList", rates)["@id"],
    });
  });
});
