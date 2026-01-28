"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  /* ── Read callback error from ?e= query param ──── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("e");
    if (e) setError(decodeURIComponent(e));
  }, []);

  /* ── Mount check: already logged in? ────────────── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next") ?? "/ko/korean-work/learn";
        window.location.href = next;
      }
    });
  }, [supabase]);

  /* ── Client-side auth fallback ──────────────────── */
  // Catches SIGNED_IN (new login) and INITIAL_SESSION (existing cookies).
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
        session
      ) {
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next") ?? "/ko/korean-work/learn";
        window.location.href = next;
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  /** Save where to go after login, then return the clean callback URL */
  function prepareRedirect() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") ?? "/ko/korean-work/learn";
    document.cookie = `auth_next=${encodeURIComponent(next)}; Path=/; Max-Age=300; SameSite=Lax`;
    return `${window.location.origin}/auth/callback`;
  }

  /* ── Google OAuth ─────────────────────────── */
  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: prepareRedirect(),
      },
    });
    if (error) setError(error.message);
  }

  /* ── Magic Link ───────────────────────────── */
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: prepareRedirect(),
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-4">🇰🇷</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Korean Work
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Sign in to save your progress
          </p>
        </div>

        {/* Card */}
        <div
          className="
            rounded-3xl p-8
            bg-white/70 backdrop-blur-2xl
            border border-white/80
            shadow-[0_4px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]
          "
        >
          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            className="
              w-full flex items-center justify-center gap-3
              py-3 px-4 rounded-2xl
              bg-white border-2 border-slate-200
              text-slate-700 font-semibold
              hover:border-slate-300 hover:bg-slate-50
              active:scale-[0.98]
              transition-all duration-200
            "
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Magic Link */}
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✉️</div>
              <p className="text-slate-900 font-semibold">Check your email!</p>
              <p className="text-slate-500 text-sm mt-1">
                We sent a sign-in link to <strong>{email}</strong>
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                  w-full py-3 px-4 rounded-2xl
                  bg-slate-50 border-2 border-slate-200
                  text-slate-900 placeholder:text-slate-400
                  focus:border-indigo-400 focus:bg-white focus:outline-none
                  transition-all duration-200
                "
              />
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full py-3 px-4 rounded-2xl
                  bg-gradient-to-r from-indigo-500 to-purple-600
                  text-white font-semibold
                  shadow-lg shadow-indigo-500/25
                  hover:shadow-xl hover:scale-[1.01]
                  active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-rose-600 text-sm text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-slate-400">
          <Link
            href="/ko/korean-work"
            className="hover:text-slate-600 transition-colors"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
