import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Session-refresh only middleware.
 * Does NOT redirect — page-level guards handle that.
 * Ensures cookies are refreshed so server components can read the session.
 */
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // 1) update the request so downstream server components see fresh tokens
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value),
          );
          // 2) recreate response so it carries the updated request
          res = NextResponse.next({ request: req });
          // 3) set response cookies so the browser stores them
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, {
              ...options,
              ...(IS_DEV ? { secure: false } : {}),
            });
          });
        },
      },
    },
  );

  // Trigger token refresh (reads + potentially refreshes session)
  await supabase.auth.getUser();

  return res;
}

export const config = {
  matcher: ["/:locale(ko|en)/korean-work/:path*"],
};
