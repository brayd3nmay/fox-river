import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { JsonLd } from "@/components/json-ld";
import { getContent } from "@/lib/content";
import { siteDescription, structuredData } from "@/lib/seo";
import { homeTitle } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { hero } = await getContent();
  return {
    alternates: { canonical: "/" },
    openGraph: {
      url: "/",
      images: [{ url: hero.image.src, alt: hero.image.alt }],
    },
  };
}

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <JsonLd
        data={structuredData(content, {
          path: "/",
          name: homeTitle,
          description: siteDescription,
        })}
      />
      <HomePage content={content} />
    </>
  );
}
