"use server";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOwner } from "@/lib/auth";
import { contentSchema, validationMessage } from "@/lib/content-schema";
import { absoluteUrl } from "@/lib/site";
export async function signIn() {
  const client = await createClient();
  if (!client) redirect("/admin?error=setup");
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: absoluteUrl("/auth/callback"),
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) redirect("/admin?error=sign-in");
  redirect(data.url);
}
export async function signOut() {
  const client = await createClient();
  if (client) await client.auth.signOut();
  redirect("/admin");
}
export async function saveDraft(
  input: unknown,
  version: number,
): Promise<{ ok: true; version: number } | { ok: false; error: string }> {
  try {
    const { client } = await requireOwner();
    const parsed = contentSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: validationMessage(parsed.error) };
    if (!Number.isSafeInteger(version) || version < 0)
      return { ok: false, error: "Invalid draft version. Reload the editor." };
    const { data, error } = await client.rpc("save_site_draft", {
      new_content: parsed.data,
      expected_version: version,
    });
    if (error)
      return {
        ok: false,
        error:
          error.code === "40001"
            ? "Another owner changed this draft. Copy your changes, then reload the editor."
            : "The draft could not be saved. Your changes are still in the editor. Please try again.",
      };
    return { ok: true, version: data as number };
  } catch {
    return {
      ok: false,
      error:
        "Your owner session has expired or is unavailable. Sign in again before saving.",
    };
  }
}
const draftChanged =
  "The draft has changed. Reload and review it before publishing.";
export async function publishDraft(
  version: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { client } = await requireOwner();
    if (!Number.isSafeInteger(version) || version < 1)
      return { ok: false, error: "Save a draft before publishing." };
    const { data: draft, error: readError } = await client
      .from("site_content")
      .select("content, version")
      .eq("id", "draft")
      .single();
    if (readError || !draft || draft.version !== version)
      return { ok: false, error: draftChanged };
    if (!contentSchema.safeParse(draft.content).success)
      return {
        ok: false,
        error:
          "The draft contains invalid content. Review and save it before publishing.",
      };
    const { error } = await client.rpc("publish_site_draft", {
      expected_version: version,
    });
    if (error)
      return {
        ok: false,
        error:
          error.code === "40001"
            ? draftChanged
            : "Publishing failed. Your saved draft is safe. Please try again.",
      };
    updateTag("site-content");
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "Your owner session has expired or is unavailable. Sign in again before publishing.",
    };
  }
}
