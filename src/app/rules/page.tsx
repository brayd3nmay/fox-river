import { getContent } from "@/lib/content";
import { JsonLd } from "@/components/json-ld";
import { RulesPage } from "@/components/rules-page";
import { structuredData } from "@/lib/seo";

const title = "Park Rules & Visiting Guide";
const description =
  "Plan your visit to Fox River Recreation. Cabin check-in, reservations, cancellation policies, and visitor information.";

// openGraph.title/description inherit the resolved page title and description.
export const metadata = {
  title,
  description,
  alternates: { canonical: "/rules" },
  openGraph: { url: "/rules" },
};

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <JsonLd
        data={structuredData(content, {
          path: "/rules",
          name: title,
          description,
          breadcrumb: "Park rules",
        })}
      />
      <RulesPage content={content} />
    </>
  );
}
