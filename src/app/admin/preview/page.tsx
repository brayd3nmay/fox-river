import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { parseStoredContent } from "@/lib/content-schema";
import { previewPages, isPreviewPage } from "@/components/preview-pages";
export const dynamic = "force-dynamic";
const previewLinks = [
  { slug: "home", label: "Home" },
  { slug: "rates", label: "Rates" },
  { slug: "rules", label: "Rules" },
] as const;
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const owner = await getOwner();
  if (!owner) redirect("/admin");
  const { data, error } = await owner.client
    .from("site_content")
    .select("content")
    .eq("id", "draft")
    .single();
  if (error) throw new Error("Unable to load preview.");
  const content = parseStoredContent(data?.content);
  const { page } = await searchParams;
  const PreviewPageComponent =
    previewPages[isPreviewPage(page) ? page : "home"];
  return (
    <>
      <div className="preview-bar flex flex-wrap justify-center gap-5 p-3 text-xs">
        <strong>Draft preview · Not published</strong>
        {previewLinks.map(({ slug, label }) => (
          <Link
            key={slug}
            href={
              slug === "home" ? "/admin/preview" : `/admin/preview?page=${slug}`
            }
          >
            {label}
          </Link>
        ))}
        <Link href="/admin">Back to editor</Link>
      </div>
      <PreviewPageComponent content={content} />
    </>
  );
}
