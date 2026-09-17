import type { SiteContent } from "./content-schema";
import { allRates, mapsHref, phoneE164 } from "./format";
import { absoluteUrl, siteName, siteUrl } from "./site";

export const siteDescription =
  "Find your place by the river. Family-owned RV camping, cabin rentals, boating, and seasonal stays in Antioch, Illinois, with access to the Chain O'Lakes.";

const businessId = `${siteUrl}/#campground`;
const websiteId = `${siteUrl}/#website`;

/**
 * Nightly rates only. A season-long site next to a day-visitor fee produces a
 * range too wide to tell a searcher anything.
 */
const nightlyUnit = /night/i;
function priceRange(content: SiteContent) {
  const amounts = allRates(content)
    .filter((rate) => nightlyUnit.test(rate.unit))
    .map((rate) => rate.amount)
    .filter((amount): amount is number => amount !== null && amount > 0);
  if (!amounts.length) return undefined;
  const low = Math.min(...amounts);
  const high = Math.max(...amounts);
  return low === high ? `$${low}` : `$${low}-$${high}`;
}

// The hero and the first gallery photos give Google a choice of listing images.
function images(content: SiteContent) {
  return [content.hero.image.src, ...content.gallery.map((item) => item.src)]
    .filter((src, index, all) => all.indexOf(src) === index)
    .slice(0, 6)
    .map(absoluteUrl);
}

function campground(content: SiteContent) {
  const { contact } = content;
  const { latitude, longitude } = contact.geo;
  const range = priceRange(content);
  return {
    "@type": "Campground",
    "@id": businessId,
    name: siteName,
    description: siteDescription,
    url: siteUrl,
    telephone: phoneE164(contact.phone),
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.street,
      addressLocality: contact.address.city,
      addressRegion: contact.address.region,
      postalCode: contact.address.postalCode,
      addressCountry: "US",
    },
    ...(latitude !== null && longitude !== null
      ? { geo: { "@type": "GeoCoordinates", latitude, longitude } }
      : {}),
    hasMap: mapsHref(contact.address),
    image: images(content),
    logo: absoluteUrl("/images/fox-river-logo.webp"),
    ...(range ? { priceRange: range } : {}),
    currenciesAccepted: "USD",
    knowsLanguage: contact.languages
      .split(/,|&/)
      .map((language) => language.trim())
      .filter(Boolean),
    amenityFeature: content.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity.name,
      value: true,
    })),
    sameAs: [contact.facebookUrl, contact.googleProfileUrl].filter(Boolean),
    isAccessibleForFree: false,
    publicAccess: true,
  };
}

export type PageDetails = {
  path: string;
  name: string;
  description: string;
  /** Omitted on the homepage, which is the root of the trail. */
  breadcrumb?: string;
};

/**
 * One linked graph per page: the campground itself, the site it belongs to,
 * this page, and the trail back to the homepage.
 */
export function structuredData(content: SiteContent, page: PageDetails) {
  const url = absoluteUrl(page.path);
  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: page.name,
    description: page.description,
    inLanguage: "en-US",
    isPartOf: { "@id": websiteId },
    about: { "@id": businessId },
    primaryImageOfPage: absoluteUrl(content.hero.image.src),
  };
  const graph: Record<string, unknown>[] = [
    campground(content),
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteUrl,
      name: siteName,
      description: siteDescription,
      inLanguage: "en-US",
      publisher: { "@id": businessId },
    },
    webPage,
  ];
  if (page.breadcrumb) {
    webPage.breadcrumb = { "@id": `${url}#breadcrumb` };
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: page.breadcrumb, item: url },
      ],
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
