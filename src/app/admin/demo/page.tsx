import { notFound } from "next/navigation";
import { Editor } from "@/components/editor";
import { defaultContent } from "@/lib/default-content";
export const dynamic = "force-dynamic";
export default function DemoPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <Editor
      initialContent={defaultContent}
      initialVersion={0}
      publishedVersion={0}
      ownerEmail="Local preview"
      demo
    />
  );
}
