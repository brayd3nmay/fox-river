# Fox River Recreation

Next.js, TypeScript, Tailwind, and shadcn/ui website with a Supabase-backed owner editor. No online booking or payment processing. Reservations use the office phone number.

## Local development

Requires Node 22+ and pnpm 12.4.2.

```sh
pnpm install
pnpm dev --port 3100
```

- Website: http://localhost:3100
- Owner sign-in: http://localhost:3100/admin
- Local editor demo: http://localhost:3100/admin/demo

With no environment variables, the public site uses `src/lib/default-content.ts`. The development-only editor demo saves drafts in browser local storage and previews them without changing the public site. Uploads and publication are disabled. `/admin/demo` returns 404 in production.

## Connect the owner editor

1. Create a client-owned Supabase project. Apply `supabase/migrations/202609170001_site_content.sql` using the SQL editor or your usual migration process. This creates owner membership, draft/published content, the media bucket, and access policies.
2. Copy `.env.example` to `.env.local`. Set the project's URL and publishable key. Set `NEXT_PUBLIC_SITE_URL` to the exact application origin, including the port locally. No service-role key belongs in this application.
3. Configure Google OAuth in Google Cloud and Supabase. Register the Supabase callback URL with Google. Add the application's `/auth/callback` URL to the Supabase redirect allowlist. For local use on port 3100, consistently use `http://localhost:3100` or `http://127.0.0.1:3100` in both the browser and configuration.
4. Have an owner sign in once. The app will reject access until an administrator finds their verified account in Supabase Auth and inserts its UUID into `public.site_owners`:

```sql
insert into public.site_owners(user_id) values ('THE-VERIFIED-AUTH-USER-UUID');
```

5. Sign in again. Save the initial draft, preview it, and publish. Removing the UUID from `site_owners` revokes editing, publishing, and uploads, including for existing sessions.

Public reads can access only the published row. Writes require owner membership in both the server actions and PostgreSQL functions. Draft saves and publication check the expected version to reject stale changes. Database functions lock the draft row during publication. Uploaded files have immutable paths, so replacing draft media cannot alter a currently published image. The public media bucket is for website assets only, not private files. Draft text is private, but uploaded assets are publicly accessible by URL before publication.

The editor supports homepage copy, rates, photos, background video, amenities, reviews, rules, and contact details. Shared rate IDs keep featured prices consistent across pages. Save leaves a private draft; publish updates the public content and invalidates its cache. The preview button shows current edits; `/admin/preview` shows the saved draft to authenticated owners.

## Search visibility

Every public page carries a canonical URL, a page-specific title, description, and Open Graph card, and one `application/ld+json` graph built in `src/lib/seo.ts`. The graph links four nodes by `@id` so search engines read them as one entity: a `Campground`, the `WebSite` it publishes, the current `WebPage`, and a `BreadcrumbList` on pages below the homepage.

The `Campground` node is derived from published content, so it stays accurate when an owner edits the site. It carries the street address split into locality, region, and postal code, the phone number in E.164 form, map coordinates when both are filled in, the amenity list, the languages spoken, a nightly `priceRange` computed from rates whose unit mentions a night, a Google Maps link, and the hero plus the first gallery photos as candidate listing images. `sameAs` carries the Facebook page and the Google Business Profile, which is what ties the listing's reviews to this domain. Blank profile links are dropped rather than emitted empty, and the Facebook links disappear from the site when that field is cleared.

The contact tab of the owner editor holds all of it: street, city, state, ZIP, map latitude and longitude, the Facebook link, and the Google Business Profile link.

Three things still need a person:

1. **Map coordinates.** Right-click the office in Google Maps, copy the two numbers, and paste them into the contact tab. The site works without them; they only sharpen the map pin.
2. **Google Business Profile.** See the checklist below. This matters more for local ranking than anything on the page.
3. **Google Search Console.** Verify the production domain, then paste the verification token into `GOOGLE_SITE_VERIFICATION` and submit `https://foxriverrecreation.com/sitemap.xml`. `robots.txt` and the sitemap only serve the production URLs once `SITE_INDEXABLE=true`.

Office hours are not published as `openingHoursSpecification` because no confirmed hours exist yet. Add them to the schema once the owners give them. Guest reviews on the site are not marked up as `Review` or `aggregateRating`: Google discards self-hosted reviews on your own business, and the real ones belong on the Business Profile.

### Google Business Profile checklist

Do this with an owner present, using the business's own Google account, not a developer account.

1. Search for "Fox River Recreation" on Google. If a listing already exists, use **Own this business** to claim it. If not, create one at <https://business.google.com>. Verification is usually a postcard to the Route 173 address and takes about a week, so start it early.
2. Set the primary category to **Campground**. Add **RV park**, **Cabin rental agency**, and **Boat rental service** as secondary categories only where they are accurate.
3. Enter the address exactly as the website does: `27884 W. Route 173, Antioch, IL 60002`. Same phone, `847-395-6090`. Any mismatch in punctuation or suite formatting weakens the match.
4. Set the website field to `https://foxriverrecreation.com`.
5. Enter the seasonal hours, and mark the off-season months as closed rather than leaving the listing blank.
6. Upload the same photos the site uses, plus the drone footage. Listings with recent photos surface more often.
7. Copy the profile's share link and paste it into the contact tab's **Google Business Profile link** field, then publish. That is what adds it to `sameAs`.
8. Ask recent guests for reviews through the profile's review link. Reviews on the profile are the single strongest local ranking signal, and none of them come from the website.
9. Check that Google's other copies of the business agree on name, address, and phone: Apple Maps, Bing Places, Yelp, and the Illinois campground directories. Conflicting listings are the usual reason a business does not show up under its own name.

## Content and launch dependencies

Existing client photography was downloaded from the current website and optimized to WebP. Source URLs are recorded in `public/images/sources.json`. Replace these with the client's new photography and drone footage. The cabin card currently uses a river sunset, not a claimed photo of a cabin. The client-supplied September 17 logo is used in the header, footer, owner editor, and browser icon, with transparent assets prepared using imagegen. Fonts are self-hosted with their OFL licenses.

The source content was checked on September 17, 2026. Confirm these with the client before launch:

- Family pass: the old rate-page data contains both $175 and $200. The new site says to call.
- Adult day visitors: the rates page says $10, while embedded park rules say $5. The new site says to call.
- Overnight guest registration: the rates page says 8 pm; embedded rules say 5 pm. The new site asks guests to confirm the deadline.
- Visitor departure times and campsite departure times differ by visitor type in the old rules. Confirm the wording and times.
- Cabin cancellation uses 72 hours; campsite rules use 48 hours. These are preserved as separate policies, pending confirmation.
- The old dog-liability wording is unusual and is preserved for review. Confirm the full policy text and all copied rules. The editor's complete-rules checkbox remains unchecked until the owner approves the policy.
- Rates, seasonal dates, contact email, and approved owner identities need final confirmation. The default email uses the displayed `foxriver13@gmail.com`, not the old mismatched mailto destination.
- Three existing testimonials are retained; the third uses the complete sentences available in the original excerpt. No aggregate rating is claimed.
- Events link to the existing Facebook page because the old site mixes dated schedules. No unconfirmed future events are advertised.
- The mailing address, the map coordinates, and the seasonal hours all need to match the Google Business Profile exactly. Confirm them once and enter them in both places.
- Obtain the paid scope document and any additional text-message requirements referenced in the kickoff.

## Deployment

Use a client-owned Vercel project and the environment variables above. Apply the migration before building against a configured Supabase project. Set a stable preview origin and OAuth callback for a connected editor review. Keep `SITE_INDEXABLE=false` on previews. Preview deployments should use a separate Supabase project if edits must not affect production.

Before the production domain cutover, verify real Google sign-in, owner and non-owner accounts, upload, save, preview, publish, and public cache refresh against the configured project. The local database tests exercise PostgreSQL policies with stubbed Supabase-owned schemas; they do not verify a hosted project's configuration or the Google consent flow.

Set `NEXT_PUBLIC_SITE_URL=https://foxriverrecreation.com` and `SITE_INDEXABLE=true` only for the reviewed production deployment. The latter enables indexing in HTML, response headers, and robots.txt. `NEXT_PUBLIC_SITE_URL` is also the base for every canonical URL, Open Graph URL, and structured-data identifier, so a wrong value quietly points the whole site's search metadata at the wrong origin. Keep the domain at GoDaddy, preserve existing mail DNS records, and change only the website records needed for the new host. Old page URLs redirect to the matching page or homepage section.

After the cutover, run the homepage and `/rates` through the [Rich Results Test](https://search.google.com/test/rich-results), then request indexing for both in Search Console.

## Verification

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
```

Unit tests cover content validation, the structured-data graph, and the migration's owner checks, RLS, publication, stale-version rejection, and upload policies in PGlite. Browser tests cover desktop/mobile navigation, gallery behavior, local editing and previews, protected draft access, accessibility, horizontal overflow, and the canonical URL and structured data rendered on each public page.
