import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(missing)";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "(missing)";

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const sbCookies = allCookies.filter((c) => c.name.startsWith("sb-"));

  let userId: string | null = null;
  let userEmail: string | null = null;
  let authError: string | null = null;
  let sessionCheck: string | null = null;

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    });

    // 1) getSession (reads JWT locally, no API call)
    const { data: sessionData, error: sessionErr } =
      await supabase.auth.getSession();
    sessionCheck = sessionErr
      ? `ERROR: ${sessionErr.message}`
      : sessionData.session
        ? `OK (expires ${sessionData.session.expires_at})`
        : "NO SESSION";

    // 2) getUser (calls Supabase API to verify)
    const { data, error } = await supabase.auth.getUser();
    userId = data?.user?.id ?? null;
    userEmail = data?.user?.email ?? null;
    authError = error?.message ?? null;
  } catch (e: unknown) {
    authError = `EXCEPTION: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({
    supabaseUrl: url.slice(0, 30) + "...",
    anonKeyPresent: key !== "(missing)" && key.length > 10,
    totalCookies: allCookies.length,
    sbCookies: sbCookies.map((c) => ({
      name: c.name,
      valueLen: c.value.length,
    })),
    sessionCheck,
    userId,
    userEmail,
    authError,
  });
}
