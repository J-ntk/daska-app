import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/en/login", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("language")
    .eq("id", user.id)
    .maybeSingle();
  const locale = profile?.language ?? "en";

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/${locale}/app/settings?google=error`, request.url)
    );
  }

  try {
    const redirectUri = new URL("/api/auth/google/callback", request.url).toString();
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    await supabase.from("user_integrations").upsert(
      {
        user_id: user.id,
        provider: "google",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token, // only present on first consent
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      },
      { onConflict: "user_id,provider" }
    );

    return NextResponse.redirect(new URL(`/${locale}/app/settings?google=connected`, request.url));
  } catch {
    return NextResponse.redirect(new URL(`/${locale}/app/settings?google=error`, request.url));
  }
}
