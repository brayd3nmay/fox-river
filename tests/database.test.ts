import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
const ownerId = "11111111-1111-4111-8111-111111111111";
const visitorId = "22222222-2222-4222-8222-222222222222";
let db: PGlite;
// PGlite runs the real migration and PostgreSQL RLS. Only Supabase-owned schemas are stubbed.
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1, '/') $$;
    grant usage on schema public, auth, storage to anon, authenticated;
    grant insert, select, update, delete on storage.objects to anon, authenticated;
    insert into auth.users(id) values ('${ownerId}'), ('${visitorId}');
  `);
  await db.exec(
    await readFile(
      new URL(
        "../supabase/migrations/202609170001_site_content.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  await db.query("insert into public.site_owners(user_id) values ($1)", [
    ownerId,
  ]);
});
afterAll(async () => {
  await db?.close();
});
beforeEach(async () => {
  await db.exec(
    "reset role; update public.site_content set content = null, version = 0; delete from storage.objects;",
  );
  await db.query("select set_config('request.jwt.claim.sub', '', false)");
});
async function asUser(id: string) {
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  await db.exec("set role authenticated");
}
describe("owner content and media permissions", () => {
  it("allows anonymous visitors to read only the published row", async () => {
    await db.exec("set role anon");
    const result = await db.query("select id from public.site_content");
    expect(result.rows).toEqual([{ id: "published" }]);
    await expect(
      db.query("select public.publish_site_draft(0)"),
    ).rejects.toThrow();
  });
  it("denies an unapproved Google user draft access, publication, and owner enrollment", async () => {
    await asUser(visitorId);
    expect((await db.query("select id from public.site_content")).rows).toEqual(
      [{ id: "published" }],
    );
    await expect(
      db.query("select public.save_site_draft('{}'::jsonb,0)"),
    ).rejects.toThrow(/Owner access required/);
    await expect(
      db.query("select public.publish_site_draft(0)"),
    ).rejects.toThrow(/Owner access required/);
    await expect(
      db.query("insert into public.site_owners(user_id) values ($1)", [
        visitorId,
      ]),
    ).rejects.toThrow();
  });
  it("keeps drafts private and publishes the saved version atomically", async () => {
    await asUser(ownerId);
    await db.query("select public.save_site_draft($1::jsonb,0)", [
      JSON.stringify({ title: "New headline" }),
    ]);
    expect(
      (
        await db.query(
          "select content from public.site_content where id='published'",
        )
      ).rows,
    ).toEqual([{ content: null }]);
    await db.query("select public.publish_site_draft(1)");
    expect(
      (
        await db.query(
          "select content, version from public.site_content where id='published'",
        )
      ).rows,
    ).toEqual([{ content: { title: "New headline" }, version: 1 }]);
  });
  it("rejects stale saves and stale publishes instead of overwriting newer work", async () => {
    await asUser(ownerId);
    await db.query("select public.save_site_draft('{}'::jsonb,0)");
    await expect(
      db.query("select public.save_site_draft('{}'::jsonb,0)"),
    ).rejects.toThrow(/changed in another session/);
    await expect(
      db.query("select public.publish_site_draft(0)"),
    ).rejects.toThrow(/changed in another session/);
    await expect(
      db.query(
        "update public.site_content set content='{}'::jsonb where id='published'",
      ),
    ).rejects.toThrow();
  });
  it("rejects null versions and empty publication", async () => {
    await asUser(ownerId);
    await expect(
      db.query("select public.save_site_draft('{}'::jsonb,null)"),
    ).rejects.toThrow();
    await expect(
      db.query("select public.publish_site_draft(null)"),
    ).rejects.toThrow();
    await expect(
      db.query("select public.publish_site_draft(0)"),
    ).rejects.toThrow(/Save a draft/);
  });
  it("limits media uploads to an owner's own immutable paths", async () => {
    await asUser(visitorId);
    await expect(
      db.query(
        "insert into storage.objects(bucket_id,name) values ('site-media',$1)",
        [`${visitorId}/x.webp`],
      ),
    ).rejects.toThrow();
    await db.exec("reset role");
    await asUser(ownerId);
    await db.query(
      "insert into storage.objects(bucket_id,name) values ('site-media',$1)",
      [`${ownerId}/x.webp`],
    );
    await expect(
      db.query(
        "insert into storage.objects(bucket_id,name) values ('site-media',$1)",
        [`${visitorId}/x.webp`],
      ),
    ).rejects.toThrow();
    await db.query("update storage.objects set name='overwritten.webp'");
    expect((await db.query("select name from storage.objects")).rows).toEqual([
      { name: `${ownerId}/x.webp` },
    ]);
  });
});
