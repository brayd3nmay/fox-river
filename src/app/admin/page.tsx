import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Brand } from "@/components/brand";
import { getOwner } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { parseStoredContent } from "@/lib/content-schema";
import { Editor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import { signIn } from "./actions";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const owner = await getOwner();
  if (owner) {
    const { data, error } = await owner.client
      .from("site_content")
      .select("id,content,version");
    if (error) throw new Error("Unable to load the owner editor.");
    const draft = data.find((row) => row.id === "draft");
    const published = data.find((row) => row.id === "published");
    return (
      <Editor
        initialContent={parseStoredContent(draft?.content)}
        initialVersion={draft?.version ?? 0}
        publishedVersion={published?.version ?? 0}
        ownerEmail={owner.user.email || "Approved owner"}
      />
    );
  }
  const { error } = await searchParams;
  const configured = isSupabaseConfigured();
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e9eddf] px-5 py-16">
      <div className="w-full max-w-md rounded-lg border bg-background p-8 sm:p-12">
        <Brand />
        <h1 className="display mt-7 text-4xl">A little upkeep.</h1>
        <p className="body-copy mt-5 text-sm">
          The owner&apos;s space for fresh photos, updated rates, and the
          details that make guests feel welcome.
        </p>
        {error && (
          <p
            role="alert"
            className="mt-5 rounded border border-destructive/30 bg-red-50 p-3 text-sm text-destructive"
          >
            {error === "not-approved"
              ? "This Google account isn't approved to edit the site. Ask the project administrator to add your account."
              : "Sign-in couldn't be completed. Please try again or contact the project administrator."}
          </p>
        )}
        {configured ? (
          <form action={signIn} className="mt-8">
            <Button className="h-12 w-full">
              <LockKeyhole size={16} />
              Continue with Google
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              For approved owner accounts only.
            </p>
          </form>
        ) : (
          <div className="mt-7 space-y-4 rounded border bg-card p-4">
            <p className="text-sm leading-6">
              Owner sign-in is not connected yet. The project administrator
              needs to configure Supabase and Google sign-in.
            </p>
            {process.env.NODE_ENV === "development" && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/demo">Try the editor locally</Link>
              </Button>
            )}
          </div>
        )}
        <Link href="/" className="mt-8 inline-flex items-center gap-2 text-xs">
          <ArrowLeft size={14} />
          Back to the campground
        </Link>
      </div>
    </main>
  );
}
