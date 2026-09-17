import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site";
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const client = await createClient();
  if (code && client) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: approved } = await client.rpc("is_site_owner");
      if (approved === true)
        return NextResponse.redirect(absoluteUrl("/admin"));
      await client.auth.signOut();
      return NextResponse.redirect(absoluteUrl("/admin?error=not-approved"));
    }
  }
  return NextResponse.redirect(absoluteUrl("/admin?error=sign-in"));
}
