import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const IS_DEV = process.env.NODE_ENV === "development";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const oauthErrorDesc = url.searchParams.get("error_description");

  const cookieStore = await cookies();
  const rawNext = cookieStore.get("auth_next")?.value;
  let nextPath = rawNext
    ? decodeURIComponent(rawNext)
    : "/ko/korean-work/learn";

  if (!nextPath.startsWith("/")) nextPath = "/ko/korean-work/learn";

  /* ── 1) OAuth provider returned an error ───────── */
  if (oauthError) {
    console.error("[CB] OAuth error:", oauthError, oauthErrorDesc);
    const login = new URL("/ko/korean-work/login", url.origin);
    login.searchParams.set("e", oauthErrorDesc || oauthError);
    return NextResponse.redirect(login);
  }

  /* ── 2) No code — shouldn't happen in PKCE flow ── */
  if (!code) {
    console.error("[CB] No code param. search:", url.search);
    return NextResponse.redirect(
      new URL("/ko/korean-work/login?e=no_code", url.origin),
    );
  }

  /* ── 3) Exchange code for session ──────────────── */
  console.log(
    "[CB] incoming sb cookies:",
    cookieStore
      .getAll()
      .filter((c) => c.name.startsWith("sb-"))
      .map((c) => c.name),
  );

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=${nextPath}">
<title>Logging in…</title>
</head><body>
<p style="font-family:system-ui;text-align:center;margin-top:40vh">Logging in…</p>
<script>window.location.replace(${JSON.stringify(nextPath)})</script>
</body></html>`;

  const res = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          console.log("[CB] setAll called:", cookiesToSet.length, "cookies");
          cookiesToSet.forEach(({ name, value, options }) => {
            const opts = {
              ...options,
              path: "/",
              sameSite: "lax" as const,
              httpOnly: false,
              ...(IS_DEV ? { secure: false } : {}),
            };
            try {
              cookieStore.set(name, value, opts);
            } catch {
              /* read-only in some runtimes */
            }
            res.cookies.set(name, value, opts);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  console.log("[CB] exchange:", {
    ok: !error,
    hasSession: !!data?.session,
    userId: data?.session?.user?.id?.slice(0, 8) ?? null,
  });

  if (error) {
    console.error("[CB] exchange error:", error.message);
    const login = new URL("/ko/korean-work/login", url.origin);
    login.searchParams.set("e", error.message);
    return NextResponse.redirect(login);
  }

  // ── CRITICAL FIX for @supabase/ssr v0.8.0 ──────────────
  // The library defers cookie writes to an async onAuthStateChange listener
  // that is NOT awaited by exchangeCodeForSession. We must yield to let
  // the microtask queue flush so the listener can call our setAll callback.
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Verify cookies were set
  const outCookies = res.cookies.getAll();
  console.log(
    "[CB] cookies after flush:",
    outCookies.length,
    outCookies.map((c) => c.name),
  );

  // clear the helper cookie
  res.cookies.set("auth_next", "", { path: "/", maxAge: 0 });
  console.log("[CB] → navigate:", nextPath);
  return res;
}
