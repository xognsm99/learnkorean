"use client";

import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Soft blue gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-48 -right-48 w-[500px] h-[500px] bg-gradient-to-br from-sky-200/50 via-blue-200/40 to-cyan-200/30 rounded-full blur-[100px]" />
          <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-200/40 via-sky-200/30 to-blue-100/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-blue-100/30 via-sky-100/20 to-transparent rounded-full blur-[80px]" />
        </div>

        <div className="relative px-6 py-20 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Logo / Brand */}
            <div className="mb-10">
              <div
                className="
                  inline-flex items-center justify-center
                  w-28 h-28 rounded-[2rem]
                  bg-white/70 backdrop-blur-2xl
                  border border-white/80
                  shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
                "
              >
                <span className="text-6xl font-bold bg-gradient-to-br from-sky-500 to-blue-600 bg-clip-text text-transparent">한</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Learn Korean
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-slate-500 mb-4 font-medium tracking-tight">
              Master Korean, one step at a time
            </p>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-14 leading-relaxed">
              From Hangul basics to real-world conversations — learn with interactive quizzes designed for modern learners.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="./korean-work/learn"
                className="
                  group relative inline-flex items-center gap-3
                  py-4 px-8 rounded-2xl
                  bg-slate-900
                  text-white text-lg font-semibold
                  shadow-[0_4px_24px_rgba(0,0,0,0.15)]
                  hover:shadow-[0_8px_40px_rgba(0,0,0,0.2)]
                  hover:bg-slate-800
                  active:scale-[0.98]
                  transition-all duration-300
                "
              >
                <span>Start Learning</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <Link
                href="./korean-work/review"
                className="
                  inline-flex items-center gap-3
                  py-4 px-8 rounded-2xl
                  bg-white/60 backdrop-blur-xl
                  border border-slate-200/80
                  text-slate-700 text-lg font-semibold
                  shadow-[0_2px_16px_rgba(0,0,0,0.04)]
                  hover:bg-white/80 hover:border-slate-300
                  hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]
                  active:scale-[0.98]
                  transition-all duration-300
                "
              >
                <span>View Progress</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest text-center mb-4">
            Learning Modes
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-16 tracking-tight">
            Three ways to master Korean
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Jamo Card */}
            <div
              className="
                group rounded-3xl p-8
                bg-white/60 backdrop-blur-2xl
                border border-white/80
                shadow-[0_4px_24px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]
                hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)]
                hover:bg-white/80
                transition-all duration-500
              "
            >
              <div
                className="
                  flex items-center justify-center
                  w-14 h-14 rounded-2xl mb-6
                  bg-gradient-to-br from-violet-500 to-purple-600
                  text-white text-xl font-bold
                  shadow-[0_4px_16px_rgba(139,92,246,0.25)]
                  group-hover:scale-110 group-hover:rotate-3
                  transition-transform duration-500
                "
              >
                ㅎ
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Jamo Quiz</h3>
              <p className="text-slate-500 leading-relaxed">
                Learn the names of Korean consonants and vowels — the building blocks of Hangul.
              </p>
            </div>

            {/* Emoji Vocab Card */}
            <div
              className="
                group rounded-3xl p-8
                bg-white/60 backdrop-blur-2xl
                border border-white/80
                shadow-[0_4px_24px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]
                hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)]
                hover:bg-white/80
                transition-all duration-500
              "
            >
              <div
                className="
                  flex items-center justify-center
                  w-14 h-14 rounded-2xl mb-6
                  bg-gradient-to-br from-amber-500 to-orange-500
                  text-white text-xl
                  shadow-[0_4px_16px_rgba(245,158,11,0.3)]
                  group-hover:scale-110 group-hover:rotate-3
                  transition-transform duration-500
                "
              >
                🎯
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Emoji & Flags</h3>
              <p className="text-slate-500 leading-relaxed">
                Expand your vocabulary with fun emoji flashcards and world flag challenges.
              </p>
            </div>

            {/* Interview Card */}
            <div
              className="
                group rounded-3xl p-8
                bg-white/60 backdrop-blur-2xl
                border border-white/80
                shadow-[0_4px_24px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)]
                hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)]
                hover:bg-white/80
                transition-all duration-500
              "
            >
              <div
                className="
                  flex items-center justify-center
                  w-14 h-14 rounded-2xl mb-6
                  bg-gradient-to-br from-sky-500 to-blue-600
                  text-white text-xl
                  shadow-[0_4px_16px_rgba(14,165,233,0.3)]
                  group-hover:scale-110 group-hover:rotate-3
                  transition-transform duration-500
                "
              >
                💼
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Interview Prep</h3>
              <p className="text-slate-500 leading-relaxed">
                Practice real-world conversation skills for professional settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div
            className="
              rounded-[2rem] p-10
              bg-white/60 backdrop-blur-2xl
              border border-white/80
              shadow-[0_4px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]
            "
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">24</div>
                <p className="text-slate-400 text-sm font-medium">Jamo Questions</p>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">100+</div>
                <p className="text-slate-400 text-sm font-medium">Vocabulary Words</p>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">100</div>
                <p className="text-slate-400 text-sm font-medium">Country Flags</p>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">20</div>
                <p className="text-slate-400 text-sm font-medium">Interview Prompts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-12 text-center">
        <p className="text-slate-400 text-sm">
          © 2024 Learn Korean. Made with care for language learners.
        </p>
      </footer>
    </main>
  );
}
