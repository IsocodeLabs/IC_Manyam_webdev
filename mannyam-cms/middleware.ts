import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

interface RedirectRow {
  from_path: string;
  to_path: string;
  status_code: 301 | 302;
}

let cachedRedirects: RedirectRow[] | null = null;
let fetchPromise: Promise<RedirectRow[]> | null = null;
let lastFetched = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

async function getRedirects(): Promise<RedirectRow[]> {
  const now = Date.now();

  // If cache is still valid, return cached redirects
  if (cachedRedirects && now - lastFetched < CACHE_TTL) {
    return cachedRedirects;
  }

  // If a fetch is already in progress, await that fetch
  if (fetchPromise) {
    return fetchPromise;
  }

  // Otherwise, start a new fetch
  fetchPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from("redirects")
        .select("from_path, to_path, status_code");

      if (error) {
        console.error("Error fetching redirects from Supabase in middleware:", error);
        return cachedRedirects || [];
      }

      cachedRedirects = data || [];
      lastFetched = Date.now();
      return cachedRedirects;
    } catch (err) {
      console.error("Exception fetching redirects in middleware:", err);
      return cachedRedirects || [];
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

function normalizePath(p: string): string {
  let clean = p.trim();
  if (clean !== "/" && clean.endsWith("/")) {
    clean = clean.slice(0, -1);
  }
  return clean.toLowerCase();
}

function isPublicRoute(path: string): boolean {
  const adminRoutes = [
    "/dashboard",
    "/pages-cms",
    "/packages",
    "/media",
    "/seo",
    "/redirects",
    "/clusters",
    "/analytics",
    "/leads",
    "/settings",
    "/login",
  ];
  return !adminRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Process redirects only on public routes
  if (
    isPublicRoute(pathname) &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/") &&
    pathname !== "/favicon.ico"
  ) {
    const redirects = await getRedirects();
    const normalizedReqPath = normalizePath(pathname);
    const match = redirects.find(
      (r) => normalizePath(r.from_path) === normalizedReqPath
    );

    if (match) {
      const url = request.nextUrl.clone();
      if (match.to_path.startsWith("/")) {
        url.pathname = match.to_path;
      } else {
        // External URL
        try {
          const redirectUrl = new URL(match.to_path);
          // Preserve query parameters if any
          redirectUrl.search = request.nextUrl.search;
          return NextResponse.redirect(redirectUrl, { status: match.status_code });
        } catch {
          // Fallback if not a valid full URL
          return NextResponse.redirect(match.to_path, { status: match.status_code });
        }
      }

      return NextResponse.redirect(url, { status: match.status_code });
    }
  }

  // Inject x-pathname header to make the current route pathname
  // accessible in Server Components (such as dashboard layout).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const req = new NextRequest(request, {
    headers: requestHeaders,
  });

  return await updateSession(req);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimisation files)
     * - favicon.ico (favicon file)
     * - Images/assets matching common formats
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

