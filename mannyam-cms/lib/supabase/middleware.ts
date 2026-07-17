import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

// Middleware session refreshing helper
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Retrieve user to verify session and refresh session token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isDashboardRoute = [
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
  ].some((route) => path === route || path.startsWith(`${route}/`));

  const isLoginRoute = path === "/login";

  const redirectWithSessionCookies = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";

    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  };

  if (!user && isDashboardRoute) {
    return redirectWithSessionCookies("/login");
  }

  if (user) {
    // Fetch the user's role to distinguish staff and customers
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const userRole = profile?.role; // 'Admin', 'Marketer', 'Content Manager', or undefined (customer)
    const isStaff = userRole && ["Admin", "Marketer", "Content Manager"].includes(userRole);

    if (isDashboardRoute && !isStaff) {
      return redirectWithSessionCookies("/account");
    }

    if (isLoginRoute) {
      if (isStaff) {
        return redirectWithSessionCookies("/dashboard");
      } else {
        return redirectWithSessionCookies("/account");
      }
    }
  }

  return supabaseResponse;
}

