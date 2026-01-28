import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const cookieStore = await cookies();
  const sbCookies = cookieStore
    .getAll()
    .filter((c) => c.name.startsWith("sb-"));
  console.log(
    "[LEARN guard] sb cookies:",
    sbCookies.map((c) => `${c.name}(${c.value.length})`),
  );

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log("[LEARN guard] user?", !!user, "| err:", error?.message ?? "none");

  if (!user) {
    const { locale } = await params;
    redirect(`/${locale}/korean-work/login?next=/${locale}/korean-work/learn`);
  }

  return <>{children}</>;
}
