import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Strips a leading /xx locale segment (e.g. "/en/app/daily" -> "/app/daily")
// so the auth logic below can reason about paths the same way it always did.
function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (match && routing.locales.includes(match[1] as any)) {
    return match[2] || "/";
  }
  return pathname;
}

export async function middleware(request: NextRequest) {
  // Static assets bypass everything — no locale handling, no auth check.
  const isStaticAsset =
    /\.(json|js|ico|png|jpg|jpeg|svg|webp|txt|xml|webmanifest)$/.test(
      request.nextUrl.pathname
    ) || request.nextUrl.pathname.startsWith("/.well-known");

  if (isStaticAsset) {
    return NextResponse.next({ request });
  }

  // Let next-intl figure out/redirect to the right locale first.
  const intlResponse = intlMiddleware(request);

  // If next-intl decided to redirect (e.g. "/" -> "/en/"), just send that
  // back immediately — middleware will run again on the redirected URL,
  // and the auth check below will happen on that next pass instead.
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }

  let response = intlResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathWithoutLocale = stripLocale(request.nextUrl.pathname);
  const localeMatch = request.nextUrl.pathname.match(/^\/([a-z]{2})(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  const isAuthPage =
    pathWithoutLocale.startsWith("/login") ||
    pathWithoutLocale.startsWith("/signup");

  const isPublicPage =
    isAuthPage ||
    pathWithoutLocale.startsWith("/privacy") ||
    pathWithoutLocale.startsWith("/terms");

  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/app/daily`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
