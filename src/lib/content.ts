import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { parseStoredContent } from "./content-schema";
import { defaultContent } from "./default-content";
import { supabaseEnv } from "./supabase/env";

// Sitemap dates for an installation that still serves the bundled content.
const bundledContentDate = "2026-09-17T00:00:00.000Z";

// cache() memoizes per request; unstable_cache alone re-reads and re-parses per call.
const getPublished = cache(
  unstable_cache(
    async () => {
      const env = supabaseEnv();
      if (!env)
        return { content: defaultContent, updatedAt: bundledContentDate };
      const client = createClient(env.url, env.key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await client
        .from("site_content")
        .select("content, updated_at")
        .eq("id", "published")
        .single();
      if (error) throw new Error("Published content could not be loaded.");
      return {
        content: parseStoredContent(data.content),
        updatedAt: (data.updated_at as string) || bundledContentDate,
      };
    },
    ["published-site-content-v2"],
    { tags: ["site-content"], revalidate: 3600 },
  ),
);

export async function getContent() {
  return (await getPublished()).content;
}

export async function getPublishedAt() {
  return new Date((await getPublished()).updatedAt);
}
