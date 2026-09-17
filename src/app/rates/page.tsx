import { getContent } from "@/lib/content";
import { JsonLd } from "@/components/json-ld";
import { RatesPage } from "@/components/rates-page";
import { structuredData } from "@/lib/seo";

const title = "Camping, Cabin & Boat Rates";
const description =
  "Explore RV camping, seasonal sites, cabin rentals, canoe rentals, boat docks, and visitor rates at Fox River Recreation in Antioch, Illinois.";

// openGraph.title/description inherit the resolved page title and description.
export const metadata = {
  title,
  description,
  alternates: { canonical: "/rates" },
  openGraph: { url: "/rates" },
};

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <JsonLd
        data={structuredData(content, {
          path: "/rates",
          name: title,
          description,
          breadcrumb: "Rates",
        })}
      />
      <RatesPage content={content} />
    </>
  );
}
