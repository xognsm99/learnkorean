"use client";

import Link from "next/link";
import PrettyKoreanWordsHero from "@/app/components/home/PrettyKoreanWordsHero";

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

        <div className="relative px-6 py-12 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            {/* Logo / Brand */}
            <div className="mb-8">
              <div
                className="
                  inline-flex items-center justify-center
                  w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem]
                  bg-white/70 backdrop-blur-2xl
                  border border-white/80
                  shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
                "
              >
                <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-br from-sky-500 to-blue-600 bg-clip-text text-transparent">한</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Korean for Work
              </span>
              <br className="hidden sm:block" />
              <p></p>
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                {" "}&amp; Daily Life
              </span>
            </h1>

            {/* Pretty Korean Words Animation */}
            <PrettyKoreanWordsHero />

            {/* USP Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur text-sm font-medium text-slate-700 shadow-sm border border-white/50">
                <span className="text-lg">🎯</span>
                Real situations
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur text-sm font-medium text-slate-700 shadow-sm border border-white/50">
                <span className="text-lg">⏱️</span>
                5 min/day
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur text-sm font-medium text-slate-700 shadow-sm border border-white/50">
                <span className="text-lg">✨</span>
                Instant feedback
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur text-sm font-medium text-slate-700 shadow-sm border border-white/50">
                <span className="text-lg">🖼️</span>
                Emoji / Image Quiz
              </span>
            </div>

            {/* CTA Buttons - Apple Glassmorphism */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="./korean-work/learn"
                className="
                  group relative inline-flex items-center gap-2
                  py-4 px-8 rounded-2xl
                  bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600
                  text-white font-semibold text-lg
                  shadow-[0_8px_32px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
                  hover:shadow-[0_12px_48px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  transition-all duration-300
                  backdrop-blur-sm
                  border border-white/20
                "
              >
                <span>🚀 Start in 60 Seconds</span>
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
                  group inline-flex items-center gap-2
                  py-4 px-8 rounded-2xl
                  bg-white/40 backdrop-blur-2xl
                  border border-white/60
                  text-slate-700 font-semibold text-lg
                  shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]
                  hover:bg-white/60
                  hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  transition-all duration-300
                "
              >
                <span>📊 View Progress</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Preview Section */}
      <div className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {/* Scenario Cards with Emojis */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200/50 text-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
              <span className="text-5xl block mb-3">🍜</span>
              <p className="text-sm font-semibold text-slate-700">Restaurant</p>
              <p className="text-xs text-slate-500">주문하기</p>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-100 to-sky-50 border border-blue-200/50 text-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
              <span className="text-5xl block mb-3">🏥</span>
              <p className="text-sm font-semibold text-slate-700">Hospital</p>
              <p className="text-xs text-slate-500">진료 예약</p>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-green-100 to-emerald-50 border border-green-200/50 text-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
              <span className="text-5xl block mb-3">🏢</span>
              <p className="text-sm font-semibold text-slate-700">Office</p>
              <p className="text-xs text-slate-500">비즈니스 한국어</p>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-100 to-violet-50 border border-purple-200/50 text-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
              <span className="text-5xl block mb-3">🛒</span>
              <p className="text-sm font-semibold text-slate-700">Shopping</p>
              <p className="text-xs text-slate-500">쇼핑하기</p>
            </div>
          </div>

          {/* Culture & Life Cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <div className="rounded-2xl p-6 bg-gradient-to-br from-rose-100 to-pink-50 border border-rose-200/50 text-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
              <span className="text-5xl block mb-3">🎎</span>
              <p className="text-sm font-semibold text-slate-700">Korean Culture</p>
              <p className="text-xs text-slate-500">한국문화</p>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-teal-100 to-cyan-50 border border-teal-200/50 text-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
              <span className="text-5xl block mb-3">🏠</span>
              <p className="text-sm font-semibold text-slate-700">Daily Life</p>
              <p className="text-xs text-slate-500">생활적응</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest text-center mb-4">
            🎓 Learning Modes
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-16 tracking-tight">
            Seven ways to master Korean 🚀
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Korean Quiz Card */}
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
                  bg-gradient-to-br from-rose-500 to-pink-600
                  text-white text-xl font-bold
                  shadow-[0_4px_16px_rgba(244,63,94,0.3)]
                  group-hover:scale-110 group-hover:rotate-3
                  transition-transform duration-500
                "
              >
                🇰🇷
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Korean Quiz</h3>
              <p className="text-slate-500 leading-relaxed">
                Test your knowledge of Korean culture, history, and everyday life.
              </p>
            </div>

            {/* Image Quiz Card */}
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
                  bg-gradient-to-br from-cyan-500 to-teal-600
                  text-white text-xl
                  shadow-[0_4px_16px_rgba(6,182,212,0.3)]
                  group-hover:scale-110 group-hover:rotate-3
                  transition-transform duration-500
                "
              >
                🖼️
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Image Quiz</h3>
              <p className="text-slate-500 leading-relaxed">
                Learn Korean vocabulary through real photos and visual context.
              </p>
            </div>

            {/* Speech Quiz Card */}
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
                  bg-gradient-to-br from-indigo-500 to-purple-600
                  text-white text-xl
                  shadow-[0_4px_16px_rgba(99,102,241,0.3)]
                  group-hover:scale-110 group-hover:rotate-3
                  transition-transform duration-500
                "
              >
                🎧
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Speech Quiz</h3>
              <p className="text-slate-500 leading-relaxed">
                Listen to Korean words and pick the correct answer to train your ear.
              </p>
            </div>

            {/* Scene Practice Card */}
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
                  bg-gradient-to-br from-emerald-500 to-teal-600
                  text-white text-xl
                  shadow-[0_4px_16px_rgba(16,185,129,0.3)]
                  group-hover:scale-110 group-hover:rotate-3
                  transition-transform duration-500
                "
              >
                🎬
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Scene Practice</h3>
              <p className="text-slate-500 leading-relaxed">
                Practice Korean in real-life situations like hospitals, banks, and shopping.
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl mb-1">🎮</div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">7</div>
                <p className="text-slate-400 text-sm font-medium">Quiz Modes</p>
              </div>
              <div>
                <div className="text-2xl mb-1">🔤</div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">24</div>
                <p className="text-slate-400 text-sm font-medium">Jamo Questions</p>
              </div>
              <div>
                <div className="text-2xl mb-1">📚</div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">999+</div>
                <p className="text-slate-400 text-sm font-medium">Vocabulary Words</p>
              </div>
              <div>
                <div className="text-2xl mb-1">🖼️</div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">600+</div>
                <p className="text-slate-400 text-sm font-medium">Image Quizzes</p>
              </div>
              <div>
                <div className="text-2xl mb-1">🎧</div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">300</div>
                <p className="text-slate-400 text-sm font-medium">Speech Audio</p>
              </div>
              <div>
                <div className="text-2xl mb-1">🎬</div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">300+</div>
                <p className="text-slate-400 text-sm font-medium">Scene Categories</p>
              </div>
              <div>
                <div className="text-2xl mb-1">💼</div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">200+</div>
                <p className="text-slate-400 text-sm font-medium">Interview Prompts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-12 text-center">
        <p className="text-slate-400 text-sm">
          © 2026 Korean for Work. Made with 💙 for language learners.
        </p>
      </footer>
    </main>
  );
}
