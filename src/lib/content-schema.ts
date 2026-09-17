import { z } from "zod";
import { defaultContent } from "./default-content";

const text = (max = 500) => z.string().trim().min(1).max(max);
export const mediaPath = z
  .string()
  .max(2048)
  .refine((value) => {
    if (/^\/images\/[a-zA-Z0-9/_.-]+$/.test(value) && !value.includes(".."))
      return true;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base) return false;
    try {
      const url = new URL(value);
      return (
        url.origin === new URL(base).origin &&
        url.protocol === "https:" &&
        url.pathname.startsWith("/storage/v1/object/public/site-media/") &&
        !url.search &&
        !url.hash
      );
    } catch {
      return false;
    }
  }, "Use a bundled image or upload a file to the site's media library.");
const image = z.object({ src: mediaPath, alt: text(200) });
// Search engines and the Google Business Profile both read these links.
const profileUrl = z.union([
  z.literal(""),
  z
    .url()
    .max(300)
    .refine(
      (value) => value.startsWith("https://"),
      "Paste the full link, starting with https://.",
    ),
]);
/** The single list of amenity icons; the renderer maps each name to a glyph. */
export const amenityIcons = [
  "waves",
  "trees",
  "boat",
  "tent",
  "store",
  "shower",
  "wifi",
  "games",
  "picnic",
  "fuel",
] as const;
const coordinate = (limit: number, message: string) =>
  z.number().min(-limit, message).max(limit, message).nullable();
export const rateSchema = z.object({
  id: text(60),
  name: text(150),
  amount: z
    .number()
    .nonnegative("Enter a price of $0 or more.")
    .max(100000, "Enter a price of $100,000 or less.")
    .multipleOf(0.01, "Use at most two decimal places.")
    .nullable(),
  unit: z.string().trim().max(80),
  note: z.string().trim().max(400),
});
export const contentSchema = z
  .object({
    hero: z.object({
      eyebrow: text(120),
      title: text(120),
      description: text(300),
      image,
      video: z.union([z.literal(""), mediaPath]),
    }),
    intro: z.object({ eyebrow: text(100), title: text(140), body: text(1200) }),
    stays: z
      .array(
        z.object({
          id: text(60),
          title: text(100),
          description: text(500),
          image,
          rateId: text(60),
        }),
      )
      .min(1)
      .max(6),
    river: z.object({ title: text(150), body: text(1000), image }),
    amenities: z
      .array(
        z.object({
          id: text(60),
          name: text(100),
          detail: text(250),
          icon: z.enum(amenityIcons),
        }),
      )
      .min(1)
      .max(20),
    gallery: z.array(image).min(1).max(24),
    reviews: z
      .array(z.object({ name: text(100), quote: text(1500) }))
      .min(1)
      .max(12),
    rateGroups: z
      .array(
        z.object({
          id: text(60),
          title: text(100),
          description: z.string().max(500),
          rates: z.array(rateSchema).min(1).max(30),
        }),
      )
      .min(1)
      .max(15),
    rules: z.array(z.object({ title: text(150), body: text(3000) })).max(30),
    parkRulesComplete: z.boolean(),
    contact: z.object({
      phone: z
        .string()
        .regex(/^\d{3}-\d{3}-\d{4}$/, "Use 847-395-6090 format."),
      email: z.email(),
      // Kept in parts so search engines can match the listing by city and ZIP.
      address: z.object({
        street: text(120),
        city: text(80),
        region: z
          .string()
          .trim()
          .regex(/^[A-Z]{2}$/, "Use the two-letter state code, like IL."),
        postalCode: z
          .string()
          .trim()
          .regex(/^\d{5}(-\d{4})?$/, "Use a five-digit ZIP code."),
      }),
      geo: z.object({
        latitude: coordinate(90, "Latitude runs from -90 to 90."),
        longitude: coordinate(180, "Longitude runs from -180 to 180."),
      }),
      season: text(150),
      languages: text(200),
      facebookUrl: profileUrl,
      googleProfileUrl: profileUrl,
    }),
  })
  .superRefine((data, ctx) => {
    const ids = data.rateGroups.flatMap((group) =>
      group.rates.map((rate) => rate.id),
    );
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({
        code: "custom",
        path: ["rateGroups"],
        message: "Rate IDs must be unique.",
      });
    const { latitude, longitude } = data.contact.geo;
    if ((latitude === null) !== (longitude === null))
      ctx.addIssue({
        code: "custom",
        path: ["contact", "geo"],
        message:
          "Enter both map coordinates, or leave both blank to use the street address alone.",
      });
    for (const [index, stay] of data.stays.entries()) {
      if (!ids.includes(stay.rateId))
        ctx.addIssue({
          code: "custom",
          path: ["stays", index, "rateId"],
          message: "Choose an existing rate.",
        });
    }
  });
export type SiteContent = z.infer<typeof contentSchema>;
export type AmenityIcon = (typeof amenityIcons)[number];
export type Rate = z.infer<typeof rateSchema>;
/** A stored row is either saved content or an empty install still on the bundled copy. */
export function parseStoredContent(stored: unknown): SiteContent {
  return stored ? contentSchema.parse(stored) : defaultContent;
}
export function validationMessage(error: z.ZodError, content?: SiteContent) {
  const names: Record<string, string> = {
    hero: "Homepage hero",
    intro: "Welcome section",
    stays: "Ways to stay",
    river: "River section",
    amenities: "Amenities",
    gallery: "Photo gallery",
    reviews: "Guest reviews",
    rateGroups: "Rates",
    rules: "Park rules",
    contact: "Contact details",
  };
  return error.issues
    .slice(0, 3)
    .map((issue) => {
      const section = String(issue.path[0] ?? "Content");
      if (
        section === "rateGroups" &&
        typeof issue.path[1] === "number" &&
        content
      ) {
        const group = content.rateGroups[issue.path[1]];
        const rate =
          typeof issue.path[3] === "number"
            ? group?.rates[issue.path[3]]
            : undefined;
        return `${rate?.name || group?.title || "Rates"}: ${issue.message}`;
      }
      return `${names[section] || "Content"}: ${issue.message}`;
    })
    .join(" ");
}
