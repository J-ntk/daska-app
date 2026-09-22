import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (match && routing.locales.includes(match[1] as any)) {
    return match[2] || "/";
  }
  return pathname;
}

export async function middleware(request: NextRequest) {
  const isStaticAsset =
    /\.(json|js|ico|png|jpg|jpeg|svg|webp|txt|xml|webmanifest)$/.test(
      request.nextUrl.pathname
    ) || request.nextUrl.pathname.startsWith("/.well-known");

  if (isStaticAsset) {
    return NextResponse.next({ request });
  }

  const intlResponse = intlMiddleware(request);

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

  // getSession() reads the JWT straight from the cookie — no network call
  // unless the token has actually expired. getUser() (used everywhere
  // else, in pages and server actions) still re-verifies with Supabase's
  // server for real security on actual data access; this is only the
  // fast routing gate that decides whether to redirect to /login.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

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