// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 제외
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith("/korean-work/login")
  ) {
    return NextResponse.next();
  }

  const isProtected =
    pathname.includes("/korean-work/learn") ||
    pathname.includes("/korean-work/review");

  if (!isProtected) return NextResponse.next();

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // ✅ 여기서부터 "변수 스코프 에러"가 절대 안 나게 작성
  const result = await supabase.auth.getUser();

  // ✅ 이 3줄은 user/error가 undefined여도 절대 터지지 않음
  console.log("MW path:", pathname);
  console.log("MW user:", result?.data?.user?.id ?? "null");
  console.log("MW error:", result?.error?.message ?? "none");

  if (!result?.data?.user) {
    const locale = pathname.split("/")[1] || "ko";
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = `/${locale}/korean-work/login`;
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
