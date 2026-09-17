import "server-only";
import { createClient } from "./supabase/server";

export async function getOwner() {
  const client = await createClient();
  if (!client) return null;
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  const { data: approved, error: ownerError } =
    await client.rpc("is_site_owner");
  if (ownerError || approved !== true) return null;
  return { client, user };
}
export async function requireOwner() {
  const owner = await getOwner();
  if (!owner) throw new Error("Please sign in with an approved owner account.");
  return owner;
}
