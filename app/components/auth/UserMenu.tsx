"use client";

import { useUser } from "./AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const { user, loading } = useUser();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  if (loading) {
    return (
      <div className="w-7 h-7 rounded-full bg-slate-200 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <a
        href="/ko/korean-work/login"
        className="
          px-4 py-1.5 rounded-full text-sm font-semibold
          bg-gradient-to-r from-indigo-500 to-purple-600
          text-white
          shadow-md shadow-indigo-500/20
          hover:shadow-lg hover:scale-[1.03]
          active:scale-[0.97]
          transition-all duration-200
        "
      >
        Sign in
      </a>
    );
  }

  // logged in — show avatar / initial + logout
  const initial = (
    user.user_metadata?.full_name?.[0] ??
    user.email?.[0] ??
    "?"
  ).toUpperCase();

  const avatarUrl: string | undefined = user.user_metadata?.avatar_url;

  return (
    <div className="flex items-center gap-2">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="w-7 h-7 rounded-full border border-white/60 shadow-sm"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {initial}
        </div>
      )}
      <button
        type="button"
        onClick={handleLogout}
        className="
          text-xs font-medium text-slate-500
          hover:text-slate-700
          transition-colors
        "
      >
        Sign out
      </button>
    </div>
  );
}
