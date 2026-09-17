import { phoneHref, findRate, formatPrice } from "../src/lib/format";
import { describe, expect, it } from "vitest";
import { contentSchema, mediaPath } from "../src/lib/content-schema";
import { defaultContent } from "../src/lib/default-content";
describe("content validation", () => {
  it("accepts all migrated content, including free services and call-for-price rates", () => {
    expect(contentSchema.parse(defaultContent)).toEqual(defaultContent);
    expect(formatPrice(0)).toBe("$0");
    expect(formatPrice(null)).toBe("Please call");
    expect(formatPrice(60.5)).toBe("$60.50");
  });
  it("uses one rate record for stay cards and the rate guide", () => {
    const content = structuredClone(defaultContent);
    content.rateGroups[0].rates[0].amount = 75;
    expect(findRate(content, content.stays[0].rateId)?.amount).toBe(75);
  });
  it("rejects negative prices, missing stay prices, and duplicate rate IDs", () => {
    const content = structuredClone(defaultContent);
    content.rateGroups[0].rates[0].amount = -10;
    expect(contentSchema.safeParse(content).success).toBe(false);
    content.rateGroups[0].rates[0].amount = 60;
    content.stays[0].rateId = "missing";
    expect(contentSchema.safeParse(content).success).toBe(false);
    content.stays[0].rateId = "rv-night";
    content.rateGroups[0].rates[1].id = "rv-night";
    expect(contentSchema.safeParse(content).success).toBe(false);
  });
  it("restricts media to local assets and this project's public media bucket", () => {
    for (const path of [
      "/images/riverfront.webp",
      "https://fox-river-test.supabase.co/storage/v1/object/public/site-media/owner/photo.webp",
    ])
      expect(mediaPath.safeParse(path).success).toBe(true);
    for (const path of [
      "javascript:alert(1)",
      "//attacker.example/photo.jpg",
      "https://attacker.example/photo.jpg",
      "/images/../secret",
      "http://localhost:8080/admin",
      "https://fox-river-test.supabase.co/storage/v1/object/public/private/file",
      "https://fox-river-test.supabase.co/storage/v1/object/public/site-media/x?token=secret",
    ])
      expect(mediaPath.safeParse(path).success).toBe(false);
  });
  it("keeps phone and email valid and creates matching call links", () => {
    expect(phoneHref(defaultContent.contact.phone)).toBe("tel:+18473956090");
    const content = structuredClone(defaultContent);
    content.contact.email = "not-an-email";
    expect(contentSchema.safeParse(content).success).toBe(false);
  });
});
