import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const redirectUri = new URL("/api/auth/google/callback", request.url).toString();
  const authUrl = getGoogleAuthUrl(redirectUri, user.id);
  return NextResponse.redirect(authUrl);
}