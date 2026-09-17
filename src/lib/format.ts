import type { Rate, SiteContent } from "./content-schema";
type Address = SiteContent["contact"]["address"];
// Built once: constructing an Intl formatter costs far more than formatting with it.
const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const withCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export function phoneE164(phone: string) {
  return `+1${phone.replace(/\D/g, "")}`;
}
export function phoneHref(phone: string) {
  return `tel:${phoneE164(phone)}`;
}
export function formatAddress(address: Address) {
  return `${address.street}, ${address.city}, ${address.region} ${address.postalCode}`;
}
export function mapsHref(address: Address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    formatAddress(address),
  )}`;
}
export function formatPrice(amount: number | null) {
  if (amount === null) return "Please call";
  return (Number.isInteger(amount) ? wholeDollars : withCents).format(amount);
}
export function allRates(content: SiteContent) {
  return content.rateGroups.flatMap((group) => group.rates);
}
/** One lookup table per render beats re-flattening every rate group per call. */
export function rateIndex(content: SiteContent) {
  return new Map<string, Rate>(
    allRates(content).map((rate) => [rate.id, rate]),
  );
}
export function findRate(content: SiteContent, id: string) {
  return allRates(content).find((rate) => rate.id === id);
}

/**
 * Bundled stays carry a label and a /rates anchor that their ids alone don't
 * give. Owner-added stays fall back to their own title and id.
 */
const stayMeta: Record<string, { label: string; anchor: string }> = {
  rv: { label: "RV camping", anchor: "camping" },
  cabins: { label: "Cabin rentals", anchor: "cabins" },
  seasonal: { label: "Seasonal stays", anchor: "seasonal" },
};
export function stayLabel(stay: { id: string; title: string }) {
  return stayMeta[stay.id]?.label ?? stay.title;
}
export function stayHref(stay: { id: string }) {
  return `/rates#${stayMeta[stay.id]?.anchor ?? stay.id}`;
}
