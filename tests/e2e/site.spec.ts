import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** The desktop/mobile project matrix exists to catch this; assert it the same way everywhere. */
async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

test("homepage loads photos, accurate contact links, and navigation without browser errors", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A little closer to nature." }),
  ).toBeVisible();
  await expect(
    page.locator('a[href="tel:+18473956090"]').first(),
  ).toBeAttached();
  await expect(
    page.locator('a[href="mailto:foxriver13@gmail.com"]'),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText("\\n");
  await expect
    .poll(() =>
      page
        .locator(".hero-image")
        .evaluate((node) => (node as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await expectNoHorizontalOverflow(page);
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: `.context/${testInfo.project.name}-homepage.png`,
    fullPage: true,
  });
  await page.screenshot({ path: `.context/${testInfo.project.name}-hero.png` });
  await page.getByRole("link", { name: "Explore rates", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your stay, your way." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("gallery opens, changes photos, and closes with Escape", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /View photo:/ })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("1 of 4", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Next photo" }).click();
  await expect(page.getByText("2 of 4", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("rates and rules preserve fees, policies, and mobile layout", async ({
  page,
}) => {
  await page.goto("/rates");
  await expect(page.locator("#camping")).toContainText("$60");
  await expect(page.locator("#cabins")).toContainText("$160");
  await expect(page.locator("#passes")).toContainText("Please call");
  await expectNoHorizontalOverflow(page);
  await page.getByRole("link", { name: "Read the visiting guide" }).click();
  await expect(
    page.getByRole("heading", { name: "Before you visit." }),
  ).toBeVisible();
  await expect(page.locator("main")).toContainText("72 hours");
  await expect(page.locator("main")).toContainText("Complete campground rules");
});

test("mobile menu navigates and closes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Rates", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your stay, your way." }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("local editor saves, previews, and restores a draft without changing public content", async ({
  page,
}) => {
  await page.goto("/admin/demo");
  await page
    .getByLabel("Main headline", { exact: true })
    .fill("A weekend by the water.");
  await page.getByRole("tab", { name: "Rates", exact: true }).click();
  await page.getByLabel("Price in dollars", { exact: true }).first().fill("75");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Draft saved in this browser",
  );
  await expect(
    page.getByRole("button", { name: "Publish changes" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A weekend by the water." }),
  ).toBeVisible();
  await expect(page.locator(".stay-price").first()).toContainText("$75");
  await page.getByRole("button", { name: "rates", exact: true }).click();
  await expect(page.locator("#camping")).toContainText("$75");
  await page.getByRole("button", { name: "Back to editing" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Restore saved local draft" }).click();
  await expect(page.getByLabel("Main headline", { exact: true })).toHaveValue(
    "A weekend by the water.",
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A little closer to nature." }),
  ).toBeVisible();
  await expect(page.locator(".stay-price").first()).toContainText("$60");
});

test("invalid rates cannot be saved and unauthenticated draft previews are protected", async ({
  page,
}) => {
  await page.goto("/admin/preview");
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/demo");
  await page.getByRole("tab", { name: "Rates", exact: true }).click();
  await page.getByLabel("Price in dollars", { exact: true }).first().fill("-1");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Enter a price of $0 or more.",
  );
});

for (const path of ["/", "/rates", "/rules", "/admin", "/admin/demo"]) {
  test(`accessibility and overflow: ${path}`, async ({ page }) => {
    await page.goto(path);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
    await expectNoHorizontalOverflow(page);
  });
}

test("every public page ships a canonical URL and a linked structured-data graph", async ({
  page,
}) => {
  for (const [path, expectedCrumbs] of [
    ["/", 0],
    ["/rates", 2],
    ["/rules", 2],
  ] as const) {
    await page.goto(path);
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(new URL(canonical || "").pathname.replace(/\/$/, "") || "/").toBe(
      path,
    );
    const graph = await page
      .locator('script[type="application/ld+json"]')
      .evaluate((node) => JSON.parse(node.textContent || "{}")["@graph"]);
    const business = graph.find(
      (entry: { "@type": string }) => entry["@type"] === "Campground",
    );
    expect(business.address.addressLocality).toBe("Antioch");
    expect(business.address.addressRegion).toBe("IL");
    expect(business.address.postalCode).toBe("60002");
    expect(business.telephone).toBe("+18473956090");
    expect(business.amenityFeature.length).toBeGreaterThan(0);
    const crumbs = graph.find(
      (entry: { "@type": string }) => entry["@type"] === "BreadcrumbList",
    );
    expect(crumbs?.itemListElement.length ?? 0).toBe(expectedCrumbs);
  }
});
